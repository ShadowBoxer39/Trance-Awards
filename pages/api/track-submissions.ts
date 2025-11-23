// pages/api/track-submissions.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // 1. Security Check: Admin Key
  const key = (req.query.key as string) || "";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    // 2. Fetch all submissions, ordering by unapproved first, then by date (newest first)
    const { data, error } = await supabase
      .from("track_of_the_week_submissions")
      .select("*") 
      .order('is_approved', { ascending: true }) // Not approved tracks appear first
      .order('created_at', { ascending: false }); // Newest tracks appear at the top of the unapproved list

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      submissions: data || [],
    });
  } catch (e) {
    console.error("track-submissions fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
