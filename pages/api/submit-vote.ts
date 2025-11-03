// pages/api/submit-vote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";
import crypto from "crypto";

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const body = req.body ?? {};
    const selections = (body as any).selections;

    if (!selections || typeof selections !== "object") {
      return res.status(400).json({ ok: false, error: "invalid_payload" });
    }

    // Basic fingerprinting (hashed for privacy)
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";
    const ua = (req.headers["user-agent"] as string) || "";
    const ip_hash = ip ? sha256(ip) : null;
    const ballot_hash = sha256(JSON.stringify(selections));

    // Server-side dedup:
    // 1) If this IP already has a vote, reject (one vote per IP).
    if (ip_hash) {
      const { data: prior, error: priorErr } = await supabase
        .from("votes")
        .select("id, created_at")
        .eq("ip_hash", ip_hash)
        .limit(1)
        .maybeSingle();

      if (priorErr) {
        console.error("prior check error:", priorErr);
        return res.status(500).json({ ok: false, error: "db_error" });
      }

      if (prior) {
        return res.status(409).json({ ok: false, error: "already_voted" });
      }
    }

    // 2) (Optional) Prevent immediate double submit of identical ballot payload
    //    regardless of IP. This still allows two different people to pick the same
    //    answers later since we don't use a UNIQUE constraint, just a quick check.
    const { data: dup, error: dupErr } = await supabase
      .from("votes")
      .select("id")
      .eq("ballot_hash", ballot_hash)
      .limit(1)
      .maybeSingle();

    if (dupErr) {
      console.error("dup check error:", dupErr);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    if (dup) {
      return res.status(409).json({ ok: false, error: "duplicate_ballot" });
    }

    // Insert the vote
    const { error } = await supabase.from("votes").insert({
      ip_hash,
      ua,
      ballot_hash,
      selections, // JSONB
    });

    if (error) {
      console.error("DB insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error", details: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("submit-vote server error:", e);
    return res.status(500).json({ ok: false, error: "server_error", details: e?.message });
  }
}
