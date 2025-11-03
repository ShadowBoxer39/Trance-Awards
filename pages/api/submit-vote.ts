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
    const selections = (req.body && (req.body as any).selections) || null;
    if (!selections || typeof selections !== "object") {
      return res.status(400).json({ ok: false, error: "invalid_payload" });
    }

    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";
    const ua = (req.headers["user-agent"] as string) || "";
    const ip_hash = ip ? sha256(ip) : null;

    const { error } = await supabase.from("votes").insert({ ip_hash, ua, selections });
    if (error) {
      console.error("insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("submit-vote error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
