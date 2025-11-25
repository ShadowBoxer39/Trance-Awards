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

    // Insert comment into database
    const { data, error } = await supabase
      .from("track_of_the_week_comments")
      .insert({
        track_id: trackId,
        name: comment.name.trim(),
        text: comment.text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error inserting comment:", error);
      return res.status(500).json({ error: "Failed to save comment" });
    }

    return res.status(200).json({
      success: true,
      comment: {
        id: data.id,
        name: data.name,
        text: data.text,
        timestamp: data.created_at,
      },
    });
  } catch (error) {
    console.error("Error in track-comment POST:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
