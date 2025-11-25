// pages/api/artist-reaction.ts
import type { NextApiRequest, NextApiResponse } from "next";

// For now, storing in memory (can be moved to Supabase later)
let artistReactions: Record<string, any> = {
  kanok: {
    fire: 0,
    mind_blown: 0,
    cool: 0,
    heart: 0,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    // Initialize if doesn't exist
    if (!artistReactions[artistId]) {
      artistReactions[artistId] = {
        fire: 0,
        mind_blown: 0,
        cool: 0,
        heart: 0,
      };
    }

    // Increment reaction
    artistReactions[artistId][reactionType]++;

    return res.status(200).json({
      success: true,
      reactions: artistReactions[artistId],
    });
  } catch (error) {
    console.error("Error in artist-reaction API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
