// pages/api/track-comment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { trackId, comment } = req.body;

    if (!trackId || !comment || !comment.name || !comment.text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate comment length
    if (comment.name.length > 50 || comment.text.length > 500) {
      return res.status(400).json({ error: "Comment too long" });
    }

    // Get current track
    const { data: track, error: fetchError } = await supabase
      .from("track_of_the_week_submissions")
      .select("comments")
      .eq("id", trackId)
      .single();

    if (fetchError) {
      console.error("Error fetching track:", fetchError);
      return res.status(500).json({ error: "Failed to fetch track" });
    }

    // Add new comment to array
    const currentComments = track?.comments || [];
    const updatedComments = [comment, ...currentComments];

    // Save to database
    const { error: updateError } = await supabase
      .from("track_of_the_week_submissions")
      .update({ comments: updatedComments })
      .eq("id", trackId);

    if (updateError) {
      console.error("Error updating comments:", updateError);
      return res.status(500).json({ error: "Failed to save comment" });
    }

    return res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Error in track-comment API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
