// pages/api/artist-comments-public.ts
import type { NextApiRequest, NextApiResponse } from "next";

// Import the same storage as artist-comment.ts
// In a real implementation, this would be in Supabase
let artistComments: Record<string, any[]> = {
  kanok: [],
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artistId } = req.query;

    if (!artistId || typeof artistId !== "string") {
      return res.status(400).json({ error: "Missing artistId" });
    }

    const comments = artistComments[artistId] || [];

    return res.status(200).json({
      success: true,
      comments: comments.slice(0, 10), // Return max 10 most recent comments
    });
  } catch (error) {
    console.error("Error in artist-comments-public API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
