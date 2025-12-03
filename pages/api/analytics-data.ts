// pages/api/analytics-data.ts
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

    // Fetch all visits in batches
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
    
    // --- NEW: Artist Page Stats Logic ---
    const artistPageVisits: Record<string, { visits: number; page: string; slug: string }> = {};
    
    // Pages to exclude from being counted as an "artist"
    const staticPages = new Set([
        "", "home", "episodes", "young-artists", "about", "advertisers", 
        "vote", "awards", "track-of-the-week", "submit-track", 
        "featured-artist", "artists", "legends", "admin", "results-instagram", 
        "thanks", "favicon.ico"
    ]);

    allVisits.forEach(visit => {
      // 1. Track Unique Visitors
      if (visit.visitor_id) {
        uniqueVisitorIds.add(visit.visitor_id);
        visitorFrequency[visit.visitor_id] = (visitorFrequency[visit.visitor_id] || 0) + 1;
      }

      // 2. Track Artist Page Visits
      if (visit.page) {
        // Clean URL: remove query params and leading slash
        const path = visit.page.split('?')[0].replace(/^\//, ''); 
        const parts = path.split('/');

        let slug = "";

        // Case A: /artist/kanok
        if (parts.length === 2 && parts[0] === "artist") {
          slug = parts[1];
        } 
        // Case B: /kanok (Dynamic root page, excluding static pages)
        else if (parts.length === 1 && parts[0] && !staticPages.has(parts[0])) {
          slug = parts[0];
        }

        if (slug) {
          try { slug = decodeURIComponent(slug); } catch {}
          
          if (!artistPageVisits[slug]) {
            artistPageVisits[slug] = { visits: 0, page: visit.page, slug: slug };
          }
          artistPageVisits[slug].visits++;
        }
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
      visits: allVisits || [], // Return clean array of visits
      uniqueVisitors: uniqueVisitorIds.size,
      returningVisitors,
      newVisitors,
      artistPageVisits // Return the aggregated artist stats
    });
  } catch (e) {
    console.error("analytics-data fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
