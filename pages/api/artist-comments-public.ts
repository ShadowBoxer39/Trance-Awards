// pages/api/artist-comments-public.ts - WITH SUPABASE
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artistId } = req.query;

    if (!artistId || typeof artistId !== "string") {
      return res.status(400).json({ error: "Missing artistId" });
    }

    // Fetch comments from database, ordered by newest first
    const { data, error } = await supabase
      .from("featured_artist_comments")
      .select("id, name, text, created_at")
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase error fetching comments:", error);
      return res.status(500).json({ error: "Failed to fetch comments" });
    }

    // Format comments for frontend
    const comments = data.map((comment) => ({
      id: comment.id,
      name: comment.name,
      text: comment.text,
      timestamp: comment.created_at,
    }));

    return res.status(200).json({
      success: true,
      comments: comments,
    });
  } catch (error) {
    console.error("Error in artist-comments-public API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
