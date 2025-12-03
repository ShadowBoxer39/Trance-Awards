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

    const userIds = Object.keys(userTotals);
    
    if (userIds.length === 0) {
      return res.status(200).json({ ok: true, leaderboard: [] });
    }

    // Get profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("quiz_profiles")
      .select("user_id, display_name, photo_url")
      .in("user_id", userIds);

    if (profilesError) throw profilesError;

    const profileMap = new Map(
      profiles?.map((p) => [p.user_id, { displayName: p.display_name, photoUrl: p.photo_url }])
    );

    const leaderboard = Object.entries(userTotals)
      .map(([userId, data]) => ({
        userId,
        displayName: profileMap.get(userId)?.displayName || "אנונימי",
        photoUrl: profileMap.get(userId)?.photoUrl || null,
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
