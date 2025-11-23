// pages/api/approve-track.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // Using your exported server client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { key, trackId } = req.body;

  // 1. Security Check: Admin Key
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  if (!trackId) {
    return res.status(400).json({ ok: false, error: "missing_track_id" });
  }

  try {
    // 2. Step A: De-activate all current approved tracks (ensuring only one is active)
    const { error: resetError } = await supabase
      .from('track_of_the_week_submissions')
      .update({ is_approved: false })
      .eq('is_approved', true);

    if (resetError) {
        console.error("Supabase reset error (non-fatal):", resetError);
        // Continue even if reset fails, but log the error
    }

    // 3. Step B: Activate the selected track
    const { error: approveError, data: approvedData } = await supabase
      .from('track_of_the_week_submissions')
      .update({ is_approved: true })
      .eq('id', trackId)
      .select();

    if (approveError) {
      console.error("Supabase approve error:", approveError);
      return res.status(500).json({ ok: false, error: "db_error_approve" });
    }

    if (!approvedData || approvedData.length === 0) {
        return res.status(404).json({ ok: false, error: "track_not_found" });
    }

    return res.status(200).json({ ok: true, message: `Track ${trackId} approved.` });
  } catch (e) {
    console.error("approve-track server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
