// pages/api/approve-track.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { key, trackId } = req.body;

  // Verify admin key
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ ok: false, error: "Supabase not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // IMPORTANT: Set both is_approved AND approved_at
    // approved_at is used for sorting to determine which track is "current"
    const { data, error } = await supabase
      .from("track_of_the_week_submissions")
      .update({ 
        is_approved: true,
        approved_at: new Date().toISOString() // Set timestamp NOW
      })
      .eq("id", trackId)
      .select()
      .single();

    if (error) {
      console.error("Error approving track:", error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ 
      ok: true, 
      message: "Track approved successfully",
      track: data 
    });
  } catch (error: any) {
    console.error("Error in approve-track API:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
