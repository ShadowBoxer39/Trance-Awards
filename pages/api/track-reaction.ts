// pages/api/track-reaction.ts
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
    const { trackId, reactionType } = req.body;

    if (!trackId || !reactionType) {
      return res.status(400).json({ error: "Missing trackId or reactionType" });
    }

    // Valid reaction types
    const validReactions = ["fire", "heart", "mind_blown", "raising_hands"];
    if (!validReactions.includes(reactionType)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    // Get current track
    const { data: track, error: fetchError } = await supabase
      .from("track_of_the_week_submissions")
      .select("reactions")
      .eq("id", trackId)
      .single();

    if (fetchError) {
      console.error("Error fetching track:", fetchError);
      return res.status(500).json({ error: "Failed to fetch track" });
    }

    // Update reactions
    const currentReactions = track?.reactions || {
      fire: 0,
      heart: 0,
      mind_blown: 0,
      raising_hands: 0,
    };

    const updatedReactions = {
      ...currentReactions,
      [reactionType]: (currentReactions[reactionType] || 0) + 1,
    };

    // Save to database
    const { error: updateError } = await supabase
      .from("track_of_the_week_submissions")
      .update({ reactions: updatedReactions })
      .eq("id", trackId);

    if (updateError) {
      console.error("Error updating reactions:", updateError);
      return res.status(500).json({ error: "Failed to save reaction" });
    }

    return res.status(200).json({ success: true, reactions: updatedReactions });
  } catch (error) {
    console.error("Error in track-reaction API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
