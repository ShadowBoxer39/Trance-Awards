// pages/api/vote-count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  // 🔒 Prevent Vercel caching (super important for live updates)
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  try {
    // 1️⃣ Count total votes in Supabase
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("vote-count error:", error);
      return res.status(500).json({ error: "db_error" });
    }

    // 2️⃣ Base + real + time-based bonus
    const realVotes = count || 0;
    const baseVotes = 100;

    // 3️⃣ Launch date (⚠️ fix to your real launch date!)
    // new Date(YEAR, MONTH-1, DAY, HOUR, MIN, SEC)
    const launchDate = new Date(2025, 11, 4, 0, 0, 0); // Nov 5 2025, 00:00
    const now = new Date();
    const minutesSinceLaunch = Math.max(0, Math.floor((now.getTime() - launchDate.getTime()) / 60000));

    const bonusVotes = minutesSinceLaunch;
    const totalVotes = baseVotes + realVotes + bonusVotes;

    // 4️⃣ Return live count
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
