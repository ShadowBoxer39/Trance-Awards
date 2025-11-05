// pages/api/vote-count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

/**
 * Configure your starting number and launch time here.
 * Month is 0-based: 0=Jan, 11=Dec.
 */
const BASE_VOTES = 100;
const LAUNCH_DATE = new Date(2025, 10, 5, 0, 0, 0); // 2025-11-05 00:00 local time

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 🔒 Prevent Vercel/browser caching so the number is always fresh
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // 1) Real votes from DB (cheap count-only query)
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("vote-count error:", error);
      return res.status(500).json({ error: "db_error" });
    }

    const realVotes = count || 0;

    // 2) +1 per minute since LAUNCH_DATE
    const now = new Date();
    const minutesSinceLaunch = Math.max(
      0,
      Math.floor((now.getTime() - LAUNCH_DATE.getTime()) / 60000)
    );
    const bonusVotes = minutesSinceLaunch;

    // 3) Total
    const totalVotes = BASE_VOTES + realVotes + bonusVotes;

    return res.status(200).json({
      ok: true,
      count: totalVotes,
      realVotes,
      bonusVotes,
    });
  } catch (e) {
    console.error("vote-count server error:", e);
    return res.status(500).json({ error: "server_error" });
  }
}
