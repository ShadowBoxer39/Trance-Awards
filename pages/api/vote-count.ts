// pages/api/vote-count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  try {
    // Count total votes in database
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("vote-count error:", error);
      return res.status(500).json({ error: "db_error" });
    }

    // Start at 100, add real votes, add bonus votes based on time
    const realVotes = count || 0;
    const baseVotes = 100;
    
    // Add 1 vote per minute since launch (adjust this date to your launch date)
    const launchDate = new Date("2025-01-06T00:00:00Z"); // Change this!
    const now = new Date();
    const minutesSinceLaunch = Math.floor((now.getTime() - launchDate.getTime()) / 60000);
    const bonusVotes = Math.max(0, minutesSinceLaunch);
    
    const totalVotes = baseVotes + realVotes + bonusVotes;

    return res.status(200).json({ 
      ok: true, 
      count: totalVotes,
      realVotes,
      bonusVotes 
    });
  } catch (e) {
    console.error("vote-count server error:", e);
    return res.status(500).json({ error: "server_error" });
  }
}
