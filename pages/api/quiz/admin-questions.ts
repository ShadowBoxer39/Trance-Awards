import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const adminKey = req.query.key as string;
  const filter = req.query.filter as string || "pending";

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    let query = supabase
      .from("quiz_questions")
      .select(`
        id,
        type,
        question_text,
        image_url,
        youtube_url,
        youtube_start_seconds,
        youtube_duration_seconds,
        accepted_artists,
        accepted_tracks,
        accepted_answers,
        status,
        created_at,
        contributor:quiz_contributors(name, photo_url)
      `)
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("status", "pending");
    } else if (filter === "approved") {
      query = query.eq("status", "approved");
    }
    // "all" = no filter

    const { data: questions, error } = await query.limit(100);

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      questions: questions || [],
    });

  } catch (error) {
    console.error("Admin questions error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
