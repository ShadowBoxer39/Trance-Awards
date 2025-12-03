// pages/admin.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

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
  // New state for artist stats to avoid conflicting with 'visits' structure
  const [artistStats, setArtistStats] = React.useState<any[]>([]); 
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  const [dateRange, setDateRange] = React.useState<"today" | "7d" | "30d" | "all">("today");
  const [showComparison, setShowComparison] = React.useState(false);
  
  const [activeTab, setActiveTab] = React.useState<"votes" | "signups" | "analytics" | "track-submissions" | "artists">("analytics");

  const [adminArtists, setAdminArtists] = React.useState<AdminArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = React.useState(false);
  const [currentArtist, setCurrentArtist] = React.useState<AdminArtist | null>(null);
  const [primaryEpisodeId, setPrimaryEpisodeId] = React.useState<string>("");
  const [savingArtist, setSavingArtist] = React.useState(false);

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
      }
    };
  }, [visits, dateRange, showComparison]);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading && !error) fetchStats();
  }, [key]);

  React.useEffect(() => {
    if (tally) {
      if (activeTab === "signups") fetchSignups();
      else if (activeTab === "analytics") fetchAnalytics();
      else if (activeTab === "track-submissions") fetchTrackSubmissions();
      else if (activeTab === "artists") fetchArtists();
    }
  }, [tally, activeTab]);

  const fetchStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "שגיאה");
      setTally(j.tally); setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      
      // Update visits (for existing charts)
      setVisits(j.visits || []);
      
      // Update artist stats (for the new section)
      // Convert the object to a sorted array
      if (j.artistPageVisits) {
        const sortedArtists = Object.values(j.artistPageVisits).sort((a: any, b: any) => b.visits - a.visits);
        setArtistStats(sortedArtists);
      }
    } catch { alert("שגיאה בטעינת סטטיסטיקות"); }
    finally { setAnalyticsLoading(false); }
  };

  const fetchSignups = async () => {
    if (!key) return;
    setSignupsLoading(true);
    try {
      const r = await fetch(`/api/artist-signups?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setSignups(j.signups);
    } catch { alert("שגיאה בטעינת הרשמות"); }
    finally { setSignupsLoading(false); }
  };

  const fetchTrackSubmissions = async () => {
    if (!key) return;
    setTrackSubsLoading(true);
    try {
      const r = await fetch(`/api/track-submissions?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setTrackSubs(j.submissions);
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setTrackSubsLoading(false); }
  };

  const fetchArtists = async () => {
    if (!key) return;
    setArtistsLoading(true);
    try {
      const r = await fetch(`/api/admin-artists?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setAdminArtists(j.artists || []);
      if (j.artists?.length && !currentArtist) {
        setCurrentArtist(j.artists[0]);
        const primary = j.artists[0].artist_episodes?.find((e: any) => e.is_primary);
        setPrimaryEpisodeId(primary ? String(primary.episode_id) : "");
      }
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setArtistsLoading(false); }
  };

  const saveArtist = async () => {
    if (!key || !currentArtist) return;
    const payload: any = { ...currentArtist };
    if (!payload.id) delete payload.id;
    if (!Array.isArray(payload.festival_sets)) payload.festival_sets = [];
    if (!Array.isArray(payload.instagram_reels)) payload.instagram_reels = [];
    setSavingArtist(true);
    try {
      const r = await fetch(`/api/admin-artists?key=${encodeURIComponent(key)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist: payload, primaryEpisodeId: primaryEpisodeId ? Number(primaryEpisodeId) : null }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      await fetchArtists();
      alert("האמן נשמר בהצלחה");
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setSavingArtist(false); }
  };

  const approveTrack = async (trackId: string) => {
    if (!confirm("לאשר טרק זה?")) return;
    setLoading(true);
    try {
      const r = await fetch('/api/approve-track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, trackId }) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error);
      alert("✅ הטרק אושר!");
      setSelectedTrackSub(null);
      fetchTrackSubmissions();
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setLoading(false); }
  };

  const deleteTrack = async (trackId: string) => {
    if (!confirm("למחוק?")) return;
    setLoading(true);
    try {
      const r = await fetch('/api/track-submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, trackId, action: 'delete' }) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error);
      alert("✅ נמחק!");
      setSelectedTrackSub(null);
      fetchTrackSubmissions();
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setLoading(false); }
  };

  const deleteSignup = async (signupId: string) => {
    if (!confirm("למחוק?")) return;
    setLoading(true);
    try {
      const r = await fetch('/api/artist-signups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, signupId, action: 'delete' }) });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error);
      alert("✅ נמחק!");
      setSelectedSignup(null);
      fetchSignups();
    } catch (err: any) { alert("שגיאה: " + err.message); }
    finally { setLoading(false); }
  };

  const downloadCSV = () => {
    const headers = ["שם מלא", "שם במה", "גיל", "טלפון", "ניסיון", "השראות", "לינק", "תאריך"];
    const rows = signups.map(s => [s.full_name, s.stage_name, s.age, s.phone, s.experience_years, s.inspirations, s.track_link, new Date(s.submitted_at).toLocaleString('he-IL')]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `signups-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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

  if (!tally && key && !loading && !error) {
    return <main className="min-h-screen neon-backdrop text-white flex items-center justify-center"><div className="text-6xl animate-pulse">⏳</div></main>;
  }

  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-title">Admin Dashboard</h1>
          {totalVotes > 0 && (
            <div className="glass rounded-2xl px-6 py-3">
              <div className="text-sm text-white/60">סה״כ הצבעות</div>
              <div className="text-3xl font-bold text-cyan-400">{totalVotes}</div>
            </div>
          )}
        </div>

        {!tally && (
          <form onSubmit={fetchStats} className="glass p-6 rounded-2xl max-w-md mx-auto space-y-4">
            <input className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3" type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="Admin Key" />
            <button className="w-full btn-primary rounded-2xl px-4 py-3 font-semibold disabled:opacity-50" disabled={!key || loading}>{loading ? "טוען…" : "התחבר"}</button>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}

        {tally && (
          <>
            <div className="glass rounded-2xl p-1 flex gap-2 overflow-x-auto">
              {[
                { id: "votes", label: `🗳️ הצבעות (${totalVotes})` },
                { id: "signups", label: `🌟 הרשמות (${signups.length})` },
                { id: "track-submissions", label: `💬 טרקים (${trackSubs.length})` },
                { id: "artists", label: `🎧 אמנים (${adminArtists.length})` },
                { id: "analytics", label: `📊 סטטיסטיקות (${visits.length})` },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" : "text-white/60 hover:text-white"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "analytics" && (
              analyticsLoading ? (
                <div className="p-12 text-center"><div className="text-4xl animate-spin">⏳</div></div>
              ) : !analytics ? (
                <div className="p-12 text-center text-white/50">📊 אין נתונים</div>
              ) : (
                <div className="space-y-6">
                  <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="text-2xl font-semibold">סטטיסטיקות אתר</h2>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(["today", "7d", "30d", "all"] as const).map(range => (
                        <button key={range} onClick={() => setDateRange(range)}
                          className={`px-4 py-2 rounded-xl font-medium transition ${dateRange === range ? "bg-gradient-to-r from-cyan-500 to-purple-500" : "bg-white/5 text-white/60 hover:text-white"}`}>
                          {range === "today" ? "היום" : range === "7d" ? "7 ימים" : range === "30d" ? "30 ימים" : "הכל"}
                        </button>
                      ))}
                      <div className="h-6 w-px bg-white/20 mx-2" />
                      <button onClick={() => setShowComparison(!showComparison)}
                        className={`px-4 py-2 rounded-xl font-medium transition ${showComparison ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/5 text-white/60"}`}>
                        📊 השוואה
                      </button>
                      <button onClick={fetchAnalytics} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl">🔄</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="glass rounded-2xl p-5 border-r-4 border-cyan-500">
                      <div className="flex justify-between mb-2"><span className="text-white/60 text-sm">סה״כ ביקורים</span><span className="text-2xl">👥</span></div>
                      <div className="text-3xl font-bold text-cyan-400">{analytics.totalVisits}</div>
                      <ChangeIndicator value={analytics.comparison.visitsChange} />
                    </div>
                    <div className="glass rounded-2xl p-5 border-r-4 border-emerald-500">
                      <div className="flex justify-between mb-2"><span className="text-white/60 text-sm">מבקרים ייחודיים</span><span className="text-2xl">🧑‍💻</span></div>
                      <div className="text-3xl font-bold text-emerald-400">{analytics.uniqueVisitors}</div>
                      <ChangeIndicator value={analytics.comparison.uniqueChange} />
                    </div>
                    <div className="glass rounded-2xl p-5 border-r-4 border-purple-500">
                      <div className="flex justify-between mb-2"><span className="text-white/60 text-sm">זמן שהייה</span><span className="text-2xl">⏱️</span></div>
                      <div className="text-3xl font-bold text-purple-400">{formatDuration(analytics.avgDuration)}</div>
                      <ChangeIndicator value={analytics.comparison.durationChange} />
                    </div>
                    <div className="glass rounded-2xl p-5 border-r-4 border-green-500">
                      <div className="flex justify-between mb-2"><span className="text-white/60 text-sm">מישראל</span><span className="text-2xl">🇮🇱</span></div>
                      <div className="text-3xl font-bold text-green-400">{analytics.israelPercentage}%</div>
                    </div>
                    <div className="glass rounded-2xl p-5 border-r-4 border-orange-500">
                      <div className="flex justify-between mb-2"><span className="text-white/60 text-sm">נטישה</span><span className="text-2xl">📉</span></div>
                      <div className="text-3xl font-bold text-orange-400">{analytics.bounceRate}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔄 חוזרים מול חדשים</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-500/20 rounded-xl p-4 text-center">
                          <div className="text-4xl mb-2">🔁</div>
                          <div className="text-3xl font-bold text-blue-400">{analytics.returningVisitors}</div>
                          <div className="text-sm text-white/60">חוזרים</div>
                          <div className="text-xs text-blue-300">{analytics.uniqueVisitors > 0 ? ((analytics.returningVisitors / analytics.uniqueVisitors) * 100).toFixed(0) : 0}%</div>
                        </div>
                        <div className="bg-green-500/20 rounded-xl p-4 text-center">
                          <div className="text-4xl mb-2">✨</div>
                          <div className="text-3xl font-bold text-green-400">{analytics.newVisitors}</div>
                          <div className="text-sm text-white/60">חדשים</div>
                          <div className="text-xs text-green-300">{analytics.uniqueVisitors > 0 ? ((analytics.newVisitors / analytics.uniqueVisitors) * 100).toFixed(0) : 0}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📱 מכשירים</h3>
                      <div className="flex items-center justify-around">
                        <div className="w-32 h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart><Pie data={analytics.deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value">
                              {analytics.deviceData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                            </Pie></PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-2">
                          {analytics.deviceData.map((d: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-sm">{d.name}: {d.value} ({analytics.totalVisits > 0 ? ((d.value / analytics.totalVisits) * 100).toFixed(0) : 0}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {dateRange !== "today" && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📈 מגמת ביקורים</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.trendData}>
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="visits" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} name="ביקורים" />
                            {showComparison && <Line type="monotone" dataKey="previousVisits" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} name="תקופה קודמת" />}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      {showComparison && (
                        <div className="flex justify-center gap-6 mt-4 text-sm">
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-cyan-500 rounded" /><span>תקופה נוכחית</span></div>
                          <div className="flex items-center gap-2"><div className="w-4 h-1 bg-yellow-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 5px, transparent 5px, transparent 10px)' }} /><span>תקופה קודמת</span></div>
                        </div>
                      )}
                    </div>
