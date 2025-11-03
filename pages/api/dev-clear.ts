// pages/api/dev-clear.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";
import crypto from "crypto";

function getClientIP(req: NextApiRequest): string {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const real = (req.headers["x-real-ip"] as string) || "";
  return xf.split(",")[0]?.trim() || real || (req.socket?.remoteAddress || "") || "";
}
function hashIP(ip: string, pepper: string) {
  return crypto.createHash("sha256").update(ip + "|" + pepper).digest("hex");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = (req.query.key as string) || "";
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const season = "2025"; // same season you use in submit-vote
  const pepper = process.env.VOTE_PEPPER || "dev-pepper";
  const ip = getClientIP(req);
  if (!ip) return res.status(400).json({ ok: false, error: "no_ip" });

  const ip_hash = hashIP(ip, pepper);

  const { error, count } = await supabase
    .from("votes")
    .delete()
    .eq("season", season)
    .eq("ip_hash", ip_hash)
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("dev-clear error:", error);
    return res.status(500).json({ ok: false, error: "db_error" });
  }

  return res.status(200).json({ ok: true, cleared: count || 0 });
}
