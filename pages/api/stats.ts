// pages/api/stats.ts (REWRITTEN FOR CONFIG CHECK & ROBUSTNESS)
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = (req.query.key as string) || "";
    const ADMIN_KEY = process.env.ADMIN_KEY;

    // 1. Admin Key Check
    if (!ADMIN_KEY || key !== ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    // 2. Supabase Config Check
    // Since lib/supabaseServer is initialized outside, check the raw env vars here.
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase Environment Variables Missing on Server.");
      return res.status(500).json({ 
        ok: false, 
        error: "Supabase_Config_Missing",
        details: "Server failed to load SUPABASE_URL or SERVICE_ROLE_KEY."
      });
    }

    // 3. Database Fetch
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];

    while (true) {
      const { data, error } = await supabase
        .from("votes") // This is the first DB call. A failure here causes the 500.
        .select("*")
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Supabase Query Error in stats.ts:", error);
        throw new Error(error.message); // Throw DB specific error
      }

      all.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    // (Tallying logic remains the same)
    const tally: Record<string, Record<string, number>> = {};

    for (const row of all) {
      const selections = row.selections;
      if (!selections || typeof selections !== "object") {
        continue;
      }
      for (const [categoryId, nomineeId] of Object.entries(selections)) {
        const cat = String(categoryId);
        const nom = String(nomineeId);

        if (!tally[cat]) {
          tally[cat] = {};
        }
        tally[cat][nom] = (tally[cat][nom] ?? 0) + 1;
      }
    }

    return res.status(200).json({
      ok: true,
      tally,
      totalVotes: all.length,
    });
  } catch (e: any) {
    console.error("stats server error:", e);
    // Return the specific DB error message if possible
    return res.status(500).json({ ok: false, error: e.message || "generic_server_error" });
  }
}
