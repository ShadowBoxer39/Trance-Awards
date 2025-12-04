import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { userId, adminKey, type, ...data } = req.body;

    let contributorId = null;
    let status = "pending";

    // Scenario 1: Admin submission (via Admin Panel)
    if (adminKey === process.env.ADMIN_KEY) {
      status = "approved"; // Admin submissions are auto-approved
      // Optional: Set contributorId to a generic 'Admin' user if you have one, or keep null
    } 
    // Scenario 2: Contributor submission
    else if (userId) {
      // Verify user is a contributor
      const { data: contributor, error: contributorError } = await supabase
        .from("quiz_contributors")
        .select("id, is_active")
        .eq("user_id", userId)
        .single();

      if (contributorError || !contributor || !contributor.is_active) {
        return res.status(403).json({ error: "not_contributor" });
      }
      contributorId = contributor.id;
    } 
    else {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Insert Question
    const insertData: any = {
      type,
      status, 
      contributor_id: contributorId,
      created_at: new Date().toISOString(),
    };

    if (type === "snippet") {
      insertData.youtube_url = data.youtubeUrl;
      insertData.youtube_start_seconds = data.youtubeStartSeconds;
      insertData.youtube_duration_seconds = data.youtubeDurationSeconds;
      insertData.accepted_artists = data.acceptedArtists;
      insertData.accepted_tracks = data.acceptedTracks;
    } else {
      insertData.question_text = data.questionText;
      insertData.image_url = data.imageUrl || null;
      insertData.accepted_answers = data.acceptedAnswers;
    }

    const { error: insertError } = await supabase
      .from("quiz_questions")
      .insert(insertData);

    if (insertError) throw insertError;

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
