// shadowboxer39/trance-awards/Trance-Awards-main/pages/admin.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

// ... (omitting existing helper functions and interfaces for brevity) ...

const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const getDeviceType = (userAgent: string | null): 'mobile' | 'tablet' | 'desktop' => {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'mobile';
  return 'desktop';
};

type Tally = Record<string, Record<string, number>>;

interface Signup {
  id: string;
  full_name: string;
  stage_name: string;
  age: string;
  phone: string;
  experience_years: string;
  inspirations: string;
  track_link: string;
  submitted_at: string;
}

interface TrackSubmission {
  id: string;
  name: string;
  photo_url: string | null;
  track_title: string;
  youtube_url: string;
  description: string;
  created_at: string;
  is_approved: boolean;
}

interface VisitData {
  id: string;
  timestamp: string;
  page: string;
  referrer: string | null;
  user_agent: string | null;
  duration: number | null;
  country_code: string | null;
  is_israel: boolean | null;
  visitor_id: string | null;
}

interface AdminArtist {
  id: number;
  slug: string;
  name: string;
  stage_name: string;
  short_bio: string | null;
  profile_photo_url: string | null;
  started_year: number | null;
  spotify_artist_id: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  soundcloud_profile_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  primary_color: string | null;
  booking_agency_name: string | null;
  booking_agency_email: string | null;
  booking_agency_url: string | null;
  record_label_name: string | null;
  record_label_url: string | null;
  management_email: string | null;
  festival_sets: { youtube_id?: string; festival?: string | null; year?: number | null; location?: string | null; }[] | null;
  instagram_reels: string[] | null;
  artist_episodes?: { episode_id: number; is_primary: boolean }[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

const DEVICE_COLORS = { mobile: '#06b6d4', desktop: '#8b5cf6', tablet: '#10b981' };

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg text-sm border border-purple-500/50">
        <p className="font-semibold text-cyan-400 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Admin() {
  // ============================================
  // ALL STATE
  // ============================================
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  
  const [signups, setSignups] = React.useState<Signup[]>([]);
  const [signupsLoading, setSignupsLoading] = React.useState(false);
  const [selectedSignup, setSelectedSignup] = React.useState<Signup | null>(null);
  
  const [trackSubs, setTrackSubs] = React.useState<TrackSubmission[]>([]);
  const [trackSubsLoading, setTrackSubsLoading] = React.useState(false);
  const [selectedTrackSub, setSelectedTrackSub] = React.useState<TrackSubmission | null>(null);

  const [visits, setVisits] = React.useState<VisitData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  const [dateRange, setDateRange] = React.useState<"today" | "7d" | "30d" | "all">("today");
  const [showComparison, setShowComparison] = React.useState(false);
  
  const [activeTab, setActiveTab] = React.useState<"votes" | "signups" | "analytics" | "track-submissions" | "artists">("analytics");

  const [adminArtists, setAdminArtists] = React.useState<AdminArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = React.useState(false);
  const [currentArtist, setCurrentArtist] = React.useState<AdminArtist | null>(null);
  const [primaryEpisodeId, setPrimaryEpisodeId] = React.useState<string>("");
  const [savingArtist, setSavingArtist] = React.useState(false);

  // ============================================
  // ANALYTICS CALCULATION
  // ============================================
  const analytics = React.useMemo(() => {
    if (!visits || visits.length === 0) return null;
    
    const now = new Date();
    
    const filterByRange = (rangeType: "today" | "7d" | "30d" | "all", offset: number = 0) => {
      return visits.filter(v => {
        const visitDate = new Date(v.timestamp);
        if (rangeType === "today") {
          const targetDay = new Date(now);
          targetDay.setDate(targetDay.getDate() - offset);
          targetDay.setHours(0, 0, 0, 0);
          const nextDay = new Date(targetDay);
          nextDay.setDate(nextDay.getDate() + 1);
          return visitDate >= targetDay && visitDate < nextDay;
        }
        if (rangeType === "7d") {
          const startDate = new Date(now.getTime() - (7 + offset * 7) * 24 * 60 * 60 * 1000);
          const endDate = new Date(now.getTime() - offset * 7 * 24 * 60 * 60 * 1000);
          return visitDate >= startDate && visitDate < endDate;
        }
        if (rangeType === "30d") {
          const startDate = new Date(now.getTime() - (30 + offset * 30) * 24 * 60 * 60 * 1000);
          const endDate = new Date(now.getTime() - offset * 30 * 24 * 60 * 60 * 1000);
          return visitDate >= startDate && visitDate < endDate;
        }
        return true;
      });
    };

    const filtered = filterByRange(dateRange, 0);
    const previousPeriod = filterByRange(dateRange, 1);

    // Unique visitors
    const uniqueVisitorIds = new Set<string>();
    filtered.forEach(v => { if (v.visitor_id) uniqueVisitorIds.add(v.visitor_id); });
    
    const prevUniqueVisitorIds = new Set<string>();
    previousPeriod.forEach(v => { if (v.visitor_id) prevUniqueVisitorIds.add(v.visitor_id); });

    // Returning vs New
    const visitorFirstSeen: Record<string, Date> = {};
    visits.forEach(v => {
      if (v.visitor_id) {
        const visitDate = new Date(v.timestamp);
        if (!visitorFirstSeen[v.visitor_id] || visitDate < visitorFirstSeen[v.visitor_id]) {
          visitorFirstSeen[v.visitor_id] = visitDate;
        }
      }
    });

    const periodStart = dateRange === "today" 
      ? (() => { const d = new Date(now); d.setHours(0,0,0,0); return d; })()
      : dateRange === "7d" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : dateRange === "30d" ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : new Date(0);

    let returningInPeriod = 0, newInPeriod = 0;
    uniqueVisitorIds.forEach(visitorId => {
      const firstSeen = visitorFirstSeen[visitorId];
      if (firstSeen && firstSeen < periodStart) returningInPeriod++;
      else newInPeriod++;
    });

    // Device breakdown
    const devices = { mobile: 0, desktop: 0, tablet: 0 };
    filtered.forEach(v => { devices[getDeviceType(v.user_agent)]++; });
    const deviceData = [
      { name: '📱 מובייל', value: devices.mobile, color: DEVICE_COLORS.mobile },
      { name: '💻 דסקטופ', value: devices.desktop, color: DEVICE_COLORS.desktop },
      { name: '📟 טאבלט', value: devices.tablet, color: DEVICE_COLORS.tablet },
    ].filter(d => d.value > 0);

    // Daily trends
    const dailyData: Record<string, number> = {};
    const prevDailyData: Record<string, number> = {};
    const daysToShow = dateRange === "today" ? 1 : dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 30;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now); date.setDate(date.getDate() - i);
      dailyData[date.toISOString().split('T')[0]] = 0;
      if (showComparison) {
        const prevDate = new Date(now); prevDate.setDate(prevDate.getDate() - i - daysToShow);
        prevDailyData[prevDate.toISOString().split('T')[0]] = 0;
      }
    }
    filtered.forEach(v => {
      const dateKey = new Date(v.timestamp).toISOString().split('T')[0];
      if (dailyData.hasOwnProperty(dateKey)) dailyData[dateKey]++;
    });
    if (showComparison) {
      previousPeriod.forEach(v => {
        const dateKey = new Date(v.timestamp).toISOString().split('T')[0];
        if (prevDailyData.hasOwnProperty(dateKey)) prevDailyData[dateKey]++;
      });
    }

    const trendData = Object.entries(dailyData).map(([date, count], idx) => ({
      date: new Date(date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
      visits: count,
      previousVisits: showComparison ? Object.values(prevDailyData)[idx] || 0 : undefined,
    }));

    // Landing pages
    const visitorLandingPage: Record<string, { page: string; time: Date }> = {};
    filtered.forEach(v => {
      if (v.visitor_id) {
        const visitTime = new Date(v.timestamp);
        if (!visitorLandingPage[v.visitor_id] || visitTime < visitorLandingPage[v.visitor_id].time) {
          visitorLandingPage[v.visitor_id] = { page: v.page, time: visitTime };
        }
      }
    });
    const landingPages: Record<string, number> = {};
    Object.values(visitorLandingPage).forEach(({ page }) => {
      landingPages[page] = (landingPages[page] || 0) + 1;
    });

    const pageNames: Record<string, string> = {
      '/': '🏠 דף הבית', '/episodes': '🎧 פרקים', '/track-of-the-week': '🎵 הטראק השבועי',
      '/featured-artist': '⭐ האמן המומלץ', '/young-artists': '🌟 אמנים צעירים',
      '/vote': '🗳️ הצבעה', '/awards': '🏆 פרסים', '/artists': '🎤 אמנים', '/legends': '👑 אגדות',
    };

    const topLandingPages = Object.entries(landingPages)
      .sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([page, count]) => ({
        page: pageNames[page] || page, count,
        percentage: uniqueVisitorIds.size ? ((count / uniqueVisitorIds.size) * 100).toFixed(1) : "0.0"
      }));

    // Regular metrics
    const pageVisits: Record<string, number> = {};
    const sources: Record<string, number> = {};
    const hourlyTraffic: Record<number, number> = {};
    let totalDuration = 0, validDurations = 0, bounces = 0, israelVisits = 0;
    const countries: Record<string, number> = {};

    filtered.forEach(v => {
      pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;
      hourlyTraffic[new Date(v.timestamp).getHours()] = (hourlyTraffic[new Date(v.timestamp).getHours()] || 0) + 1;
      if (v.duration && v.duration > 0) { totalDuration += v.duration; validDurations++; if (v.duration < 5) bounces++; }
      if (v.is_israel) israelVisits++;
      if (v.country_code) countries[v.country_code] = (countries[v.country_code] || 0) + 1;
      
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname.replace('www.', '');
          if (host.includes('instagram')) sources['📸 Instagram'] = (sources['📸 Instagram'] || 0) + 1;
          else if (host.includes('facebook')) sources['👥 Facebook'] = (sources['👥 Facebook'] || 0) + 1;
          else if (host.includes('google')) sources['🔍 Google'] = (sources['🔍 Google'] || 0) + 1;
          else if (host.includes('youtube')) sources['📺 YouTube'] = (sources['📺 YouTube'] || 0) + 1;
          else sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1;
        } catch { sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1; }
      } else { sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1; }
    });

    const avgDuration = validDurations > 0 ? totalDuration / validDurations : 0;
    const bounceRate = validDurations > 0 ? (bounces / validDurations) * 100 : 0;

    // Previous period for comparison
    let prevTotalDuration = 0, prevValidDurations = 0;
    previousPeriod.forEach(v => { if (v.duration && v.duration > 0) { prevTotalDuration += v.duration; prevValidDurations++; }});
    const prevAvgDuration = prevValidDurations > 0 ? prevTotalDuration / prevValidDurations : 0;

    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const topPages = Object.entries(pageVisits).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([page, count]) => ({ page: pageNames[page] || page, count, percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0" }));

    const topSources = Object.entries(sources).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([source, count]) => ({ source, count, percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0" }));

    const peakHours = Object.entries(hourlyTraffic).sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([hour, count]) => ({ hour: `${hour}:00`, count }));
      
    // --- NEW: Top Artist Pages ---
    // The raw 'visits' object has the 'artistPageVisits' property from the API response
    const rawArtistPageVisits = (visits as any).artistPageVisits || {};

    const topArtistPages = Object.entries(rawArtistPageVisits)
      .sort(([, a], [, b]) => (b as any).visits - (a as any).visits)
      .slice(0, 7)
      .map(([slug, data]) => ({
        slug,
        visits: (data as any).visits,
        page: (data as any).page,
      }));
    // --- END NEW LOGIC ---

    return {
      totalVisits: filtered.length,
      uniqueVisitors: uniqueVisitorIds.size,
      returningVisitors: returningInPeriod,
      newVisitors: newInPeriod,
      avgDuration: Math.round(avgDuration),
      bounceRate: bounceRate.toFixed(1),
      israelVisits,
      israelPercentage: filtered.length ? ((israelVisits / filtered.length) * 100).toFixed(1) : "0.0",
      topPages, topSources, topLandingPages, peakHours,
      countriesCount: Object.keys(countries).length,
      deviceData, trendData,
      comparison: {
        prevTotalVisits: previousPeriod.length,
        prevUniqueVisitors: prevUniqueVisitorIds.size,
        prevAvgDuration: Math.round(prevAvgDuration),
        visitsChange: calcChange(filtered.length, previousPeriod.length),
        uniqueChange: calcChange(uniqueVisitorIds.size, prevUniqueVisitorIds.size),
        durationChange: calcChange(avgDuration, prevAvgDuration),
      },
      artistPageVisits: topArtistPages, // <-- NEW DATA POINT
    };
  }, [visits, dateRange, showComparison]);

  // ... (omitting existing fetch and deletion logic for brevity) ...

  const getCategoryTitle = (catId: string) => CATEGORIES.find(c => c.id === catId)?.title || catId;
  const getNomineeName = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat?.nominees.find(n => n.id === nomineeId)?.name || nomineeId;
  };

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (!showComparison) return null;
    const isPositive = value > 0;
    return (
      <div className={`text-xs mt-1 font-medium ${value === 0 ? 'text-gray-400' : isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {value === 0 ? '=' : isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  if (!tally && key && !loading && !error) {
    return <main className="min-h-screen neon-backdrop text-white flex items-center justify-center"><div className="text-6xl animate-pulse">⏳</div></main>;
  }

  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header - ... existing content ... */}

        {/* Login Form - ... existing content ... */}

        {tally && (
          <>
            {/* Tabs - ... existing content ... */}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (
              analyticsLoading ? (
                <div className="p-12 text-center"><div className="text-4xl animate-spin">⏳</div></div>
              ) : !analytics ? (
                <div className="p-12 text-center text-white/50">📊 אין נתונים</div>
              ) : (
                <div className="space-y-6">
                  {/* Filters - ... existing content ... */}
                  
                  {/* Key Metrics - ... existing content ... */}

                  {/* Returning vs New + Devices - ... existing content ... */}

                  {/* Trends Chart - ... existing content ... */}

                  {/* Landing Pages + Top Pages */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🚪 דפי נחיתה</h3>
                      <div className="space-y-3">
                        {analytics.topLandingPages.map((p: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{i + 1}</span>
                                <span className="font-medium">{p.page}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-cyan-400">{p.count}</div><div className="text-xs text-white/50">{p.percentage}%</div></div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full" style={{ width: `${p.percentage}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📄 דפים פופולריים</h3>
                      <div className="space-y-3">
                        {analytics.topPages.map((p: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                                <span className="font-medium">{p.page}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-purple-400">{p.count}</div><div className="text-xs text-white/50">{p.percentage}%</div></div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${p.percentage}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sources + Peak Hours - ... existing content ... */}

                  {/* --- NEW: Top Artist Pages Section --- */}
                  {analytics.artistPageVisits && analytics.artistPageVisits.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔥 עמודי האמנים החמים ביותר</h3>
                      <div className="space-y-3">
                        {analytics.artistPageVisits.map((item: any, i: number) => (
                          <div key={item.slug} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                                <span className="font-medium text-purple-300">/{item.slug}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-purple-400">{item.visits} ביקורים</div></div>
                            </div>
                            <div className="text-xs text-white/50">נתיב: {item.page}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-white/60 mt-4">
                        * נתון זה מציג ביקורים לדפים דינמיים של אמנים ואגדות (/slug או /artist/slug).
                      </div>
                    </div>
                  )}
                  {/* --- END NEW SECTION --- */}
                </div>
              )
            )}

            {/* VOTES TAB - ... existing content ... */}
            {/* SIGNUPS TAB - ... existing content ... */}
            {/* TRACK SUBMISSIONS TAB - ... existing content ... */}
            {/* ARTISTS TAB - ... existing content ... */}
          </>
        )}
      </div>
    </main>
  );
}
