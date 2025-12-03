import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const { questionId, odau, displayName, photoUrl, isArchive } = req.body;

    if (!questionId || !odau) {
      return res.status(400).json({ ok: false, error: "missing_data" });
    }

    // Get IP to verify they actually answered
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() 
               || req.socket.remoteAddress 
               || "unknown";

    // Find their correct attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .select("attempt_number, is_correct")
      .eq("question_id", questionId)
      .eq("ip_address", ip)
      .eq("is_correct", true)
      .single();

    if (attemptError || !attempt) {
      return res.status(400).json({ ok: false, error: "no_correct_attempt_found" });
    }

    // Calculate points (archive = max 1 point, live = 3/2/1)
    let pointsEarned = 4 - attempt.attempt_number; // 3, 2, or 1
    if (isArchive) {
      pointsEarned = 1; // Archive always gives 1 point
    }

    // Check if score already saved for this user + question
    const { data: existingScore } = await supabase
      .from("quiz_scores")
      .select("id")
      .eq("user_id", odau)
      .eq("question_id", questionId)
      .single();

    if (existingScore) {
      return res.status(400).json({ ok: false, error: "score_already_saved" });
    }

    // Upsert user profile (update if exists, insert if not)
    if (displayName) {
      const { error: profileError } = await supabase
        .from("quiz_profiles")
        .upsert({
          user_id: odau,
          display_name: displayName,
          photo_url: photoUrl || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
      }
    }

    // Save score
    const { error: insertError } = await supabase
      .from("quiz_scores")
      .insert({
        user_id: odau,
        question_id: questionId,
        points_earned: pointsEarned,
        attempts_used: attempt.attempt_number,
      });

    if (insertError) throw insertError;

    return res.status(200).json({
      ok: true,
      pointsEarned,
      attemptsUsed: attempt.attempt_number,
    });

  } catch (error) {
    console.error("Save score error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
