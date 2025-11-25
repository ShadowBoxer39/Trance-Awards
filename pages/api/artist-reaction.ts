// pages/api/artist-reaction.ts - WITH SUPABASE
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
      const { artistId } = req.query;

      if (!artistId || typeof artistId !== "string") {
        return res.status(400).json({ error: "Missing artistId" });
      }

      const { data, error } = await supabase
        .from("featured_artist_reactions")
        .select("fire, mind_blown, cool, heart")
        .eq("artist_id", artistId)
        .single();

      if (error) {
        console.error("Supabase error fetching reactions:", error);
        return res.status(500).json({ error: "Failed to fetch reactions" });
      }

      return res.status(200).json({
        success: true,
        reactions: {
          fire: data.fire || 0,
          mind_blown: data.mind_blown || 0,
          cool: data.cool || 0,
          heart: data.heart || 0,
        },
      });
    } catch (error) {
      console.error("Error in artist-reaction GET:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST - Add a reaction
  if (req.method === "POST") {
    try {
      const { artistId, reactionType } = req.body;

      if (!artistId || !reactionType) {
        return res.status(400).json({ error: "Missing artistId or reactionType" });
      }

      // Valid reaction types
      const validReactions = ["fire", "mind_blown", "cool", "heart"];
      if (!validReactions.includes(reactionType)) {
        return res.status(400).json({ error: "Invalid reaction type" });
      }

      // Use the increment function
      const { data, error } = await supabase.rpc("increment_artist_reaction", {
        p_artist_id: artistId,
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
      console.error("Error in artist-reaction POST:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
