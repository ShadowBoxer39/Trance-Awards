// pages/api/artist-signups.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // Reusing the server client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  // Security check: Require ADMIN_KEY
  const key = (req.query.key as string) || "";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    // Fetch all columns from the 'young_artists' table
    // Ordering by submission time (newest first)
    const { data, error } = await supabase
      .from("young_artists")
      .select("*, id, submitted_at") // Select all, and ensure id/submitted_at are included
      .order("submitted_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      signups: data || [],
    });
  } catch (e) {
    console.error("artist-signups server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
