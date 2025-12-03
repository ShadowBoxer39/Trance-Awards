// pages/api/analytics-data.ts - ENHANCED WITH NEW METRICS
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

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

    while (true) {
      const { data, error } = await supabase
        .from("site_visits")
        .select("*")
        .order("timestamp", { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error("Supabase Query Error:", error);
        throw new Error(error.message);
      }

      allVisits.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
      from += pageSize;
    }

    const uniqueVisitorIds = new Set<string>();
    const visitorFrequency: Record<string, number> = {};
    
    allVisits.forEach(visit => {
      if (visit.visitor_id) {
        uniqueVisitorIds.add(visit.visitor_id);
        visitorFrequency[visit.visitor_id] = (visitorFrequency[visit.visitor_id] || 0) + 1;
      }
    });

    let returningVisitors = 0;
    let newVisitors = 0;
    Object.values(visitorFrequency).forEach(count => {
      if (count > 1) returningVisitors++;
      else newVisitors++;
    });

    return res.status(200).json({
      ok: true,
      visits: allVisits || [],
      uniqueVisitors: uniqueVisitorIds.size,
      returningVisitors,
      newVisitors,
    });
  } catch (e) {
    console.error("analytics-data fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
