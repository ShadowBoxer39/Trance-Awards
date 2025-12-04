import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const {
      type,
      questionText,
      imageUrl,
      youtubeUrl,
      youtubeStartSeconds,
      youtubeDurationSeconds,
      acceptedArtists,
      acceptedTracks,
      acceptedAnswers,
      hintText,
      contributorId,
      adminKey,
    } = req.body;

    // Validate type
    if (!type || !["snippet", "trivia"].includes(type)) {
      return res.status(400).json({ ok: false, error: "invalid_type" });
    }

    // Validate required fields based on type
    if (type === "snippet") {
      if (!youtubeUrl || !acceptedArtists?.length || !acceptedTracks?.length) {
        return res.status(400).json({ ok: false, error: "missing_snippet_fields" });
      }
    } else {
      if (!questionText || !acceptedAnswers?.length) {
        return res.status(400).json({ ok: false, error: "missing_trivia_fields" });
      }
    }

    // Check if admin (auto-approve) or contributor (pending)
   // Check if admin (auto-approve) or contributor (pending)
const isAdmin = (adminKey === process.env.ADMIN_KEY);
const status = isAdmin ? "approved" : "pending";
console.log("Add question - adminKey received:", adminKey, "isAdmin:", isAdmin);
    // Insert question
    const { data: question, error: insertError } = await supabase
      .from("quiz_questions")
      .insert({
        type,
        question_text: questionText || null,
        image_url: imageUrl || null,
        youtube_url: youtubeUrl || null,
        youtube_start_seconds: youtubeStartSeconds || 0,
        youtube_duration_seconds: youtubeDurationSeconds || 10,
        accepted_artists: acceptedArtists || null,
        accepted_tracks: acceptedTracks || null,
        accepted_answers: acceptedAnswers || null,
        hint_text: hintText || null,
        contributor_id: contributorId || null,
        status,
        approved_at: isAdmin ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return res.status(200).json({
      ok: true,
      question,
      status,
    });

  } catch (error) {
    console.error("Add question error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
