// pages/api/submit-track-of-week.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // Using your exported server client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const { name, photo_url, track_title, youtube_url, description } = req.body;

  // Basic validation (must have these fields)
  if (!name || !youtube_url || !description) {
    return res.status(400).json({ ok: false, error: "missing_required_fields" });
  }

  // --- Input Validation: Ensure YouTube URL is valid ---
  if (!youtube_url.includes('youtube.com') && !youtube_url.includes('youtu.be')) {
      return res.status(400).json({ ok: false, error: "invalid_youtube_url" });
  }

  try {
    const { error } = await supabase
      .from("track_of_the_week_submissions") // Your new table name
      .insert([
        {
          name: name,
          photo_url: photo_url || null,
          track_title: track_title || 'No Title Provided',
          youtube_url: youtube_url,
          description: description,
          is_approved: false, // Default to FALSE for admin review
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    return res.status(200).json({ ok: true, message: "Submission successful. Awaiting review." });
  } catch (e) {
    console.error("submit-track-of-week server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
