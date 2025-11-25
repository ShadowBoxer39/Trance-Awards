// pages/api/track-comment.ts - WITH SUPABASE
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient( 
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET - Fetch comments for a track
  if (req.method === "GET") {
    try {
      const { trackId } = req.query;

      if (!trackId) {
        return res.status(400).json({ error: "Missing trackId" });
      }

      const trackIdNum = parseInt(trackId as string);

      const { data, error } = await supabase
        .from("track_of_the_week_comments")
        .select("id, name, text, created_at")
        .eq("track_id", trackIdNum)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Supabase error fetching comments:", error);
        return res.status(500).json({ error: "Failed to fetch comments" });
      }

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
      console.error("Error in track-comment GET:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  // POST - Add a new comment
  if (req.method === "POST") {
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
        .from("track_of_the_week_comments")
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
      console.error("Error in track-comment DELETE:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
