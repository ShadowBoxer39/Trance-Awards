import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
    const dayOfWeek = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Jerusalem", weekday: "long" });
    const userId = req.query.userId as string | undefined;

    // Fetch the latest active quiz
    const { data: schedule, error: scheduleError } = await supabase
      .from("quiz_schedule")
      .select(`
        id,
        scheduled_for,
        type,
        is_active,
        previous_answer_revealed,
        question:quiz_questions(
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
          contributor:quiz_contributors(name, photo_url)
        )
      `)
      .lte("scheduled_for", today)
      .eq("is_active", true)
      .order("scheduled_for", { ascending: false })
      .limit(1)
      .single();

    if (scheduleError || !schedule) {
      return res.status(200).json({
        ok: true,
        quiz: null,
        message: "no_active_quiz",
        nextQuizDay: ["Monday", "Thursday"].includes(dayOfWeek) ? null : "Soon"
      });
    }

    // Get previous answer if revealed
    let previousAnswer = null;
    if (schedule.previous_answer_revealed) {
      const { data: prevSchedule } = await supabase
        .from("quiz_schedule")
        .select(`
          question:quiz_questions(
            type,
            question_text,
            accepted_artists,
            accepted_tracks,
            accepted_answers,
            contributor:quiz_contributors(name, photo_url)
          )
        `)
        .lt("scheduled_for", schedule.scheduled_for)
        .order("scheduled_for", { ascending: false })
        .limit(1)
        .single();

      if (prevSchedule?.question) {
        const q = prevSchedule.question as any;
        previousAnswer = {
          type: q.type,
          question: q.question_text,
          answer: q.type === "snippet" 
            ? { artist: q.accepted_artists?.[0], track: q.accepted_tracks?.[0] }
            : q.accepted_answers?.[0],
          contributor: q.contributor
        };
      }
    }

    // Get attempts by IP
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const questionId = (schedule.question as any).id;

    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("attempt_number, is_correct, artist_answer, track_answer, answer")
      .eq("question_id", questionId)
      .eq("ip_address", ip)
      .order("attempt_number", { ascending: true });

    const attemptsUsed = attempts?.length || 0;
    const hasCorrectAnswer = attempts?.some(a => a.is_correct) || false;

    // --- FIX: Check if score is saved based ONLY on User ID ---
    let scoreSaved = false;
    if (userId) {
      const { data: existingScore } = await supabase
        .from("quiz_scores")
        .select("id")
        .eq("user_id", userId)
        .eq("question_id", questionId)
        .single();
      
      scoreSaved = !!existingScore;
    }

    return res.status(200).json({
      ok: true,
      quiz: {
        id: questionId,
        type: schedule.type,
        questionText: (schedule.question as any).question_text,
        imageUrl: (schedule.question as any).image_url,
        youtubeUrl: (schedule.question as any).youtube_url,
        youtubeStart: (schedule.question as any).youtube_start_seconds,
        youtubeDuration: (schedule.question as any).youtube_duration_seconds,
        contributor: (schedule.question as any).contributor
      },
      attempts: {
        used: attemptsUsed,
        remaining: 3 - attemptsUsed,
        hasCorrectAnswer,
        history: attempts || []
      },
      previousAnswer,
      scoreSaved
    });

  } catch (error) {
    console.error("Quiz current error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
