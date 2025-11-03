// pages/api/submit-vote.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import supabase from "../../lib/supabaseServer";

function getClientIP(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const real = (req.headers["x-real-ip"] as string) || "";
  return xf.split(",")[0]?.trim() || real || (req.socket?.remoteAddress || "") || "0.0.0.0";
}

function hashIP(ip: string, pepper: string) {
  return crypto.createHash("sha256").update(ip + "|" + pepper).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  try {
    const { selections } = req.body || {};
    if (!selections || typeof selections !== "object") {
      return res.status(400).json({ ok: false, error: "bad_request" });
    }

    const season = "2025"; // change here next year if you want
    const ip = getClientIP(req);
    const pepper = process.env.VOTE_PEPPER || "dev-pepper";
    const ip_hash = hashIP(ip, pepper);
    const ua = req.headers["user-agent"] || "";

    const { error } = await supabase.from("votes").insert([
      {
        season,     // new column we added
        ip_hash,    // hashed IP
        ua,         // your existing column name
        selections, // jsonb ballot
      },
    ]);

    if (error) {
      // Postgres duplicate key
      if ((error as any)?.code === "23505") {
        return res.status(409).json({ ok: false, error: "duplicate_vote" });
      }
      console.error("insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("submit-vote server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
