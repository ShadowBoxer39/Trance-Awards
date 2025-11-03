// pages/api/dev-clear.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string, // service key required to bypass RLS
  { auth: { persistSession: false } }
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { key, mode, ip_hash, ballot_hash } = req.body || {};

  // simple admin guard
  if (!key || key !== process.env.AdminKey) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  let q = supabase.from("votes").delete();

  if (mode === "all") {
    // Supabase requires *some* WHERE; this deletes all safely
    q = q.neq("id", "00000000-0000-0000-0000-000000000000");
  } else if (mode === "by_ip" && ip_hash) {
    q = q.eq("ip_hash", ip_hash);
  } else if (mode === "by_ballot" && ballot_hash) {
    q = q.eq("ballot_hash", ballot_hash);
  } else {
    return res.status(400).json({ ok: false, error: "missing_or_invalid_filter" });
  }

  // ask Supabase to return only the count of deleted rows
  const { error, count } = await q.select("id", { count: "exact", head: true });

  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
  return res.json({ ok: true, deleted: count ?? 0 });
}
