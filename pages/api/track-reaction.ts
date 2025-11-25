// pages/api/track-reaction.ts - WITH SUPABASE
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Fetch current reactions
  if (req.method === "GET") {
    try {
      const { trackId } = req.query;

      if (!trackId) {
        return res.status(400).json({ error: "Missing trackId" });
      }

      const trackIdNum = parseInt(trackId as string);

      const { data, error } = await supabase
        .from("track_of_the_week_reactions")
        .select("fire, mind_blown, cool, not_feeling_it")
        .eq("track_id", trackIdNum)
        .single();

      if (error) {
        // If no reactions yet, return zeros
        if (error.code === "PGRST116") {
          return res.status(200).json({
            success: true,
            reactions: {
              fire: 0,
              mind_blown: 0,
              cool: 0,
              not_feeling_it: 0,
            },
          });
        }
        console.error("Supabase error fetching reactions:", error);
        return res.status(500).json({ error: "Failed to fetch reactions" });
      }

      return res.status(200).json({
        success: true,
        reactions: {
          fire: data.fire || 0,
          mind_blown: data.mind_blown || 0,
          cool: data.cool || 0,
          not_feeling_it: data.not_feeling_it || 0,
        },
      });
    } catch (error) {
      console.error("Error in track-reaction GET:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST - Add a reaction
  if (req.method === "POST") {
    try {
      const { trackId, reactionType } = req.body;

      if (!trackId || !reactionType) {
        return res.status(400).json({ error: "Missing trackId or reactionType" });
      }

      // Valid reaction types
      const validReactions = ["fire", "mind_blown", "cool", "not_feeling_it"];
      if (!validReactions.includes(reactionType)) {
        return res.status(400).json({ error: "Invalid reaction type" });
      }

      // Use the increment function
      const { data, error } = await supabase.rpc("increment_track_reaction", {
        p_track_id: trackId,
        p_reaction_type: reactionType,
      });

      if (error) {
        console.error("Supabase error incrementing reaction:", error);
        return res.status(500).json({ error: "Failed to save reaction" });
      }

      return res.status(200).json({
        success: true,
        reactions: data,
      });
    } catch (error) {
      console.error("Error in track-reaction POST:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
