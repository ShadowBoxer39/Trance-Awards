// pages/api/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const key = (req.query.key as string) || "";
    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];

    // page through everything
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

    // build tally: { [categoryId]: { [nomineeId]: count } }
    const tally: Record<string, Record<string, number>> = {};
    for (const v of all) {
      const cat = v.category_id;       // adjust to your column names
      const nom = v.nominee_id;
      tally[cat] ??= {};
      tally[cat][nom] = (tally[cat][nom] ?? 0) + 1;
    }

    return res.status(200).json({
      ok: true,
      tally,
      totalVotes: all.length, // ← real total
    });
  } catch (e) {
    console.error("stats server error:", e);
    return res.status(500).json({ ok: false, error: "server_error" });
  }
}
