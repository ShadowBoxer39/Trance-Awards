import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { questionId, artistAnswer, trackAnswer, answer } = req.body;

    if (!questionId) {
      return res.status(400).json({ ok: false, error: "missing_question_id" });
    }

    // Get IP
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() 
               || req.socket.remoteAddress 
               || "unknown";

    // Check existing attempts for this IP + question
    const { data: existingAttempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("id, attempt_number, is_correct")
      .eq("question_id", questionId)
      .eq("ip_address", ip)
      .order("attempt_number", { ascending: true });

    if (attemptsError) throw attemptsError;

    // Already answered correctly
    if (existingAttempts?.some(a => a.is_correct)) {
      return res.status(400).json({ ok: false, error: "already_correct" });
    }

    // Max attempts reached
    if (existingAttempts && existingAttempts.length >= 3) {
      return res.status(400).json({ ok: false, error: "max_attempts_reached" });
    }

    const attemptNumber = (existingAttempts?.length || 0) + 1;

    // Get question to validate answer
    const { data: question, error: questionError } = await supabase
      .from("quiz_questions")
      .select("type, accepted_artists, accepted_tracks, accepted_answers")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({ ok: false, error: "question_not_found" });
    }

    // Validate answer
    let isCorrect = false;
    
    if (question.type === "snippet") {
      const normalizedArtist = (artistAnswer || "").toLowerCase().trim();
      const normalizedTrack = (trackAnswer || "").toLowerCase().trim();
      
      const artistMatch = question.accepted_artists?.some(
        (a: string) => a.toLowerCase().trim() === normalizedArtist
      );
      const trackMatch = question.accepted_tracks?.some(
        (t: string) => t.toLowerCase().trim() === normalizedTrack
      );
      
      isCorrect = artistMatch && trackMatch;
    } else {
      const normalizedAnswer = (answer || "").toLowerCase().trim();
      isCorrect = question.accepted_answers?.some(
        (a: string) => a.toLowerCase().trim() === normalizedAnswer
      );
    }

    // Save attempt
    const { error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        question_id: questionId,
        ip_address: ip,
        attempt_number: attemptNumber,
        artist_answer: artistAnswer || null,
        track_answer: trackAnswer || null,
        answer: answer || null,
        is_correct: isCorrect,
      });

    if (insertError) throw insertError;

    // Calculate points if correct
    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = 4 - attemptNumber; // 3, 2, or 1 points
    }

    return res.status(200).json({
      ok: true,
      isCorrect,
      attemptNumber,
      attemptsRemaining: 3 - attemptNumber,
      pointsEarned,
    });

  } catch (error) {
    console.error("Quiz answer error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
