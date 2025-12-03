import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

    // Get aggregated scores per user
    const { data: scores, error: scoresError } = await supabase
      .from("quiz_scores")
      .select("user_id, points_earned");

    if (scoresError) throw scoresError;

    // Aggregate by user
    const userTotals: Record<string, { totalPoints: number; questionsAnswered: number }> = {};
    
    scores?.forEach((score) => {
      if (!userTotals[score.user_id]) {
        userTotals[score.user_id] = { totalPoints: 0, questionsAnswered: 0 };
      }
      userTotals[score.user_id].totalPoints += score.points_earned;
      userTotals[score.user_id].questionsAnswered += 1;
    });

    // Get user details from auth (we need to get from profiles or store separately)
    // For now, get from the Google auth user metadata
    const userIds = Object.keys(userTotals);
    
    if (userIds.length === 0) {
      return res.status(200).json({ ok: true, leaderboard: [] });
    }

    // Get user profiles from auth.users via admin API or stored profiles
    // Since we can't directly query auth.users, we'll get from quiz_scores joined with a profile
    // For now, return user_id and let frontend handle display name from session
    
    const leaderboard = Object.entries(userTotals)
      .map(([userId, data]) => ({
        userId,
        totalPoints: data.totalPoints,
        questionsAnswered: data.questionsAnswered,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);

    return res.status(200).json({
      ok: true,
      leaderboard,
    });

  } catch (error) {
    console.error("Leaderboard error:", error);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
