// pages/api/public-stats.ts - PUBLIC (no auth needed)
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set cache headers to prevent stale data
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  try {
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

    // Build tally: { [categoryId]: { [nomineeId]: count } }
    const tally: Record<string, Record<string, number>> = {};

    for (const row of all) {
      const selections = row.selections;
      
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

    return res.status(200).json({
      ok: true,
      tally,
      totalVotes: all.length,
    });
  } catch (e) {
    console.error("public-stats error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
