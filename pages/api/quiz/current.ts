// pages/api/quiz/current.ts - UPDATED for secure audio streaming
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";
import { obfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
    const dayOfWeek = new Date().toLocaleDateString("en-US", { timeZone: "Asia/Jerusalem", weekday: "long" });
    const userId = req.query.userId as string | undefined;

    // 1. Fetch Active Schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("quiz_schedule")
      .select(`
        id, scheduled_for, type, is_active, previous_answer_revealed,
        question:quiz_questions(
          id, type, question_text, image_url, youtube_url,
          youtube_start_seconds, youtube_duration_seconds, audio_url,
          accepted_artists, accepted_tracks, accepted_answers,
          contributor:quiz_contributors(name, photo_url)
        )
      `)
      .lte("scheduled_for", today)
      .eq("is_active", true)
      .order("scheduled_for", { ascending: false })
      .limit(1)
      .single();

    if (scheduleError || !schedule) {
      const nextDay = ["Monday", "Thursday"].includes(dayOfWeek) ? null : "Soon";
      return res.status(200).json({ 
        ok: true, 
        quiz: null, 
        message: "no_active_quiz", 
        nextQuizDay: nextDay 
      });
    }

    // 2. Previous Answer Logic
    let previousAnswer = null;
    if (schedule.previous_answer_revealed) {
      const { data: prev } = await supabase
        .from("quiz_schedule")
        .select(`
          question:quiz_questions(
            type, question_text, 
            accepted_artists, accepted_tracks, accepted_answers, 
            contributor:quiz_contributors(name, photo_url)
          )
        `)
        .lt("scheduled_for", schedule.scheduled_for)
        .order("scheduled_for", { ascending: false })
        .limit(1)
        .single();
        
      if (prev?.question) {
        const q = prev.question as any;
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

    // 3. Attempts Logic
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() 
               || req.socket.remoteAddress 
               || "unknown";
    const questionId = (schedule.question as any).id;
    
    const { data: attempts } = await supabase
      .from("quiz_attempts")
      .select("attempt_number, is_correct, artist_answer, track_answer, answer")
      .eq("question_id", questionId)
      .eq("ip_address", ip)
      .order("attempt_number", { ascending: true });
    
    const attemptsUsed = attempts?.length || 0;
    const hasCorrectAnswer = attempts?.some(a => a.is_correct) || false;

    // 4. Score Saved Logic
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

    // 5. SECURE AUDIO URL GENERATION
    // ═══════════════════════════════════════════════════════════════════
    // This is the KEY security feature:
    // - We NEVER send the raw YouTube URL to the client
    // - Instead, we encrypt the video ID and generate a proxy URL
    // - The client can only access audio through our server
    // ═══════════════════════════════════════════════════════════════════
    
    const rawYoutubeUrl = (schedule.question as any).youtube_url;
    const existingAudioUrl = (schedule.question as any).audio_url;
    let secureAudioUrl: string | null = null;

    // If there's a pre-set audio_url in the database, use it
    // (This could be a direct audio file URL you've uploaded)
    if (existingAudioUrl) {
      secureAudioUrl = existingAudioUrl;
    } 
    // Otherwise, generate a secure proxy URL from the YouTube link
    else if (rawYoutubeUrl) {
      // Extract video ID from various YouTube URL formats
      const videoIdRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = rawYoutubeUrl.match(videoIdRegex);
      const videoId = (match && match[2].length === 11) ? match[2] : null;
      
      if (videoId) {
        // ENCRYPT the video ID - this is the security magic!
        const encryptedId = obfuscateId(videoId);
        
        if (encryptedId) {
          // Generate the proxy URL
          // The client will call /api/quiz/stream?id=ENCRYPTED_ID
          // They cannot see or guess the real video ID
          secureAudioUrl = `/api/quiz/stream?id=${encodeURIComponent(encryptedId)}`;
        }
      }
    }

    // 6. Build the response
    // IMPORTANT: We do NOT send youtube_url to the client!
    return res.status(200).json({
      ok: true,
      quiz: {
        id: questionId,
        type: (schedule.question as any).type, 
        questionText: (schedule.question as any).question_text,
        imageUrl: (schedule.question as any).image_url,
        
        // SECURE: Only send the proxy URL, never the YouTube URL
        audioUrl: secureAudioUrl,
        
        // These are safe - they're just numbers for playback timing
        youtubeStart: (schedule.question as any).youtube_start_seconds,
        youtubeDuration: (schedule.question as any).youtube_duration_seconds,
        
        // Contributor info is public
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
