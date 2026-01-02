// pages/api/analytics-data.ts
// UPDATED: Server-side aggregation for better performance
import type { NextApiRequest, NextApiResponse } from "next";
import supabase from "../../lib/supabaseServer";

type DateRange = "today" | "7d" | "30d" | "all";

// Helper functions
function getDeviceType(userAgent: string | null): "mobile" | "tablet" | "desktop" {
  if (!userAgent) return "desktop";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return "mobile";
  return "desktop";
}

function getDateBounds(range: DateRange, offset: number = 0): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date;

  if (range === "today") {
    start = new Date(now);
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (range === "7d") {
    end = new Date(now.getTime() - offset * 7 * 24 * 60 * 60 * 1000);
    start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (range === "30d") {
    end = new Date(now.getTime() - offset * 30 * 24 * 60 * 60 * 1000);
    start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    start = new Date(0);
    end = new Date(now);
  }

  return { start, end };
}

const PAGE_NAMES: Record<string, string> = {
  "/": "🏠 דף הבית",
  "/episodes": "🎧 פרקים",
  "/track-of-the-week": "🎵 הטראק השבועי",
  "/featured-artist": "⭐ האמן המומלץ",
  "/young-artists": "🌟 אמנים צעירים",
  "/vote": "🗳️ הצבעה",
  "/awards": "🏆 פרסים",
  "/artists": "🎤 אמנים",
  "/legends": "👑 אגדות",
  "/results": "📊 תוצאות",
  "/admin": "🔧 אדמין",
  "/submit-track": "📤 שליחת טראק",
};

const STATIC_PAGES = new Set([
  "", "home", "episodes", "young-artists", "about", "advertisers",
  "vote", "awards", "track-of-the-week", "submit-track",
  "featured-artist", "artists", "legends", "admin", "results-instagram",
  "thanks", "favicon.ico", "_error", "404", "results", "api"
]);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const key = (req.query.key as string) || "";
  const range = (req.query.range as DateRange) || "all";
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  try {
    // Get date bounds for current and previous period
    const current = getDateBounds(range, 0);
    const previous = getDateBounds(range, 1);

    // Fetch current period data
    const { data: currentVisits, error: currentError } = await supabase
      .from("site_visits")
      .select("visitor_id, page, referrer, user_agent, duration, is_israel, timestamp")
      .gte("timestamp", current.start.toISOString())
      .lt("timestamp", current.end.toISOString())
      .order("timestamp", { ascending: false })
    .limit(50000);

    if (currentError) throw currentError;

    // Fetch previous period data (only what we need for comparison)
    const { data: previousVisits, error: previousError } = await supabase
      .from("site_visits")
      .select("visitor_id, duration")
      .gte("timestamp", previous.start.toISOString())
      .lt("timestamp", previous.end.toISOString());

    if (previousError) throw previousError;

    const visits = currentVisits || [];
    const prevVisits = previousVisits || [];

    // ===== CALCULATE CURRENT PERIOD STATS =====

    // Unique visitors
    const uniqueVisitorIds = new Set<string>();
    visits.forEach(v => { if (v.visitor_id) uniqueVisitorIds.add(v.visitor_id); });

    // Track first visit time per visitor (for returning vs new)
    const visitorFirstSeen: Record<string, Date> = {};
    visits.forEach(v => {
      if (v.visitor_id) {
        const visitDate = new Date(v.timestamp);
        if (!visitorFirstSeen[v.visitor_id] || visitDate < visitorFirstSeen[v.visitor_id]) {
          visitorFirstSeen[v.visitor_id] = visitDate;
        }
      }
    });

    let returningVisitors = 0;
    let newVisitors = 0;
    uniqueVisitorIds.forEach(visitorId => {
      const firstSeen = visitorFirstSeen[visitorId];
      if (firstSeen && firstSeen < current.start) {
        returningVisitors++;
      } else {
        newVisitors++;
      }
    });

    // Device breakdown
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    visits.forEach(v => { devices[getDeviceType(v.user_agent)]++; });

    // Duration stats
    let totalDuration = 0;
    let validDurations = 0;
    let bounces = 0;
    let israelVisits = 0;

    visits.forEach(v => {
      if (v.duration && v.duration > 0) {
        totalDuration += v.duration;
        validDurations++;
        if (v.duration < 5) bounces++;
      }
      if (v.is_israel) israelVisits++;
    });

    const avgDuration = validDurations > 0 ? Math.round(totalDuration / validDurations) : 0;
    const bounceRate = validDurations > 0 ? ((bounces / validDurations) * 100).toFixed(1) : "0.0";
    const israelPercentage = visits.length > 0 ? ((israelVisits / visits.length) * 100).toFixed(1) : "0.0";

    // Page visits
    const pageVisits: Record<string, number> = {};
    visits.forEach(v => {
      if (v.page) {
        const cleanPage = v.page.split("?")[0];
        pageVisits[cleanPage] = (pageVisits[cleanPage] || 0) + 1;
      }
    });

    // Landing pages (first page per visitor in this period)
    const visitorLandingPage: Record<string, { page: string; time: Date }> = {};
    visits.forEach(v => {
      if (v.visitor_id && v.page) {
        const visitTime = new Date(v.timestamp);
        const cleanPage = v.page.split("?")[0];
        if (!visitorLandingPage[v.visitor_id] || visitTime < visitorLandingPage[v.visitor_id].time) {
          visitorLandingPage[v.visitor_id] = { page: cleanPage, time: visitTime };
        }
      }
    });

    const landingPages: Record<string, number> = {};
    Object.values(visitorLandingPage).forEach(({ page }) => {
      landingPages[page] = (landingPages[page] || 0) + 1;
    });

    // Traffic sources
    const sources: Record<string, number> = {};
    visits.forEach(v => {
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname.replace("www.", "");
          if (host.includes("instagram") || host.includes("l.instagram")) {
            sources["📸 Instagram"] = (sources["📸 Instagram"] || 0) + 1;
          } else if (host.includes("facebook") || host.includes("l.facebook") || host.includes("lm.facebook")) {
            sources["👥 Facebook"] = (sources["👥 Facebook"] || 0) + 1;
          } else if (host.includes("google")) {
            sources["🔍 Google"] = (sources["🔍 Google"] || 0) + 1;
          } else if (host.includes("youtube")) {
            sources["📺 YouTube"] = (sources["📺 YouTube"] || 0) + 1;
          } else if (host.includes("t.co") || host.includes("twitter") || host.includes("x.com")) {
            sources["🐦 Twitter/X"] = (sources["🐦 Twitter/X"] || 0) + 1;
          } else if (host.includes("duckduckgo")) {
            sources["🦆 duckduckgo.com"] = (sources["🦆 duckduckgo.com"] || 0) + 1;
          } else {
            sources[`🌐 ${host.slice(0, 20)}`] = (sources[`🌐 ${host.slice(0, 20)}`] || 0) + 1;
          }
        } catch {
          sources["🏠 ישיר"] = (sources["🏠 ישיר"] || 0) + 1;
        }
      } else {
        sources["🏠 ישיר"] = (sources["🏠 ישיר"] || 0) + 1;
      }
    });

    // Hourly traffic
    const hourlyTraffic: Record<number, number> = {};
    visits.forEach(v => {
      const hour = new Date(v.timestamp).getHours();
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    });

    // Daily trend
    const dailyData: Record<string, number> = {};
    visits.forEach(v => {
      const dateKey = new Date(v.timestamp).toISOString().split("T")[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + 1;
    });

    // Artist page visits
    const artistPageVisits: Record<string, { visits: number; slug: string; page: string }> = {};
    visits.forEach(v => {
      if (v.page) {
        const path = v.page.split("?")[0].replace(/^\//, "");
        const parts = path.split("/");
        let slug = "";

        if (parts.length === 2 && parts[0] === "artist") {
          slug = parts[1];
        } else if (parts.length === 1 && parts[0] && !STATIC_PAGES.has(parts[0])) {
          slug = parts[0];
        }

        if (slug) {
          try { slug = decodeURIComponent(slug); } catch {}
          const lowerSlug = slug.toLowerCase();
          if (lowerSlug === "[slug]" || lowerSlug.includes("error") || lowerSlug === "404" || lowerSlug === "undefined") {
            return;
          }
          if (!artistPageVisits[slug]) {
            artistPageVisits[slug] = { visits: 0, slug, page: v.page };
          }
          artistPageVisits[slug].visits++;
        }
      }
    });

    // ===== CALCULATE PREVIOUS PERIOD STATS (for comparison) =====
    const prevUniqueIds = new Set<string>();
    let prevTotalDuration = 0;
    let prevValidDurations = 0;

    prevVisits.forEach(v => {
      if (v.visitor_id) prevUniqueIds.add(v.visitor_id);
      if (v.duration && v.duration > 0) {
        prevTotalDuration += v.duration;
        prevValidDurations++;
      }
    });

    const prevAvgDuration = prevValidDurations > 0 ? Math.round(prevTotalDuration / prevValidDurations) : 0;

    // Calculate percentage changes
    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // ===== FORMAT OUTPUT =====
    const topPages = Object.entries(pageVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({
        page: PAGE_NAMES[page] || page,
        count,
        percentage: visits.length > 0 ? ((count / visits.length) * 100).toFixed(1) : "0.0",
      }));

    const topLandingPages = Object.entries(landingPages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({
        page: PAGE_NAMES[page] || page,
        count,
        percentage: uniqueVisitorIds.size > 0 ? ((count / uniqueVisitorIds.size) * 100).toFixed(1) : "0.0",
      }));

    const topSources = Object.entries(sources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        count,
        percentage: visits.length > 0 ? ((count / visits.length) * 100).toFixed(1) : "0.0",
      }));

    const peakHours = Object.entries(hourlyTraffic)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));

    const trendData = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("he-IL", { day: "numeric", month: "short" }),
        visits: count,
      }));

    const deviceData = [
      { name: "📱 מובייל", value: devices.mobile, color: "#06b6d4" },
      { name: "💻 דסקטופ", value: devices.desktop, color: "#8b5cf6" },
      { name: "📟 טאבלט", value: devices.tablet, color: "#10b981" },
    ].filter(d => d.value > 0);

    const topArtists = Object.values(artistPageVisits)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Return pre-calculated analytics
    return res.status(200).json({
      ok: true,
      analytics: {
        totalVisits: visits.length,
        uniqueVisitors: uniqueVisitorIds.size,
        returningVisitors,
        newVisitors,
        avgDuration,
        bounceRate,
        israelVisits,
        israelPercentage,
        topPages,
        topLandingPages,
        topSources,
        peakHours,
        trendData,
        deviceData,
        topArtists,
        comparison: {
          prevTotalVisits: prevVisits.length,
          prevUniqueVisitors: prevUniqueIds.size,
          prevAvgDuration,
          visitsChange: calcChange(visits.length, prevVisits.length),
          uniqueChange: calcChange(uniqueVisitorIds.size, prevUniqueIds.size),
          durationChange: calcChange(avgDuration, prevAvgDuration),
        },
      },
    });
  } catch (e: any) {
    console.error("analytics-data error:", e);
    return res.status(500).json({ ok: false, error: e.message || "server_error" });
  }
}
