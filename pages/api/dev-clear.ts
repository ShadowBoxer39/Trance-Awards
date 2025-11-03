// pages/api/dev-clear.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { key, ip_hash, season } = req.body || {};
  if (key !== process.env.AdminKey) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const q = supabase.from("votes").delete();

  if (season) q.eq("season", season);
  if (ip_hash) q.eq("ip_hash", ip_hash);

  const { data, error } = await q.select("id"); // <- no options here

  if (error) return res.status(500).json({ error: error.message });

  const deleted = data?.length ?? 0;
  return res.json({ deleted });
}
