// pages/api/artist-comment.ts - WITH SUPABASE
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // POST - Add a new comment
  if (req.method === "POST") {
    try {
      const { artistId, comment } = req.body;

      if (!artistId || !comment || !comment.name || !comment.text) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate comment length
      if (comment.name.length > 50 || comment.text.length > 500) {
        return res.status(400).json({ error: "Comment too long" });
      }

      // Insert comment into database
      const { data, error } = await supabase
        .from("featured_artist_comments")
        .insert({
          artist_id: artistId,
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
      console.error("Error in artist-comment POST:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // DELETE - Remove a comment (requires admin key)
  if (req.method === "DELETE") {
    try {
      const { commentId, adminKey } = req.body;

      // Verify admin key
      if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      if (!commentId) {
        return res.status(400).json({ error: "Missing commentId" });
      }

      const { error } = await supabase
        .from("featured_artist_comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        console.error("Supabase error deleting comment:", error);
        return res.status(500).json({ error: "Failed to delete comment" });
      }

      return res.status(200).json({
        success: true,
        message: "Comment deleted",
      });
    } catch (error) {
      console.error("Error in artist-comment DELETE:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
