// pages/api/stats.ts - FINAL CORRECT VERSION
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = (req.query.key as string) || "";
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    // Pagination settings
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];

    // Page through everything
    while (true) {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .range(from, from + pageSize - 1);

      if (error) throw error;

      all.push(...(data ?? []));
      if (!data || data.length < pageSize) break; // last page
      from += pageSize;
    }

    console.log(`[STATS] Fetched ${all.length} total votes`);

    // Build tally: { [categoryId]: { [nomineeId]: count } }
    const tally: Record<string, Record<string, number>> = {};

    for (const row of all) {
      // The selections column contains the vote data
      const selections = row.selections;
      
      // selections is like: {"best-artist": "libra", "best-album": "gorovich-creative", ...}
      if (!selections || typeof selections !== "object") {
        continue;
      }

      // Iterate through each category in this vote
      for (const [categoryId, nomineeId] of Object.entries(selections)) {
        const cat = String(categoryId);
        const nom = String(nomineeId);

        // Initialize category if needed
        if (!tally[cat]) {
          tally[cat] = {};
        }

        // Increment count for this nominee
        tally[cat][nom] = (tally[cat][nom] ?? 0) + 1;
      }
    }

    console.log(`[STATS] Categories found:`, Object.keys(tally));
    
    // Log totals per category
    for (const [catId, nominees] of Object.entries(tally)) {
      const total = Object.values(nominees).reduce((sum, count) => sum + count, 0);
      console.log(`[STATS]   ${catId}: ${total} votes`);
    }

    return res.status(200).json({
      ok: true,
      tally,
      totalVotes: all.length, // real total
    });
  } catch (e) {
    console.error("stats server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
