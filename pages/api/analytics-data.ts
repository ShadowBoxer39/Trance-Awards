// pages/api/analytics-data.ts - WITH UNIQUE VISITORS
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // Reusing the shared server client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const key = (req.query.key as string) || "";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    const pageSize = 1000;
    let from = 0;
    const allVisits: any[] = [];

    // Loop to fetch all records, batch by batch
    while (true) {
      const { data, error } = await supabase
        .from("site_visits")
        .select("*")
        .order("timestamp", { ascending: false })
        .range(from, from + pageSize - 1); // <-- Use range for batching

      if (error) {
        console.error("Supabase Query Error in analytics-data.ts:", error);
        throw new Error(error.message);
      }

      allVisits.push(...(data ?? []));

      // Stop condition: if we fetched less than the page size, we reached the end
      if (!data || data.length < pageSize) break;

      from += pageSize;
    }

    // Calculate unique visitors (distinct visitor_id)
    const uniqueVisitorIds = new Set<string>();
    allVisits.forEach(visit => {
      if (visit.visitor_id) {
        uniqueVisitorIds.add(visit.visitor_id);
      }
    });

    return res.status(200).json({
      ok: true,
      visits: allVisits || [],
      uniqueVisitors: uniqueVisitorIds.size,
    });
  } catch (e) {
    console.error("analytics-data fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
