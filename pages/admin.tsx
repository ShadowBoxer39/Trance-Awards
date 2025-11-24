// pages/admin.tsx - IMPROVED VERSION WITH BETTER UX

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

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
  
  const [activeTab, setActiveTab] = React.useState<"votes" | "signups" | "analytics" | "track-submissions">("votes");

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
      }
    }
  }, [tally, activeTab]);

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

  const deleteTrack = async (trackId: string) => {
    if (!confirm("האם למחוק המלצה זו?")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/delete-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, trackId }),
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

  const deleteSignup = async (signupId: string) => {
    if (!confirm("האם למחוק הרשמה זו?")) return;
    setLoading(true);
    try {
      const response = await fetch('/api/delete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, signupId }),
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

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setVisits(j.visits as VisitData[]);
    } catch (err: any) {
      alert("שגיאה בטעינת סטטיסטיקות");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const resetAnalytics = async () => {
    if (!confirm("⚠️ האם אתה בטוח שברצונך למחוק את כל נתוני הסטטיסטיקה? פעולה זו לא ניתנת לביטול!")) return;
    if (!confirm("אישור סופי: כל נתוני הביקורים יימחקו לצמיתות. להמשיך?")) return;
    
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/reset-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("תשובה לא תקינה מהשרת");
      }
      
      const result = await response.json();
      
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'שגיאה באיפוס נתונים');
      }
      
      alert("✅ נתוני הסטטיסטיקה אופסו בהצלחה!");
      setVisits([]);
    } catch (error: any) {
      console.error('Reset analytics error:', error);
      alert(`שגיאה: ${error.message || 'שגיאה לא ידועה'}`);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getAnalytics = () => {
    const pageVisits: Record<string, number> = {};
    const dailyVisits: Record<string, number> = {};
    const weeklyVisits: Record<string, number> = {};
    const monthlyVisits: Record<string, number> = {};
    const countryVisits: Record<string, number> = {};
    const referrerData: Record<string, number> = {};
    let totalDuration = 0;
    let validDurations = 0;
    let israelVisits = 0;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    visits.forEach((v) => {
      const visitDate = new Date(v.timestamp);
      
      pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;
      const dateKey = visitDate.toISOString().split('T')[0];
      dailyVisits[dateKey] = (dailyVisits[dateKey] || 0) + 1;
      
      if (visitDate >= weekStart) {
        weeklyVisits[dateKey] = (weeklyVisits[dateKey] || 0) + 1;
      }
      if (visitDate >= monthStart) {
        monthlyVisits[dateKey] = (monthlyVisits[dateKey] || 0) + 1;
      }
      
      if (v.country_code) countryVisits[v.country_code] = (countryVisits[v.country_code] || 0) + 1;
      if (v.duration && v.duration > 0) {
        totalDuration += v.duration;
        validDurations++;
      }
      if (v.is_israel) israelVisits++;
      
      if (v.referrer) {
        try {
          const refUrl = new URL(v.referrer);
          const source = refUrl.hostname.replace('www.', '');
          referrerData[source] = (referrerData[source] || 0) + 1;
        } catch {
          referrerData['ישיר'] = (referrerData['ישיר'] || 0) + 1;
        }
      } else {
        referrerData['ישיר'] = (referrerData['ישיר'] || 0) + 1;
      }
    });

    const avgDuration = validDurations > 0 ? totalDuration / validDurations : 0;
    
    const dailyChartData = Object.keys(dailyVisits).sort().slice(-14).map((date) => ({
      date: new Date(date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
      visits: dailyVisits[date],
    }));

    const weeklyTotal = Object.values(weeklyVisits).reduce((a, b) => a + b, 0);
    const monthlyTotal = Object.values(monthlyVisits).reduce((a, b) => a + b, 0);
    const dailyTotal = dailyVisits[now.toISOString().split('T')[0]] || 0;

    const topPages = Object.entries(pageVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));

    const topCountries = Object.entries(countryVisits)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, count], index) => ({ 
        name: country === 'IL' ? '🇮🇱 ישראל' : country, 
        value: count,
        color: COLORS[index % COLORS.length]
      }));

    const topReferrers = Object.entries(referrerData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    return { 
      pageVisits, 
      dailyVisits, 
      countryVisits, 
      avgDuration, 
      israelVisits, 
      dailyChartData,
      weeklyTotal,
      monthlyTotal,
      dailyTotal,
      topPages,
      topCountries,
      topReferrers
    };
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
                  activeTab === "track-submissions" ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                💬 טרקים להמלצה ({trackSubs.length})
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "analytics" ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                📊 סטטיסטיקות ({visits.length})
              </button>
            </div>

            {/* VOTES TAB */}
            {activeTab === "votes" && (
              <>
                <div className="glass rounded-2xl p-6">
                  <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">תוצאות הצבעה</h2>
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

                  <div className="space-y-6">
                    {Object.entries(tally).map(([catId, nominees]) => {
                      const totalCat = Object.values(nominees).reduce((s, c) => s + c, 0);
                      const sortedNominees = Object.entries(nominees).sort(([, a], [, b]) => b - a);
                      
                      return (
                        <div key={catId} className="glass rounded-xl p-6 space-y-4">
                          {/* Category Header */}
                          <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-xl font-bold text-cyan-400">{getCategoryTitle(catId)}</h3>
                            <div className="text-sm bg-purple-500/20 px-3 py-1 rounded-lg">
                              <span className="text-white/80">{totalCat} הצבעות</span>
                            </div>
                          </div>

                          {/* Nominees Table */}
                          <div className="space-y-2">
                            {sortedNominees.map(([nomineeId, count], index) => {
                              const percentage = totalCat > 0 ? ((count / totalCat) * 100).toFixed(1) : "0";
                              const isWinner = index === 0;
                              const isTop3 = index < 3;
                              
                              return (
                                <div
                                  key={nomineeId}
                                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                                    isWinner 
                                      ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border-l-4 border-yellow-500' 
                                      : isTop3
                                      ? 'bg-gradient-to-r from-cyan-500/10 to-transparent border-l-2 border-cyan-500/50'
                                      : 'bg-white/5 hover:bg-white/10'
                                  }`}
                                >
                                  {/* Rank */}
                                  <div className="flex-shrink-0 w-10 text-center">
                                    {isWinner ? (
                                      <span className="text-2xl">🏆</span>
                                    ) : isTop3 ? (
                                      <span className="text-xl">{index === 1 ? '🥈' : '🥉'}</span>
                                    ) : (
                                      <span className="text-white/40 font-semibold">#{index + 1}</span>
                                    )}
                                  </div>

                                  {/* Name */}
                                  <div className="flex-1 min-w-0">
                                    <div className={`font-semibold ${isWinner ? 'text-yellow-300' : 'text-white'} truncate`}>
                                      {getNomineeName(catId, nomineeId)}
                                    </div>
                                  </div>

                                  {/* Stats */}
                                  <div className="flex items-center gap-4 flex-shrink-0">
                                    {/* Progress Bar */}
                                    <div className="hidden sm:block w-32 bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          isWinner 
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                            : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>

                                    {/* Votes */}
                                    <div className="text-center min-w-[80px]">
                                      <div className={`text-lg font-bold ${isWinner ? 'text-yellow-300' : 'text-cyan-400'}`}>
                                        {count}
                                      </div>
                                      <div className="text-xs text-white/50">
                                        {percentage}%
                                      </div>
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
                </div>
              </>
            )}

            {/* SIGNUPS TAB */}
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

            {/* TRACK SUBMISSIONS TAB */}
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

            {/* ANALYTICS TAB - REDESIGNED */}
            {activeTab === "analytics" && (() => {
              const analytics = getAnalytics();
              return (
                <>
                  <div className="glass rounded-2xl p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">סטטיסטיקות אתר</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={resetAnalytics} 
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl px-4 py-2 text-sm transition font-semibold" 
                        disabled={analyticsLoading || visits.length === 0}
                      >
                        🗑️ אפס נתונים
                      </button>
                      <button onClick={fetchAnalytics} className="btn-primary rounded-xl px-4 py-2 text-sm" disabled={analyticsLoading}>
                        {analyticsLoading ? "טוען..." : `🔄 רענן`}
                      </button>
                    </div>
                  </div>
                  
                  {analyticsLoading ? (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4 animate-spin">⏳</div>
                      <p>טוען סטטיסטיקות...</p>
                    </div>
                  ) : visits.length === 0 ? (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4">📊</div>
                      <p>אין נתונים</p>
                    </div>
                  ) : (
                    <>
                      {/* Quick Stats Overview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass rounded-2xl p-6 text-center">
                          <div className="text-4xl mb-2">📅</div>
                          <div className="text-3xl font-bold text-cyan-400 mb-1">{analytics.dailyTotal}</div>
                          <div className="text-sm text-white/60">היום</div>
                        </div>
                        <div className="glass rounded-2xl p-6 text-center">
                          <div className="text-4xl mb-2">📆</div>
                          <div className="text-3xl font-bold text-purple-400 mb-1">{analytics.weeklyTotal}</div>
                          <div className="text-sm text-white/60">שבוע אחרון</div>
                        </div>
                        <div className="glass rounded-2xl p-6 text-center">
                          <div className="text-4xl mb-2">🗓️</div>
                          <div className="text-3xl font-bold text-green-400 mb-1">{analytics.monthlyTotal}</div>
                          <div className="text-sm text-white/60">חודש אחרון</div>
                        </div>
                        <div className="glass rounded-2xl p-6 text-center">
                          <div className="text-4xl mb-2">📊</div>
                          <div className="text-3xl font-bold text-yellow-400 mb-1">{visits.length}</div>
                          <div className="text-sm text-white/60">סה״כ</div>
                        </div>
                      </div>

                      {/* Secondary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60">ממוצע זמן</span>
                            <span className="text-2xl">⏱️</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-400">{formatDuration(Math.round(analytics.avgDuration))}</div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60">מישראל 🇮🇱</span>
                            <span className="text-2xl">🌍</span>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            {analytics.israelVisits} ({((analytics.israelVisits / visits.length) * 100).toFixed(0)}%)
                          </div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white/60">מדינות</span>
                            <span className="text-2xl">🗺️</span>
                          </div>
                          <div className="text-2xl font-bold text-yellow-400">{Object.keys(analytics.countryVisits).length}</div>
                        </div>
                      </div>

                      {/* Traffic Chart */}
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                          <span>📈</span>
                          <span>ביקורים יומיים (14 ימים אחרונים)</span>
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.dailyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="visits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Two Column Layout */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Top Pages */}
                        <div className="glass rounded-2xl p-6">
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span>📄</span>
                            <span>דפים פופולריים</span>
                          </h3>
                          <div className="space-y-3">
                            {analytics.topPages.map((page, idx) => (
                              <div key={page.page} className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white/90 truncate">{page.page === '/' ? 'דף הבית' : page.page}</div>
                                </div>
                                <div className="flex-shrink-0 font-semibold text-cyan-400">{page.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Referrers */}
                        <div className="glass rounded-2xl p-6">
                          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span>🔗</span>
                            <span>מקורות תנועה</span>
                          </h3>
                          <div className="space-y-3">
                            {analytics.topReferrers.map((ref, idx) => (
                              <div key={ref.source} className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                                  idx === 1 ? 'bg-gray-400/20 text-gray-300' :
                                  idx === 2 ? 'bg-orange-500/20 text-orange-400' :
                                  'bg-purple-500/20 text-purple-400'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-white/90 truncate">{ref.source}</div>
                                </div>
                                <div className="flex-shrink-0 font-semibold text-purple-400">{ref.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Country Distribution */}
                      {analytics.topCountries.length > 0 && (
                        <div className="glass rounded-2xl p-6">
                          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span>🌍</span>
                            <span>התפלגות גאוגרפית</span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="flex justify-center">
                              <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                  <Pie
                                    data={analytics.topCountries}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                  >
                                    {analytics.topCountries.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                              {analytics.topCountries.map((country, idx) => (
                                <div key={country.name} className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: country.color }}
                                  />
                                  <div className="flex-1">
                                    <div className="text-white/90">{country.name}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-cyan-400">{country.value}</div>
                                    <div className="text-xs text-white/50">
                                      {((country.value / visits.length) * 100).toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </main>
  );
}
