// pages/api/stats.ts - COMPLETE FIXED VERSION
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

/**
 * Returns tally counts per category/nominee.
 * Requires ?key=ADMIN_KEY
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = (req.query.key as string) || "";
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    // ✅ FIX: Add limit to get ALL votes (default is 1000!)
    const { data, error, count } = await supabase
      .from("votes")
      .select("selections", { count: "exact" })
      .limit(50000);  // ← ADDED THIS

    if (error) {
      console.error("stats select error:", error);
      return res.status(500).json({ ok: false, error: "db_error" });
    }

    // Aggregate in Node (simple & free)
    // shape: { [categoryId]: { [nomineeId]: number } }
    const tally: Record<string, Record<string, number>> = {};

    for (const row of data || []) {
      const selections = (row as any)?.selections || {};
      if (selections && typeof selections === "object") {
        for (const [catId, nomineeId] of Object.entries(selections as Record<string,string>)) {
          if (!tally[catId]) tally[catId] = {};
          tally[catId][nomineeId] = (tally[catId][nomineeId] || 0) + 1;
        }
      }
    }

    // ✅ FIX: Also return total votes
    return res.status(200).json({ 
      ok: true, 
      tally,
      totalVotes: data?.length || 0  // ← ADDED THIS
    });
  } catch (e) {
    console.error("stats server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
