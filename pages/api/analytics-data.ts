// shadowboxer39/trance-awards/Trance-Awards-main/pages/api/analytics-data.ts
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer"; // The correct path from /pages/api/ to /lib

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
      // @ts-ignore - Supabase client is imported via module augmentation, ignore TS error here
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
    
    // --- NEW: Artist Page Visits Tally Setup ---
    const artistPageVisits: Record<string, { visits: number; page: string; slug: string }> = {};

    // List of known root pages that are NOT dynamic artist slugs
    const nonArtistRootPages = new Set([
        '/', '/about', '/episodes', '/young-artists', '/vote', '/awards', 
        '/track-of-the-week', '/submit-track', '/featured-artist', '/artists', '/legends', 
        '/admin', '/thanks', '/advertisers'
    ]);
    // --- End Setup ---
    
    allVisits.forEach(visit => {
      if (visit.visitor_id) {
        uniqueVisitorIds.add(visit.visitor_id);
        visitorFrequency[visit.visitor_id] = (visitorFrequency[visit.visitor_id] || 0) + 1;
      }
      
      // --- New: Artist Page Visit Tally ---
      const page = (visit.page || '/').toLowerCase().split('?')[0]; // Clean query params
      
      let slug = '';
      let isArtistPage = false;
      
      // Pattern 1: /artist/[slug] (Featured Artist Page)
      if (page.startsWith('/artist/')) {
          const slugMatch = /^\/artist\/([^/]+)$/.exec(page);
          if (slugMatch) {
              slug = slugMatch[1];
              isArtistPage = true;
          }
      }
      // Pattern 2: /[slug] (General Artist/Legend Page, from pages/[slug].tsx)
      else if (page.startsWith('/') && page.split('/').length === 2 && page.length > 1) {
           const rootSlug = page.substring(1);
           if (!nonArtistRootPages.has(page)) {
              slug = rootSlug;
              isArtistPage = true;
           }
      }

      if (isArtistPage && slug) {
          const key = slug; 
          if (!artistPageVisits[key]) {
              artistPageVisits[key] = { visits: 0, page: page, slug: slug };
          }
          artistPageVisits[key].visits++;
      }
      // --- End Tally ---
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
      artistPageVisits, // <-- NEW DATA POINT
    });
  } catch (e) {
    console.error("analytics-data fetch error:", e);
    return res.status(500).json({ ok: false, error: "server_db_error" });
  }
}
