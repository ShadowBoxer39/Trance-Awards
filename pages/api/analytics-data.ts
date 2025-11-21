// pages/api/analytics-data.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Security Check: Ensure only authorized users can access this data
  const key = (req.query.key as string) || "";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    // Fetch all columns from the new 'site_visits' table
    const { data, error } = await supabase
      .from("site_visits")
      .select("*") 
      .order("timestamp", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      visits: data || [],
    });
  } catch (e) {
    console.error("analytics-data fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
