import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminKey = req.query.key || req.body?.key;
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  // GET - View schedule and available questions
  if (req.method === "GET") {
    try {
      // Get upcoming schedule
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

      // Get approved questions not yet used
      const { data: availableQuestions, error: questionsError } = await supabase
        .from("quiz_questions")
        .select(`
          id,
          type,
          question_text,
          youtube_url,
          created_at,
          contributor:quiz_contributors(name)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: true });

      if (questionsError) throw questionsError;

      return res.status(200).json({
        ok: true,
        schedule: schedule || [],
        availableQuestions: availableQuestions || [],
      });

    } catch (error) {
      console.error("Schedule GET error:", error);
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }

  // POST - Schedule a question or auto-fill schedule
  if (req.method === "POST") {
    try {
      const { action, questionId, date, type } = req.body;

      // Manual schedule
      if (action === "schedule" && questionId && date) {
        // Check if date already has a quiz
        const { data: existing } = await supabase
          .from("quiz_schedule")
          .select("id")
          .eq("scheduled_for", date)
          .single();

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from("quiz_schedule")
            .update({ question_id: questionId })
            .eq("id", existing.id);

          if (updateError) throw updateError;
        } else {
          // Insert new
          const { error: insertError } = await supabase
            .from("quiz_schedule")
            .insert({
              question_id: questionId,
              scheduled_for: date,
              type: type || "snippet",
              is_active: false,
            });

          if (insertError) throw insertError;
        }

        return res.status(200).json({ ok: true, action: "scheduled" });
      }

      // Auto-fill schedule for next 2 weeks
      if (action === "auto-fill") {
        const today = new Date();
        const dates: { date: string; type: "snippet" | "trivia" }[] = [];

        // Find next 14 days of Mondays and Thursdays
        for (let i = 0; i < 14; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dayOfWeek = checkDate.getDay();

          if (dayOfWeek === 1) { // Monday
            dates.push({
              date: checkDate.toLocaleDateString("en-CA"),
              type: "snippet",
            });
          } else if (dayOfWeek === 4) { // Thursday
            dates.push({
              date: checkDate.toLocaleDateString("en-CA"),
              type: "trivia",
            });
          }
        }

        // Get available questions by type
        const { data: snippetQuestions } = await supabase
          .from("quiz_questions")
          .select("id")
          .eq("type", "snippet")
          .eq("status", "approved");

        const { data: triviaQuestions } = await supabase
          .from("quiz_questions")
          .select("id")
          .eq("type", "trivia")
          .eq("status", "approved");

        // Get already scheduled question IDs
        const { data: existingSchedule } = await supabase
          .from("quiz_schedule")
          .select("question_id, scheduled_for")
          .gte("scheduled_for", today.toLocaleDateString("en-CA"));

        const scheduledDates = new Set(existingSchedule?.map(s => s.scheduled_for));
        const scheduledQuestionIds = new Set(existingSchedule?.map(s => s.question_id));

        const snippetPool = snippetQuestions?.filter(q => !scheduledQuestionIds.has(q.id)) || [];
        const triviaPool = triviaQuestions?.filter(q => !scheduledQuestionIds.has(q.id)) || [];

        let snippetIndex = 0;
        let triviaIndex = 0;
        const toInsert: any[] = [];

        for (const { date, type } of dates) {
          if (scheduledDates.has(date)) continue;

          let questionId = null;
          if (type === "snippet" && snippetPool[snippetIndex]) {
            questionId = snippetPool[snippetIndex].id;
            snippetIndex++;
          } else if (type === "trivia" && triviaPool[triviaIndex]) {
            questionId = triviaPool[triviaIndex].id;
            triviaIndex++;
          }

          if (questionId) {
            toInsert.push({
              question_id: questionId,
              scheduled_for: date,
              type,
              is_active: false,
            });
          }
        }

        if (toInsert.length > 0) {
          const { error: insertError } = await supabase
            .from("quiz_schedule")
            .insert(toInsert);

          if (insertError) throw insertError;
        }

        return res.status(200).json({
          ok: true,
          action: "auto-filled",
          scheduled: toInsert.length,
        });
      }

      // Activate today's quiz
      if (action === "activate-today") {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });

        // Deactivate all
        await supabase
          .from("quiz_schedule")
          .update({ is_active: false })
          .neq("scheduled_for", today);

        // Activate today and reveal previous answer
        const { error: activateError } = await supabase
          .from("quiz_schedule")
          .update({ is_active: true, previous_answer_revealed: true })
          .eq("scheduled_for", today);

        if (activateError) throw activateError;

        return res.status(200).json({ ok: true, action: "activated" });
      }

      return res.status(400).json({ ok: false, error: "invalid_action" });

    } catch (error) {
      console.error("Schedule POST error:", error);
      return res.status(500).json({ ok: false, error: "server_error" });
    }
  }

  return res.status(405).json({ ok: false, error: "method_not_allowed" });
}
