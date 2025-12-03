// pages/admin.tsx - COMPLETE WORKING VERSION WITH UNIQUE VISITORS
// ✅ All React hooks at top level (no IIFE errors)
// ✅ Full signups tab with grid
// ✅ Full tracks tab with YouTube previews
// ✅ Enhanced analytics with all metrics + UNIQUE VISITORS
// ✅ Added "today" date range filter for analytics

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CATEGORIES } from "@/data/awards-data";
import { createClient } from "@supabase/supabase-js"; 

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
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
  userAgent: string | null;
  entry_time: number | null;
  exit_time: number | null;
  duration: number | null;
  client_ip: string | null;
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
  festival_sets: {
    youtube_id?: string;
    festival?: string | null;
    year?: number | null;
    location?: string | null;
  }[] | null;
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg text-sm" style={{ border: '1px solid #4f46e5' }}>
        <p className="font-semibold text-cyan-400">{label}</p>
        <p>{`${payload[0].value} ביקורים`}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Admin() {
  // ============================================
  // ALL STATE AT TOP LEVEL - NEVER MOVE THESE
  // ============================================
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  
  const [signups, setSignups] = React.useState<Signup[]>([]);
  const [signupsLoading, setSignupsLoading] = React.useState(false);
  const [selectedSignup, setSelectedSignup] = React.useState<Signup | null>(null);
  
  const [trackSubs, setTrackSubs] = React.useState<TrackSubmission[]>([]);
  const [trackSubsLoading, setTrackSubsLoading] = React.useState(false);
  const [selectedTrackSub, setSelectedTrackSub] = React.useState<TrackSubmission | null>(null);

  const [visits, setVisits] = React.useState<VisitData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  const [totalUniqueVisitors, setTotalUniqueVisitors] = React.useState<number>(0);
  
  // ⭐ Analytics date range state – now includes "today"
  const [dateRange, setDateRange] = React.useState<"today" | "7d" | "30d" | "all">("today");
  
  const [activeTab, setActiveTab] = React.useState<
    "votes" | "signups" | "analytics" | "track-submissions" | "artists"
  >("analytics");

  // 🎧 Artists admin
  const [adminArtists, setAdminArtists] = React.useState<AdminArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = React.useState(false);
  const [currentArtist, setCurrentArtist] = React.useState<AdminArtist | null>(null);
  const [primaryEpisodeId, setPrimaryEpisodeId] = React.useState<string>("");
  const [savingArtist, setSavingArtist] = React.useState(false);

  // ============================================
  // Analytics calculation with UNIQUE VISITORS
  // ============================================
  const analytics = React.useMemo(() => {
    if (!visits || visits.length === 0) return null;
    
    const now = new Date();
    const filtered = visits.filter(v => {
      const visitDate = new Date(v.timestamp);

      if (dateRange === "today") {
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        return visitDate >= startOfDay;
      }

      if (dateRange === "7d") {
        return visitDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      if (dateRange === "30d") {
        return visitDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // "all"
      return true;
    });

    // Calculate unique visitors for filtered period
    const uniqueVisitorIds = new Set<string>();
    filtered.forEach(v => {
      if (v.visitor_id) {
        uniqueVisitorIds.add(v.visitor_id);
      }
    });
    const filteredUniqueVisitors = uniqueVisitorIds.size;

    const pageVisits: Record<string, number> = {};
    const pageNames: Record<string, string> = {
      '/': '🏠 דף הבית',
      '/episodes': '🎧 פרקים',
      '/track-of-the-week': '🎵 הטראק השבועי',
      '/featured-artist': '⭐ האמן המומלץ',
      '/young-artists': '🌟 אמנים צעירים',
      '/vote': '🗳️ הצבעה',
      '/awards': '🏆 פרסים'
    };

    const sources: Record<string, number> = {};
    const hourlyTraffic: Record<number, number> = {};
    let totalDuration = 0;
    let validDurations = 0;
    let bounces = 0;
    let israelVisits = 0;
    const countries: Record<string, number> = {};

    filtered.forEach(v => {
      pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;
      const hour = new Date(v.timestamp).getHours();
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
      
      if (v.duration && v.duration > 0) {
        totalDuration += v.duration;
        validDurations++;
        if (v.duration < 5) bounces++;
      }
      
      if (v.is_israel) israelVisits++;
      if (v.country_code) {
        countries[v.country_code] = (countries[v.country_code] || 0) + 1;
      }
      
      if (v.referrer) {
        try {
          const url = new URL(v.referrer);
          const host = url.hostname.replace('www.', '');
          if (host.includes('instagram')) sources['📸 Instagram'] = (sources['📸 Instagram'] || 0) + 1;
          else if (host.includes('facebook')) sources['👥 Facebook'] = (sources['👥 Facebook'] || 0) + 1;
          else if (host.includes('google')) sources['🔍 Google'] = (sources['🔍 Google'] || 0) + 1;
          else if (host.includes('youtube')) sources['📺 YouTube'] = (sources['📺 YouTube'] || 0) + 1;
          else sources[`🔗 ${host}`] = (sources[`🔗 ${host}`] || 0) + 1;
        } catch {
          sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1;
        }
      } else {
        sources['🏠 ישיר'] = (sources['🏠 ישיר'] || 0) + 1;
      }
    });

    const avgDuration = validDurations > 0 ? totalDuration / validDurations : 0;
    const bounceRate = validDurations > 0 ? (bounces / validDurations) * 100 : 0;

    const topPages = Object.entries(pageVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({
        page: pageNames[page] || page,
        count,
        percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0"
      }));

    const topSources = Object.entries(sources)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({
        source,
        count,
        percentage: filtered.length ? ((count / filtered.length) * 100).toFixed(1) : "0.0"
      }));

    const peakHours = Object.entries(hourlyTraffic)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      }));

    return {
      totalVisits: filtered.length,
      uniqueVisitors: filteredUniqueVisitors,
      avgDuration: Math.round(avgDuration),
      bounceRate: bounceRate.toFixed(1),
      israelVisits,
      israelPercentage: filtered.length ? ((israelVisits / filtered.length) * 100).toFixed(1) : "0.0",
      topPages,
      topSources,
      peakHours,
      countriesCount: Object.keys(countries).length
    };
  }, [visits, dateRange]);

  // ============================================
  // useEffect HOOKS
  // ============================================
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading && !error) {
      fetchStats();
    }
  }, [key]);

  React.useEffect(() => {
    if (tally) {
      if (activeTab === "signups") {
        fetchSignups();
      } else if (activeTab === "analytics") {
        fetchAnalytics();
      } else if (activeTab === "track-submissions") {
        fetchTrackSubmissions();
      } else if (activeTab === "artists") {
        fetchArtists();
      }
    }
  }, [tally, activeTab]);

  // ============================================
  // ALL FUNCTIONS
  // ============================================
  const fetchStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key) return;

    setLoading(true);
    setError(null);

    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "שגיאה בטעינת הנתונים");
      }

      setTally(j.tally as Tally);
      setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) {
      setError(err.message || "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackSubmissions = async () => {
    if (!key) return;
    setTrackSubsLoading(true);
    try {
      const r = await fetch(`/api/track-submissions?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to fetch");
      setTrackSubs(j.submissions as TrackSubmission[]);
    } catch (err: any) {
      console.error("Error:", err);
      alert("שגיאה בטעינת טרקים: " + err.message);
    } finally {
      setTrackSubsLoading(false);
    }
  };

  const fetchArtists = async () => {
    if (!key) return;
    setArtistsLoading(true);
    try {
      const r = await fetch(
        `/api/admin-artists?key=${encodeURIComponent(key)}&_t=${Date.now()}`
      );
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to fetch artists");

      const artists = (j.artists as AdminArtist[]) || [];
      setAdminArtists(artists);

      if (artists.length && !currentArtist) {
        const first = artists[0];
        setCurrentArtist(first);
        const primary = first.artist_episodes?.find((e) => e.is_primary);
        setPrimaryEpisodeId(primary ? String(primary.episode_id) : "");
      }
    } catch (err: any) {
      console.error("Error fetching artists", err);
      alert("שגיאה בטעינת דפי אמנים: " + err.message);
    } finally {
      setArtistsLoading(false);
    }
  };

  const saveArtist = async () => {
    if (!key || !currentArtist) return;

    const artistPayload: any = { ...currentArtist };

    // avoid sending id=0 for new
    if (!artistPayload.id || artistPayload.id === 0) {
      delete artistPayload.id;
    }

    // normalize festival + reels
    if (!Array.isArray(artistPayload.festival_sets)) {
      artistPayload.festival_sets = [];
    }
    if (!Array.isArray(artistPayload.instagram_reels)) {
      artistPayload.instagram_reels = [];
    }

    const body = {
      artist: artistPayload,
      primaryEpisodeId: primaryEpisodeId ? Number(primaryEpisodeId) : null,
    };

    setSavingArtist(true);
    try {
      const r = await fetch(
        `/api/admin-artists?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "Failed to save artist");

      await fetchArtists();
      alert("האמן נשמר בהצלחה");
    } catch (err: any) {
      console.error("Error saving artist", err);
      alert("שגיאה בשמירת האמן: " + err.message);
    } finally {
      setSavingArtist(false);
    }
  };

  const approveTrack = async (trackId: string) => {
    if (!confirm("לאשר טרק זה כ'טרק השבועי'?")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/approve-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, trackId }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error);
      alert("✅ הטרק אושר בהצלחה!");
      setSelectedTrackSub(null);
      fetchTrackSubmissions();
    } catch (error: any) {
      alert(`שגיאה: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignups = async () => {
    if (!key) return;
    setSignupsLoading(true);
    try {
      const r = await fetch(`/api/artist-signups?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setSignups(j.signups as Signup[]);
    } catch (err: any) {
      alert("שגיאה בטעינת הרשמות");
    } finally {
      setSignupsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setVisits(j.visits as VisitData[]);
      setTotalUniqueVisitors(j.uniqueVisitors || 0);
    } catch (err: any) {
      alert("שגיאה בטעינת סטטיסטיקות");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const deleteTrack = async (trackId: string) => {
    if (!confirm("האם למחוק המלצה זו?")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/track-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, trackId, action: 'delete' }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("תשובה לא תקינה מהשרת");
      }
      
      const result = await response.json();
      
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'שגיאה במחיקת המלצה');
      }
      
      alert("✅ ההמלצה נמחקה בהצלחה");
      setSelectedTrackSub(null);
      fetchTrackSubmissions();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`שגיאה: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSignup = async (signupId: string) => {
    if (!confirm("האם למחוק הרשמה זו?")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/artist-signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, signupId, action: 'delete' }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("תשובה לא תקינה מהשרת");
      }
      
      const result = await response.json();
      
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'שגיאה במחיקת הרשמה');
      }
      
      alert("✅ ההרשמה נמחקה בהצלחה");
      setSelectedSignup(null);
      fetchSignups();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`שגיאה: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ["שם מלא", "שם במה", "גיל", "טלפון", "ניסיון", "השראות", "לינק", "תאריך"];
    const rows = signups.map((s) => [
      s.full_name, s.stage_name, s.age, s.phone, s.experience_years, 
      s.inspirations, s.track_link, new Date(s.submitted_at).toLocaleString('he-IL')
    ]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `artist-signups-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryTitle = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? cat.title : catId;
  };

  const getNomineeName = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    if (!cat) return nomineeId;
    const nominee = cat.nominees.find((n) => n.id === nomineeId);
    return nominee ? nominee.name : nomineeId;
  };

  if (!tally && key && !loading && !error) {
    return (
      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⏳</div>
          <div className="text-xl text-white/70">טוען נתונים...</div>
        </div>
      </main>
    );
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
            <label className="text-sm text-white/80">Admin Key</label>
            <input
              className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste ADMIN_KEY"
            />
            <button
              className="w-full btn-primary rounded-2xl px-4 py-3 disabled:opacity-50 font-semibold"
              disabled={!key || loading}
              type="submit"
            >
              {loading ? "טוען…" : "טען נתונים"}
            </button>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}

        {tally && (
          <>
            <div className="glass rounded-2xl p-1 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("votes")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "votes" ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                🗳️ תוצאות הצבעה ({totalVotes})
              </button>
              <button
                onClick={() => setActiveTab("signups")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "signups" ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                🌟 הרשמות אמנים ({signups.length})
              </button>
              <button
                onClick={() => setActiveTab("track-submissions")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "track-submissions"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                💬 טרקים להמלצה ({trackSubs.length})
              </button>
              <button
                onClick={() => setActiveTab("artists")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "artists" 
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                🎧 דפי אמנים ({adminArtists.length})
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                📊 סטטיסטיקות ({visits.length})
              </button>
            </div>

            {/* VOTES TAB */}
            {activeTab === "votes" && (
              <>
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">תוצאות הצבעה מפורטות</h2>
                  <div className="flex gap-4 text-sm">
                    <div className="glass px-4 py-2 rounded-lg">
                      <span className="text-white/60">סה״כ הצבעות: </span>
                      <span className="font-bold text-cyan-400">{totalVotes}</span>
                    </div>
                    <div className="glass px-4 py-2 rounded-lg">
                      <span className="text-white/60">קטגוריות: </span>
                      <span className="font-bold text-purple-400">{Object.keys(tally).length}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {Object.entries(tally).map(([catId, nominees]) => {
                    const totalCat = Object.values(nominees).reduce((s, c) => s + c, 0);
                    const sortedNominees = Object.entries(nominees).sort(([, a], [, b]) => b - a);
                    
                    return (
                      <div key={catId} className="glass rounded-2xl p-6">
                        <div className="border-b border-white/10 pb-3 mb-4">
                          <h3 className="text-2xl font-bold text-cyan-400">{getCategoryTitle(catId)}</h3>
                          <p className="text-sm text-white/60 mt-1">סה״כ הצבעות בקטגוריה: <span className="font-medium text-white">{totalCat}</span></p>
                        </div>

                        <div className="space-y-2">
                          {sortedNominees.map(([nomineeId, count], index) => {
                            const percentage = totalCat > 0 ? ((count / totalCat) * 100).toFixed(1) : "0";
                            const isGold = index === 0;
                            const isSilver = index === 1;
                            const isBronze = index === 2;
                            
                            const rankClasses = isGold ? 
                                'bg-yellow-500/10' :
                                isSilver ?
                                'bg-gray-500/10' :
                                isBronze ?
                                'bg-orange-500/10' :
                                'hover:bg-white/5';

                            return (
                              <div
                                key={nomineeId}
                                className={`grid grid-cols-[50px,1fr,100px] items-center gap-4 p-3 rounded-lg transition-all text-sm ${rankClasses}`}
                              >
                                <div className="flex-shrink-0 text-center">
                                  {isGold ? (
                                    <span className="text-2xl">🥇</span>
                                  ) : isSilver ? (
                                    <span className="text-2xl">🥈</span>
                                  ) : isBronze ? (
                                    <span className="text-2xl">🥉</span>
                                  ) : (
                                    <span className="text-white/60 font-medium">#{index + 1}</span>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className={`font-semibold ${isGold ? 'text-yellow-300' : 'text-white'} truncate mb-1`}>
                                    {getNomineeName(catId, nomineeId)}
                                  </div>
                                  
                                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isGold 
                                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                          : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>

                                <div className="text-right flex-shrink-0 w-20">
                                  <div className={`text-base font-bold ${isGold ? 'text-yellow-300' : 'text-cyan-400'}`}>
                                    {count}
                                  </div>
                                  <div className="text-xs text-white/50">
                                    {percentage}%
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* SIGNUPS TAB - FULL VERSION */}
            {activeTab === "signups" && (
              <>
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <h2 className="text-2xl font-semibold">הרשמות אמנים צעירים</h2>
                  <div className="flex gap-2">
                    <button onClick={downloadCSV} className="btn-primary rounded-xl px-4 py-2 text-sm" disabled={signups.length === 0}>
                      📥 הורד CSV
                    </button>
                    <button onClick={fetchSignups} className="btn-secondary rounded-xl px-4 py-2 text-sm" disabled={signupsLoading}>
                      {signupsLoading ? "טוען..." : `🔄 רענן (${signups.length})`}
                    </button>
                  </div>
                </div>
                {signupsLoading ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <p>טוען הרשמות...</p>
                  </div>
                ) : signups.length === 0 ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4">🌟</div>
                    <p>אין הרשמות חדשות</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {signups.map((s) => (
                      <div key={s.id} className="glass rounded-2xl p-4">
                        <h3 className="text-lg font-bold text-cyan-400 mb-1">{s.stage_name}</h3>
                        <p className="text-sm text-white/70 mb-3">{s.full_name}</p>
                        <div className="space-y-1 text-sm mb-3">
                          <p><span className="text-white/60">גיל:</span> {s.age}</p>
                          <p><span className="text-white/60">ניסיון:</span> {s.experience_years}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedSignup(s)} className="btn-primary px-3 py-2 rounded-xl text-sm flex-1">
                            צפה בפרטים
                          </button>
                          <button 
                            onClick={() => deleteSignup(s.id)} 
                            className="bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-xl text-sm transition"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedSignup && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
                    <div className="glass rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">פרטי אמן</h3>
                        <button onClick={() => setSelectedSignup(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="text-sm text-white/60 mb-1">שם במה</div>
                          <div className="text-2xl font-bold text-cyan-400">{selectedSignup.stage_name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">שם מלא</div>
                          <div className="text-lg">{selectedSignup.full_name}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-white/60 mb-1">גיל</div>
                            <div>{selectedSignup.age}</div>
                          </div>
                          <div>
                            <div className="text-sm text-white/60 mb-1">טלפון</div>
                            <div dir="ltr" className="text-left">{selectedSignup.phone}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">ניסיון</div>
                          <div>{selectedSignup.experience_years}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">השראות</div>
                          <div className="text-white/80">{selectedSignup.inspirations}</div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">טרק לדוגמה</div>
                          <a href={selectedSignup.track_link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                            {selectedSignup.track_link}
                          </a>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <button 
                            onClick={() => deleteSignup(selectedSignup.id)} 
                            className="w-full bg-red-500/20 hover:bg-red-500/30 px-4 py-3 rounded-xl font-semibold transition"
                            disabled={loading}
                          >
                            {loading ? 'מוחק...' : '🗑️ מחק הרשמה'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TRACK SUBMISSIONS TAB - FULL VERSION */}
            {activeTab === "track-submissions" && (
              <>
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <h2 className="text-2xl font-semibold">טרקים להמלצה</h2>
                  <button onClick={fetchTrackSubmissions} className="btn-primary rounded-xl px-4 py-2 text-sm" disabled={trackSubsLoading}>
                    {trackSubsLoading ? "טוען..." : `🔄 רענן (${trackSubs.length})`}
                  </button>
                </div>
                {trackSubsLoading ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <p>טוען טרקים...</p>
                  </div>
                ) : trackSubs.length === 0 ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4">🎵</div>
                    <p>אין המלצות טרקים</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trackSubs.map((track) => (
                      <div key={track.id} className={`glass rounded-2xl p-4 ${track.is_approved ? 'bg-green-900/20 border-2 border-green-500/50' : 'border border-purple-500/30'}`}>
                        <p className="text-sm text-cyan-400 mb-1">{new Date(track.created_at).toLocaleDateString('he-IL')}</p>
                        <h3 className="text-lg font-bold mb-2">{track.track_title}</h3>
                        <p className="text-white/80 text-sm mb-1">מגיש: {track.name}</p>
                        <p className="text-white/60 text-xs line-clamp-2 mb-4">{track.description.substring(0, 80)}...</p>
                        <div className="flex flex-col gap-2">
                          {track.is_approved ? (
                            <div className="bg-green-600/50 text-white text-sm py-2 rounded-xl text-center">✅ טרק שבועי פעיל</div>
                          ) : (
                            <button onClick={() => approveTrack(track.id)} className="btn-primary px-3 py-2 rounded-xl text-sm font-semibold" disabled={loading}>
                              {loading ? 'מבצע...' : '⭐ אשר כטרק שבועי'}
                            </button>
                          )}
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedTrackSub(track)} className="btn-secondary px-3 py-2 rounded-xl text-sm flex-1">👁️ צפייה</button>
                            <button 
                              onClick={() => deleteTrack(track.id)} 
                              className="bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-xl text-sm transition"
                              disabled={loading}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTrackSub && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
                    <div className="glass rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">פרטי טרק</h3>
                        <button onClick={() => setSelectedTrackSub(null)} className="text-white/60 hover:text-white text-2xl">✕</button>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                          <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedTrackSub.youtube_url)}`} frameBorder="0" allowFullScreen />
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">שם הטרק</div>
                          <div className="text-2xl font-bold">{selectedTrackSub.track_title}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          {selectedTrackSub.photo_url && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500/50">
                              <img src={selectedTrackSub.photo_url} alt={selectedTrackSub.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-white/60">מגיש</div>
                            <div className="text-lg text-cyan-400 font-semibold">{selectedTrackSub.name}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-white/60 mb-1">הסיבה לבחירה</div>
                          <div className="text-base leading-relaxed bg-black/30 rounded-lg p-4">{selectedTrackSub.description}</div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-white/10">
                          {!selectedTrackSub.is_approved && (
                            <button onClick={() => approveTrack(selectedTrackSub.id)} className="btn-primary px-6 py-3 rounded-xl font-medium flex-1" disabled={loading}>
                              {loading ? 'מאשר...' : '⭐ אשר כטרק שבועי'}
                            </button>
                          )}
                          <a href={selectedTrackSub.youtube_url} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3 rounded-xl font-medium flex-1 text-center">
                            צפה ביוטיוב
                          </a>
                        </div>
                        <button 
                          onClick={() => deleteTrack(selectedTrackSub.id)} 
                          className="w-full bg-red-500/20 hover:bg-red-500/30 px-6 py-3 rounded-xl font-semibold transition"
                          disabled={loading}
                        >
                          {loading ? 'מוחק...' : '🗑️ מחק המלצה'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ARTISTS TAB */}
            {activeTab === "artists" && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <h2 className="text-2xl font-semibold">ניהול דפי אמנים</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={fetchArtists}
                      className="btn-secondary rounded-xl px-4 py-2 text-sm"
                      disabled={artistsLoading}
                    >
                      {artistsLoading ? "טוען..." : "🔄 רענן"}
                    </button>
                    <button
                      onClick={() => {
                        const blank: AdminArtist = {
                          id: 0,
                          slug: "",
                          name: "",
                          stage_name: "",
                          short_bio: "",
                          profile_photo_url: "",
                          started_year: null,
                          spotify_artist_id: "",
                          spotify_url: "",
                          youtube_url: "",
                          soundcloud_profile_url: "",
                          instagram_url: "",
                          tiktok_url: "",
                          website_url: "",
                          primary_color: "#00e0ff",
                          festival_sets: [],
                          instagram_reels: [],
                          artist_episodes: [],
                          booking_agency_name: "",
                          booking_agency_email: "",
                          booking_agency_url: "",
                          record_label_name: "",
                          record_label_url: "",
                          management_email: "",
                        };
                        setCurrentArtist(blank);
                        setPrimaryEpisodeId("");
                      }}
                      className="btn-primary rounded-xl px-4 py-2 text-sm"
                    >
                      ➕ אמן חדש
                    </button>
                  </div>
                </div>

                {artistsLoading ? (
                  <div className="p-8 text-center text-white/60">טוען נתונים…</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* left: list */}
                    <div className="glass rounded-2xl p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                      {adminArtists.map((a) => {
                        const primary = a.artist_episodes?.find((e) => e.is_primary);
                        const hasFestival = !!(a.festival_sets && a.festival_sets.length);
                        const hasReels = !!(a.instagram_reels && a.instagram_reels.length);

                        return (
                          <button
                            key={a.id}
                            className={`w-full text-right p-3 rounded-xl border text-sm transition ${
                              currentArtist?.id === a.id
                                ? "border-cyan-400 bg-cyan-500/10"
                                : "border-white/10 hover:border-cyan-400/60"
                            }`}
                            onClick={() => {
                              setCurrentArtist(a);
                              setPrimaryEpisodeId(
                                primary ? String(primary.episode_id) : ""
                              );
                            }}
                          >
                            <div className="font-semibold text-cyan-300">
                              {a.stage_name || a.name}
                            </div>
                            <div className="text-xs text-white/50">/{a.slug}</div>
                            <div className="flex flex-wrap gap-1 mt-2 text-[11px]">
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                                🎙️ פרק {primary ? primary.episode_id : "—"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  hasFestival
                                    ? "bg-green-500/15 text-green-300"
                                    : "bg-red-500/15 text-red-300"
                                }`}
                              >
                                🎪 פסטיבל {hasFestival ? "✓" : "חסר"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full ${
                                  hasReels
                                    ? "bg-green-500/15 text-green-300"
                                    : "bg-red-500/15 text-red-300"
                                }`}
                              >
                                🎥 רילז {hasReels ? "✓" : "חסר"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* right: edit form */}
                    <div className="glass rounded-2xl p-4 lg:col-span-2">
                      {!currentArtist ? (
                        <div className="text-white/60 text-sm">
                          בחר אמן מהרשימה או לחץ על "אמן חדש"
                        </div>
                      ) : (
                        <div className="space-y-4 text-sm">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/60 mb-1">Slug (כתובת)</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.slug || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    slug: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">שם אמן</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.stage_name || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    stage_name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">שנה "יוצר מאז"</label>
                              <input
                                type="number"
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.started_year ?? ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    started_year: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">
                                מזהה אמן בספוטיפיי
                              </label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.spotify_artist_id || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    spotify_artist_id: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-white/60 mb-1">ביוגרפיה קצרה</label>
                            <textarea
                              className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 min-h-[80px]"
                              value={currentArtist.short_bio || ""}
                              onChange={(e) =>
                                setCurrentArtist({
                                  ...currentArtist,
                                  short_bio: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                              ["youtube_url", "קישור ליוטיוב"],
                              ["spotify_url", "קישור לספוטיפיי"],
                              ["soundcloud_profile_url", "קישור לסאונדקלאוד"],
                              ["instagram_url", "קישור לאינסטגרם"],
                              ["tiktok_url", "קישור לטיקטוק"],
                              ["website_url", "אתר רשמי"],
                            ].map(([field, label]) => (
                              <div key={field}>
                                <label className="block text-white/60 mb-1">{label}</label>
                                <input
                                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                  value={(currentArtist as any)[field] || ""}
                                  onChange={(e) =>
                                    setCurrentArtist({
                                      ...currentArtist,
                                      [field]: e.target.value,
                                    } as any)
                                  }
                                />
                              </div>
                            ))}
                          </div>

                          {/* Booking / Label */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-white/60 mb-1">שם סוכן / בוקינג</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.booking_agency_name || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    booking_agency_name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-white/60 mb-1">אימייל בוקינג</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.booking_agency_email || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    booking_agency_email: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-white/60 mb-1">קישור לאתר הבוקינג</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.booking_agency_url || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    booking_agency_url: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-white/60 mb-1">שם לייבל</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.record_label_name || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    record_label_name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-white/60 mb-1">קישור ללייבל</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.record_label_url || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    record_label_url: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-white/60 mb-1">אימייל לניהול / יצירת קשר</label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.management_email || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    management_email: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/60 mb-1">
                                תמונת פרופיל (URL)
                              </label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.profile_photo_url || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    profile_photo_url: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">
                                צבע הדגשה (hex)
                              </label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={currentArtist.primary_color || ""}
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    primary_color: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/60 mb-1">
                                מזהה פרק ראשי (ID מטבלת episodes)
                              </label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={primaryEpisodeId}
                                onChange={(e) => setPrimaryEpisodeId(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">
                                מזהה וידאו לפסטיבל (YouTube ID)
                              </label>
                              <input
                                className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                value={
                                  currentArtist.festival_sets?.[0]?.youtube_id || ""
                                }
                                onChange={(e) =>
                                  setCurrentArtist({
                                    ...currentArtist,
                                    festival_sets: [
                                      {
                                        ...(currentArtist.festival_sets?.[0] || {}),
                                        youtube_id: e.target.value,
                                      },
                                    ],
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[0, 1, 2].map((idx) => (
                              <div key={idx}>
                                <label className="block text-white/60 mb-1">
                                  ריל #{idx + 1} (קישור אינסטגרם)
                                </label>
                                <input
                                  className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2"
                                  value={currentArtist.instagram_reels?.[idx] || ""}
                                  onChange={(e) => {
                                    const reels = [...(currentArtist.instagram_reels || [])];
                                    reels[idx] = e.target.value;
                                    setCurrentArtist({
                                      ...currentArtist,
                                      instagram_reels: reels,
                                    });
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end gap-3 pt-4">
                            <button
                              onClick={saveArtist}
                              className="btn-primary rounded-xl px-6 py-2"
                              disabled={savingArtist}
                            >
                              {savingArtist ? "שומר…" : "💾 שמור אמן"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS TAB - WITH UNIQUE VISITORS */}
            {activeTab === "analytics" && (
              analyticsLoading ? (
                <div className="p-12 text-center text-white/50">
                  <div className="text-4xl mb-4 animate-spin">⏳</div>
                  <p>טוען סטטיסטיקות...</p>
                </div>
              ) : !analytics || visits.length === 0 ? (
                <div className="p-12 text-center text-white/50">
                  <div className="text-4xl mb-4">📊</div>
                  <p>אין נתונים</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header with filters */}
                  <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center">
                    <h2 className="text-2xl font-semibold">סטטיסטיקות אתר</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDateRange("today")}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          dateRange === "today" 
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" 
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        היום
                      </button>
                      <button
                        onClick={() => setDateRange("7d")}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          dateRange === "7d" 
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" 
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        7 ימים
                      </button>
                      <button
                        onClick={() => setDateRange("30d")}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          dateRange === "30d" 
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" 
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        30 ימים
                      </button>
                      <button
                        onClick={() => setDateRange("all")}
                        className={`px-4 py-2 rounded-xl font-medium transition ${
                          dateRange === "all" 
                            ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" 
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        הכל
                      </button>
                      <button 
                        onClick={fetchAnalytics} 
                        className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition"
                        disabled={analyticsLoading}
                      >
                        🔄 רענן
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics - 5 columns with Unique Visitors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Total Visits */}
                    <div className="glass rounded-2xl p-6 border-l-4 border-cyan-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">סה״כ ביקורים</span>
                        <span className="text-3xl">👥</span>
                      </div>
                      <div className="text-4xl font-bold text-cyan-400">{analytics.totalVisits}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {dateRange === "today"
                          ? "היום"
                          : dateRange === "7d"
                          ? "7 ימים אחרונים"
                          : dateRange === "30d"
                          ? "30 ימים אחרונים"
                          : "כל הזמנים"}
                      </div>
                    </div>

                    {/* Unique Visitors - NEW */}
                    <div className="glass rounded-2xl p-6 border-l-4 border-emerald-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">מבקרים ייחודיים</span>
                        <span className="text-3xl">🧑‍💻</span>
                      </div>
                      <div className="text-4xl font-bold text-emerald-400">{analytics.uniqueVisitors}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {analytics.totalVisits > 0 
                          ? `${((analytics.uniqueVisitors / analytics.totalVisits) * 100).toFixed(0)}% מסה״כ הביקורים`
                          : "אין נתונים"}
                      </div>
                    </div>

                    {/* Average Time */}
                    <div className="glass rounded-2xl p-6 border-l-4 border-purple-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">זמן שהייה ממוצע</span>
                        <span className="text-3xl">⏱️</span>
                      </div>
                      <div className="text-4xl font-bold text-purple-400">{formatDuration(analytics.avgDuration)}</div>
                      <div className="text-xs text-white/40 mt-1">
                        {analytics.avgDuration > 60 ? "💚 שהייה טובה" : "⚠️ שהייה קצרה"}
                      </div>
                    </div>

                    {/* Israel Visitors */}
                    <div className="glass rounded-2xl p-6 border-l-4 border-green-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">מבקרים מישראל</span>
                        <span className="text-3xl">🇮🇱</span>
                      </div>
                      <div className="text-4xl font-bold text-green-400">{analytics.israelPercentage}%</div>
                      <div className="text-xs text-white/40 mt-1">
                        {analytics.israelVisits} מתוך {analytics.totalVisits}
                      </div>
                    </div>

                    {/* Bounce Rate */}
                    <div className="glass rounded-2xl p-6 border-l-4 border-orange-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-sm">אחוז נטישה</span>
                        <span className="text-3xl">📉</span>
                      </div>
                      <div className="text-4xl font-bold text-orange-400">{analytics.bounceRate}%</div>
                      <div className="text-xs text-white/40 mt-1">
                        {parseFloat(analytics.bounceRate) < 40 ? "💚 מצוין" : parseFloat(analytics.bounceRate) < 60 ? "⚠️ בינוני" : "❌ גבוה"}
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Top Pages */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                        <span>📄</span>
                        <span>דפים פופולריים</span>
                      </h3>
                      <div className="space-y-3">
                        {analytics.topPages.map((page: any, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-medium truncate">{page.page}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-3">
                                <div className="text-lg font-bold text-cyan-400">{page.count}</div>
                                <div className="text-xs text-white/50">{page.percentage}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full rounded-full transition-all"
                                style={{ width: `${page.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Traffic Sources */}
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                        <span>🔗</span>
                        <span>מקורות תנועה</span>
                      </h3>
                      <div className="space-y-3">
                        {analytics.topSources.map((source: any, idx: number) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white font-medium truncate">{source.source}</div>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 ml-3">
                                <div className="text-lg font-bold text-purple-400">{source.count}</div>
                                <div className="text-xs text-white/50">{source.percentage}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all"
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <span>🕐</span>
                      <span>שעות שיא</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {analytics.peakHours.map((hour: any, idx: number) => (
                        <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
                          <div className="text-3xl mb-2">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "📊"}
                          </div>
                          <div className="text-2xl font-bold text-cyan-400 mb-1">{hour.hour}</div>
                          <div className="text-sm text-white/60">{hour.count} ביקורים</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center text-sm text-white/50">
                      💡 השעות עם התנועה הכי גבוהה באתר
                    </div>
                  </div>

                  {/* Geographic Summary */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                      <span>🌍</span>
                      <span>תפוצה גאוגרפית</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center bg-white/5 rounded-xl p-6">
                        <div className="text-5xl mb-3">🇮🇱</div>
                        <div className="text-3xl font-bold text-green-400 mb-2">{analytics.israelVisits}</div>
                        <div className="text-white/60 text-sm">ביקורים מישראל</div>
                        <div className="text-green-400 font-semibold mt-1">{analytics.israelPercentage}%</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-xl p-6">
                        <div className="text-5xl mb-3">🌎</div>
                        <div className="text-3xl font-bold text-purple-400 mb-2">{analytics.totalVisits - analytics.israelVisits}</div>
                        <div className="text-white/60 text-sm">ביקורים בינלאומיים</div>
                        <div className="text-purple-400 font-semibold mt-1">{(100 - parseFloat(analytics.israelPercentage)).toFixed(1)}%</div>
                      </div>
                      <div className="text-center bg-white/5 rounded-xl p-6">
                        <div className="text-5xl mb-3">🗺️</div>
                        <div className="text-3xl font-bold text-cyan-400 mb-2">{analytics.countriesCount}</div>
                        <div className="text-white/60 text-sm">מדינות שונות</div>
                        <div className="text-cyan-400 font-semibold mt-1">טווח גלובלי</div>
                      </div>
                    </div>
                  </div>

                </div>
              )
            )}

          </>
        )}
      </div>
    </main>
  );
}
