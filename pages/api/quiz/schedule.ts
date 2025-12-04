import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminKey = req.query.key || req.body?.key;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  // GET - View schedule
  if (req.method === "GET") {
    // (Keep your existing GET logic, it was fine, just ensure fields match new requirement)
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      
      const { data: schedule, error: scheduleError } = await supabase
        .from("quiz_schedule")
        .select(`
          id,
          scheduled_for,
          type,
          is_active,
          question:quiz_questions(
            id,
            type,
            question_text,
            youtube_url,
            status,
            accepted_artists,
            accepted_tracks,
            contributor:quiz_contributors(name)
          )
        `)
        .gte("scheduled_for", today)
        .order("scheduled_for", { ascending: true })
        .limit(14);

      if (scheduleError) throw scheduleError;

      const { data: availableQuestions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select(`id, type, question_text, youtube_url, created_at, contributor:quiz_contributors(name)`)
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;

      return res.status(200).json({ ok: true, schedule: schedule || [], availableQuestions: availableQuestions || [] });

    } catch (error) {
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }

  // POST - Schedule actions
  if (req.method === "POST") {
    try {
      const { action, questionId, date, type } = req.body;

      if (action === "schedule" && questionId && date) {
        // (Your existing manual schedule logic is fine)
        const { data: existing } = await supabase.from("quiz_schedule").select("id").eq("scheduled_for", date).single();
        if (existing) {
          await supabase.from("quiz_schedule").update({ question_id: questionId }).eq("id", existing.id);
        } else {
          await supabase.from("quiz_schedule").insert({ question_id: questionId, scheduled_for: date, type: type || "snippet", is_active: false });
        }
        return res.status(200).json({ ok: true, action: "scheduled" });
      }

      if (action === "auto-fill") {
        // (Your existing auto-fill logic is fine)
        const today = new Date();
        const dates: { date: string; type: "snippet" | "trivia" }[] = [];
        for (let i = 0; i < 14; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dayOfWeek = checkDate.getDay();
          if (dayOfWeek === 1) dates.push({ date: checkDate.toLocaleDateString("en-CA"), type: "snippet" });
          else if (dayOfWeek === 4) dates.push({ date: checkDate.toLocaleDateString("en-CA"), type: "trivia" });
        }

        const { data: snippetQuestions } = await supabase.from("quiz_questions").select("id").eq("type", "snippet").eq("status", "approved");
        const { data: triviaQuestions } = await supabase.from("quiz_questions").select("id").eq("type", "trivia").eq("status", "approved");
        const { data: existingSchedule } = await supabase.from("quiz_schedule").select("question_id, scheduled_for").gte("scheduled_for", today.toLocaleDateString("en-CA"));

        const scheduledDates = new Set(existingSchedule?.map(s => s.scheduled_for));
        const scheduledQuestionIds = new Set(existingSchedule?.map(s => s.question_id));
        const snippetPool = snippetQuestions?.filter(q => !scheduledQuestionIds.has(q.id)) || [];
        const triviaPool = triviaQuestions?.filter(q => !scheduledQuestionIds.has(q.id)) || [];

        let sIdx = 0, tIdx = 0;
        const toInsert: any[] = [];

        for (const { date, type } of dates) {
          if (scheduledDates.has(date)) continue;
          let qId = null;
          if (type === "snippet" && snippetPool[sIdx]) qId = snippetPool[sIdx++].id;
          else if (type === "trivia" && triviaPool[tIdx]) qId = triviaPool[tIdx++].id;
          
          if (qId) toInsert.push({ question_id: qId, scheduled_for: date, type, is_active: false });
        }

        if (toInsert.length > 0) await supabase.from("quiz_schedule").insert(toInsert);
        return res.status(200).json({ ok: true, action: "auto-filled", scheduled: toInsert.length });
      }

      // --- FIXED ACTIVATE TODAY LOGIC ---
      if (action === "activate-today") {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

        // 1. Check if there IS a quiz scheduled for today
        const { data: todaysQuiz } = await supabase
          .from("quiz_schedule")
          .select("id")
          .eq("scheduled_for", today)
          .single();

        // 2. Only if today has a quiz, we flip the switch
        if (todaysQuiz) {
          // Deactivate all others
          await supabase.from("quiz_schedule").update({ is_active: false }).neq("id", todaysQuiz.id);
          
          // Activate today's
          await supabase.from("quiz_schedule").update({ is_active: true, previous_answer_revealed: true }).eq("id", todaysQuiz.id);
          
          return res.status(200).json({ ok: true, action: "activated_new_quiz" });
        } else {
          // No quiz for today? Do nothing (keep yesterday's active)
          return res.status(200).json({ ok: true, action: "no_quiz_today_kept_existing" });
        }
      }

      return res.status(400).json({ ok: false, error: "invalid_action" });
    } catch (error) {
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }
  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
