// pages/api/artist-comment.ts
import type { NextApiRequest, NextApiResponse } from "next";

// For now, storing in memory (can be moved to Supabase later)
let artistComments: Record<string, any[]> = {
  kanok: [],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artistId, comment } = req.body;

    if (!artistId || !comment || !comment.name || !comment.text) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate comment length
    if (comment.name.length > 50 || comment.text.length > 500) {
      return res.status(400).json({ error: "Comment too long" });
    }

    // Initialize if doesn't exist
    if (!artistComments[artistId]) {
      artistComments[artistId] = [];
    }

    // Add comment to array
    artistComments[artistId].unshift(comment);

    return res.status(200).json({ success: true, comment });
  } catch (error) {
    console.error("Error in artist-comment API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
