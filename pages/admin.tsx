// pages/admin.tsx
import React from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

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
  created_at?: string;
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

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return dateString;
  }
};

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

  const [analytics, setAnalytics] = React.useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  const [dateRange, setDateRange] = React.useState<"today" | "7d" | "30d" | "all">("today");
  const [showComparison, setShowComparison] = React.useState(false);
  
  const [activeTab, setActiveTab] = React.useState<"signups" | "analytics" | "track-submissions" | "artists">("signups");
  const [showVotesArchive, setShowVotesArchive] = React.useState(false);

  const [adminArtists, setAdminArtists] = React.useState<AdminArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = React.useState(false);
  const [currentArtist, setCurrentArtist] = React.useState<AdminArtist | null>(null);
  const [primaryEpisodeId, setPrimaryEpisodeId] = React.useState<string>("");
  const [savingArtist, setSavingArtist] = React.useState(false);

  const duplicatePhones = React.useMemo(() => {
    const phoneCount: Record<string, number> = {};
    signups.forEach(s => {
      if (s.phone) {
        const cleanPhone = s.phone.replace(/\D/g, '');
        phoneCount[cleanPhone] = (phoneCount[cleanPhone] || 0) + 1;
      }
    });
    return new Set(Object.keys(phoneCount).filter(phone => phoneCount[phone] > 1));
  }, [signups]);

  const isDuplicate = (phone: string) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return duplicatePhones.has(cleanPhone);
  };

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
  }, [tally, activeTab, dateRange]);

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
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&range=${dateRange}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setAnalytics(j.analytics);
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
    const rows = signups.map(s => [s.full_name, s.stage_name, s.age, s.phone, s.experience_years, s.inspirations, s.track_link, new Date(s.submitted_at || s.created_at || '').toLocaleString('he-IL')]);
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
            <div className="flex flex-wrap gap-4 mb-6">
              <Link href="/admin/featured-artist" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition hover:scale-105">
                 ⭐ ניהול אמן מומלץ
              </Link>
              <Link href="/admin/duels" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold border-purple-500/50 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2 transition hover:scale-105">
                 ⚔️ ניהול דואל יומי
              </Link>
              <button onClick={() => setShowVotesArchive(true)} className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold border-amber-500/50 text-amber-300 hover:bg-amber-500/20 flex items-center gap-2 transition hover:scale-105">
                📊 ארכיון הצבעות 2025 ({totalVotes.toLocaleString()})
              </button>
            </div>

            <div className="glass rounded-2xl p-1 flex gap-2 overflow-x-auto">
              {[
                { id: "signups", label: `🌟 הרשמות (${signups.length})` },
                { id: "track-submissions", label: `💬 טרקים (${trackSubs.length})` },
                { id: "artists", label: `🎧 אמנים (${adminArtists.length})` },
                { id: "analytics", label: `📊 סטטיסטיקות` },
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

                  {dateRange !== "today" && analytics.trendData && analytics.trendData.length > 0 && (
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📈 מגמת ביקורים</h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.trendData}>
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="visits" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} name="ביקורים" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🚪 דפי נחיתה</h3>
                      <div className="space-y-3">
                        {analytics.topLandingPages?.map((p: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{i + 1}</span>
                                <span className="font-medium truncate max-w-[250px] block" title={p.page}>{p.page}</span>
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
                        {analytics.topPages?.map((p: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                                <span className="font-medium truncate max-w-[250px] block" title={p.page}>{p.page}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-purple-400">{p.count}</div><div className="text-xs text-white/50">{p.percentage}%</div></div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full" style={{ width: `${p.percentage}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔗 מקורות תנועה</h3>
                      <div className="space-y-3">
                        {analytics.topSources?.map((s: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-pink-500/20 text-pink-400'}`}>{i + 1}</span>
                                <span className="font-medium truncate max-w-[200px]" title={s.source}>{s.source}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-pink-400">{s.count}</div><div className="text-xs text-white/50">{s.percentage}%</div></div>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-gradient-to-r from-pink-500 to-orange-500 h-full rounded-full" style={{ width: `${s.percentage}%` }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🕐 שעות שיא</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {analytics.peakHours?.map((h: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📊"}</div>
                            <div className="text-lg font-bold text-cyan-400">{h.hour}</div>
                            <div className="text-xs text-white/60">{h.count}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analytics.topArtists && analytics.topArtists.length > 0 && (
                    <div className="glass rounded-2xl p-6 mt-4">
                      <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔥 עמודי האמנים החמים ביותר</h3>
                      <div className="space-y-3">
                        {analytics.topArtists.map((stat: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3">
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                                <span className="font-medium text-lg text-cyan-300">{stat.slug}</span>
                              </div>
                              <div className="text-left"><div className="font-bold text-purple-400">{stat.visits} ביקורים</div></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {activeTab === "signups" && (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">הרשמות אמנים</h2>
                  <div className="flex gap-2">
                    <button onClick={downloadCSV} className="btn-primary rounded-xl px-4 py-2 text-sm" disabled={!signups.length}>📥 CSV</button>
                    <button onClick={fetchSignups} className="btn-secondary rounded-xl px-4 py-2 text-sm">{signupsLoading ? "..." : "🔄"}</button>
                  </div>
                </div>
                {signupsLoading ? <div className="text-center p-12">⏳</div> : !signups.length ? <div className="text-center p-12 text-white/50">אין הרשמות</div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {signups.map(s => {
                      const hasDuplicate = isDuplicate(s.phone);
                      return (
                        <div key={s.id} className={`glass rounded-2xl p-5 transition-all hover:scale-[1.01] ${hasDuplicate ? 'border-2 border-orange-500/50 bg-orange-500/5' : 'border border-white/10'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-cyan-400">{s.stage_name}</h3>
                              <p className="text-sm text-white/60">{s.full_name}</p>
                            </div>
                            {hasDuplicate && (
                              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">⚠️ כפול</span>
                            )}
                          </div>
                          <div className="border-t border-white/10 my-3" />
                          <div className="space-y-1.5 text-sm mb-3">
                            <div className="flex items-center gap-2"><span>📞</span><span className="text-white/80 font-mono">{s.phone}</span></div>
                            <div className="flex items-center gap-2"><span>🎂</span><span className="text-white/60">גיל:</span><span className="text-white/80">{s.age}</span></div>
                            <div className="flex items-center gap-2"><span>🎵</span><span className="text-white/60">ניסיון:</span><span className="text-white/80">{s.experience_years}</span></div>
                            {s.inspirations && (<div className="flex items-start gap-2"><span>💭</span><span className="text-white/60 line-clamp-1">{s.inspirations}</span></div>)}
                            <div className="flex items-center gap-2"><span>📅</span><span className="text-white/60">נשלח:</span><span className="text-white/80">{formatDate(s.submitted_at || s.created_at || '')}</span></div>
                          </div>
                          <div className="border-t border-white/10 my-3" />
                          <div className="flex gap-2">
                            <a href={s.track_link} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2 px-3 rounded-xl text-sm text-center transition flex items-center justify-center gap-1">🎧 האזן לטראק</a>
                            <button onClick={() => setSelectedSignup(s)} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition" title="פרטים">👁️</button>
                            <button onClick={() => deleteSignup(s.id)} className="bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-xl transition">🗑️</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedSignup && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6" onClick={() => setSelectedSignup(null)}>
                    <div className="glass rounded-xl max-w-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between"><h3 className="text-xl font-bold text-cyan-400">{selectedSignup.stage_name}</h3><button onClick={() => setSelectedSignup(null)} className="text-2xl">✕</button></div>
                      <p><b>שם מלא:</b> {selectedSignup.full_name}</p>
                      <p><b>גיל:</b> {selectedSignup.age} | <b>טלפון:</b> {selectedSignup.phone}</p>
                      <p><b>ניסיון:</b> {selectedSignup.experience_years}</p>
                      <p><b>השראות:</b> {selectedSignup.inspirations}</p>
                      <a href={selectedSignup.track_link} target="_blank" className="text-cyan-400 hover:underline block">🎵 {selectedSignup.track_link}</a>
                      <button onClick={() => deleteSignup(selectedSignup.id)} className="w-full bg-red-500/20 py-3 rounded-xl">🗑️ מחק</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "track-submissions" && (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">טרקים להמלצה</h2>
                  <button onClick={fetchTrackSubmissions} className="btn-primary rounded-xl px-4 py-2 text-sm">{trackSubsLoading ? "..." : "🔄"}</button>
                </div>
                {trackSubsLoading ? <div className="text-center p-12">⏳</div> : !trackSubs.length ? <div className="text-center p-12 text-white/50">אין טרקים</div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trackSubs.map(t => (
                      <div key={t.id} className={`glass rounded-2xl p-4 ${t.is_approved ? 'border-2 border-green-500/50' : ''}`}>
                        <p className="text-sm text-cyan-400">{new Date(t.created_at).toLocaleDateString('he-IL')}</p>
                        <h3 className="text-lg font-bold">{t.track_title}</h3>
                        <p className="text-sm text-white/70">מגיש: {t.name}</p>
                        <p className="text-xs text-white/50 line-clamp-2 mb-4">{t.description}</p>
                        <div className="space-y-2">
                          {t.is_approved ? <div className="bg-green-600/50 py-2 rounded-xl text-center">✅ פעיל</div> : <button onClick={() => approveTrack(t.id)} className="w-full btn-primary py-2 rounded-xl">⭐ אשר</button>}
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedTrackSub(t)} className="btn-secondary px-3 py-2 rounded-xl flex-1">👁️</button>
                            <button onClick={() => deleteTrack(t.id)} className="bg-red-500/20 px-3 py-2 rounded-xl">🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedTrackSub && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6" onClick={() => setSelectedTrackSub(null)}>
                    <div className="glass rounded-xl max-w-3xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-between"><h3 className="text-xl font-bold">{selectedTrackSub.track_title}</h3><button onClick={() => setSelectedTrackSub(null)} className="text-2xl">✕</button></div>
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedTrackSub.youtube_url)}`} allowFullScreen />
                      </div>
                      <p><b>מגיש:</b> {selectedTrackSub.name}</p>
                      <p className="bg-black/30 p-4 rounded-lg">{selectedTrackSub.description}</p>
                      <div className="flex gap-3">
                        {!selectedTrackSub.is_approved && <button onClick={() => approveTrack(selectedTrackSub.id)} className="btn-primary px-6 py-3 rounded-xl flex-1">⭐ אשר</button>}
                        <a href={selectedTrackSub.youtube_url} target="_blank" className="btn-secondary px-6 py-3 rounded-xl flex-1 text-center">יוטיוב</a>
                      </div>
                      <button onClick={() => deleteTrack(selectedTrackSub.id)} className="w-full bg-red-500/20 py-3 rounded-xl">🗑️ מחק</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "artists" && (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4 flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">ניהול אמנים</h2>
                  <div className="flex gap-2">
                    <button onClick={fetchArtists} className="btn-secondary rounded-xl px-4 py-2 text-sm">{artistsLoading ? "..." : "🔄"}</button>
                    <button onClick={() => { setCurrentArtist({ id: 0, slug: "", name: "", stage_name: "", short_bio: "", profile_photo_url: "", started_year: null, spotify_artist_id: "", spotify_url: "", youtube_url: "", soundcloud_profile_url: "", instagram_url: "", tiktok_url: "", website_url: "", primary_color: "#00e0ff", festival_sets: [], instagram_reels: [], artist_episodes: [], booking_agency_name: "", booking_agency_email: "", booking_agency_url: "", record_label_name: "", record_label_url: "", management_email: "" }); setPrimaryEpisodeId(""); }} className="btn-primary rounded-xl px-4 py-2 text-sm">➕ חדש</button>
                  </div>
                </div>
                {artistsLoading ? <div className="text-center p-12">⏳</div> : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="glass rounded-2xl p-4 space-y-2 max-h-[70vh] overflow-y-auto">
                      {adminArtists.map(a => (
                        <button key={a.id} onClick={() => { setCurrentArtist(a); setPrimaryEpisodeId(a.artist_episodes?.find(e => e.is_primary)?.episode_id?.toString() || ""); }}
                          className={`w-full text-right p-3 rounded-xl border text-sm ${currentArtist?.id === a.id ? "border-cyan-400 bg-cyan-500/10" : "border-white/10"}`}>
                          <div className="font-semibold text-cyan-300">{a.stage_name || a.name}</div>
                          <div className="text-xs text-white/50">/{a.slug}</div>
                        </button>
                      ))}
                    </div>
                    <div className="glass rounded-2xl p-4 lg:col-span-2">
                      {!currentArtist ? <div className="text-white/50">בחר אמן</div> : (
                        <div className="space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-2">
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-cyan-400 mb-3">פרטים בסיסיים</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div><label className="text-white/60 text-xs">Slug (לכתובת URL)</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.slug || ""} onChange={e => setCurrentArtist({ ...currentArtist, slug: e.target.value })} placeholder="artist-name" /></div>
                              <div><label className="text-white/60 text-xs">שם מלא</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.name || ""} onChange={e => setCurrentArtist({ ...currentArtist, name: e.target.value })} placeholder="שם מלא" /></div>
                              <div><label className="text-white/60 text-xs">שם אמן (Stage Name)</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.stage_name || ""} onChange={e => setCurrentArtist({ ...currentArtist, stage_name: e.target.value })} placeholder="שם במה" /></div>
                              <div><label className="text-white/60 text-xs">שנת התחלה</label><input type="number" className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.started_year || ""} onChange={e => setCurrentArtist({ ...currentArtist, started_year: e.target.value ? Number(e.target.value) : null })} placeholder="2015" /></div>
                              <div><label className="text-white/60 text-xs">פרק ראשי (Episode ID)</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={primaryEpisodeId} onChange={e => setPrimaryEpisodeId(e.target.value)} placeholder="49" /></div>
                              <div><label className="text-white/60 text-xs">צבע ראשי</label><div className="flex gap-2"><input type="color" className="w-12 h-10 rounded-lg bg-black/40 border border-white/15 cursor-pointer" value={currentArtist.primary_color || "#00e0ff"} onChange={e => setCurrentArtist({ ...currentArtist, primary_color: e.target.value })} /><input className="flex-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.primary_color || ""} onChange={e => setCurrentArtist({ ...currentArtist, primary_color: e.target.value })} placeholder="#00e0ff" /></div></div>
                            </div>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-purple-400 mb-3">מדיה</h4>
                            <div className="space-y-3">
                              <div><label className="text-white/60 text-xs">תמונת פרופיל (URL)</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.profile_photo_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, profile_photo_url: e.target.value })} placeholder="https://..." /></div>
                              <div><label className="text-white/60 text-xs">ביוגרפיה קצרה</label><textarea className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2 min-h-[100px]" value={currentArtist.short_bio || ""} onChange={e => setCurrentArtist({ ...currentArtist, short_bio: e.target.value })} placeholder="תיאור קצר על האמן..." /></div>
                            </div>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-pink-400 mb-3">רשתות חברתיות</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-white/60 text-xs">🎵 Spotify URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.spotify_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, spotify_url: e.target.value })} placeholder="https://open.spotify.com/artist/..." /></div>
                              <div><label className="text-white/60 text-xs">🎵 Spotify Artist ID</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.spotify_artist_id || ""} onChange={e => setCurrentArtist({ ...currentArtist, spotify_artist_id: e.target.value })} placeholder="4Z8W4fKeB5YxbusRsdQVPb" /></div>
                              <div><label className="text-white/60 text-xs">📺 YouTube URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.youtube_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, youtube_url: e.target.value })} placeholder="https://youtube.com/@..." /></div>
                              <div><label className="text-white/60 text-xs">☁️ SoundCloud URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.soundcloud_profile_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, soundcloud_profile_url: e.target.value })} placeholder="https://soundcloud.com/..." /></div>
                              <div><label className="text-white/60 text-xs">📸 Instagram URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.instagram_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, instagram_url: e.target.value })} placeholder="https://instagram.com/..." /></div>
                              <div><label className="text-white/60 text-xs">🎵 TikTok URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.tiktok_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, tiktok_url: e.target.value })} placeholder="https://tiktok.com/@..." /></div>
                              <div className="col-span-2"><label className="text-white/60 text-xs">🌐 Website URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.website_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, website_url: e.target.value })} placeholder="https://..." /></div>
                            </div>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-3">פרטי עסקים</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-white/60 text-xs">🏢 סוכנות הזמנות - שם</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.booking_agency_name || ""} onChange={e => setCurrentArtist({ ...currentArtist, booking_agency_name: e.target.value })} placeholder="Agency Name" /></div>
                              <div><label className="text-white/60 text-xs">📧 סוכנות הזמנות - אימייל</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.booking_agency_email || ""} onChange={e => setCurrentArtist({ ...currentArtist, booking_agency_email: e.target.value })} placeholder="booking@agency.com" /></div>
                              <div className="col-span-2"><label className="text-white/60 text-xs">🔗 סוכנות הזמנות - URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.booking_agency_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, booking_agency_url: e.target.value })} placeholder="https://..." /></div>
                              <div><label className="text-white/60 text-xs">💿 לייבל - שם</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.record_label_name || ""} onChange={e => setCurrentArtist({ ...currentArtist, record_label_name: e.target.value })} placeholder="Label Name" /></div>
                              <div><label className="text-white/60 text-xs">🔗 לייבל - URL</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.record_label_url || ""} onChange={e => setCurrentArtist({ ...currentArtist, record_label_url: e.target.value })} placeholder="https://..." /></div>
                              <div className="col-span-2"><label className="text-white/60 text-xs">📧 ניהול - אימייל</label><input className="w-full rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={currentArtist.management_email || ""} onChange={e => setCurrentArtist({ ...currentArtist, management_email: e.target.value })} placeholder="management@email.com" /></div>
                            </div>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-green-400 mb-3">🎪 סטים מפסטיבלים</h4>
                            <div className="space-y-2">
                              {(currentArtist.festival_sets || []).map((set, idx) => (
                                <div key={idx} className="flex gap-2 items-center bg-white/5 p-2 rounded-lg">
                                  <input className="flex-1 rounded bg-black/40 border border-white/15 px-2 py-1 text-xs" value={set.youtube_id || ""} onChange={e => { const newSets = [...(currentArtist.festival_sets || [])]; newSets[idx] = { ...newSets[idx], youtube_id: e.target.value }; setCurrentArtist({ ...currentArtist, festival_sets: newSets }); }} placeholder="YouTube ID" />
                                  <input className="w-32 rounded bg-black/40 border border-white/15 px-2 py-1 text-xs" value={set.festival || ""} onChange={e => { const newSets = [...(currentArtist.festival_sets || [])]; newSets[idx] = { ...newSets[idx], festival: e.target.value }; setCurrentArtist({ ...currentArtist, festival_sets: newSets }); }} placeholder="Festival" />
                                  <input type="number" className="w-20 rounded bg-black/40 border border-white/15 px-2 py-1 text-xs" value={set.year || ""} onChange={e => { const newSets = [...(currentArtist.festival_sets || [])]; newSets[idx] = { ...newSets[idx], year: e.target.value ? Number(e.target.value) : null }; setCurrentArtist({ ...currentArtist, festival_sets: newSets }); }} placeholder="Year" />
                                  <button onClick={() => { const newSets = (currentArtist.festival_sets || []).filter((_, i) => i !== idx); setCurrentArtist({ ...currentArtist, festival_sets: newSets }); }} className="text-red-400 hover:text-red-300 px-2">✕</button>
                                </div>
                              ))}
                              <button onClick={() => setCurrentArtist({ ...currentArtist, festival_sets: [...(currentArtist.festival_sets || []), { youtube_id: "", festival: "", year: null, location: "" }] })} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition">+ הוסף סט</button>
                            </div>
                          </div>
                          <div className="border-b border-white/10 pb-4">
                            <h4 className="text-lg font-semibold text-orange-400 mb-3">📱 Instagram Reels</h4>
                            <div className="space-y-2">
                              {(currentArtist.instagram_reels || []).map((reel, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <input className="flex-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2" value={reel} onChange={e => { const newReels = [...(currentArtist.instagram_reels || [])]; newReels[idx] = e.target.value; setCurrentArtist({ ...currentArtist, instagram_reels: newReels }); }} placeholder="https://instagram.com/reel/..." />
                                  <button onClick={() => { const newReels = (currentArtist.instagram_reels || []).filter((_, i) => i !== idx); setCurrentArtist({ ...currentArtist, instagram_reels: newReels }); }} className="text-red-400 hover:text-red-300 px-2">✕</button>
                                </div>
                              ))}
                              <button onClick={() => setCurrentArtist({ ...currentArtist, instagram_reels: [...(currentArtist.instagram_reels || []), ""] })} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-white/50 hover:text-white hover:border-white/40 transition">+ הוסף ריל</button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-4 sticky bottom-0 bg-black/80 backdrop-blur py-3 -mx-2 px-2">
                            {currentArtist.id > 0 && (<div className="text-xs text-white/40">ID: {currentArtist.id}</div>)}
                            <button onClick={saveArtist} className="btn-primary rounded-xl px-8 py-3 font-semibold text-base" disabled={savingArtist}>{savingArtist ? "שומר..." : "💾 שמור אמן"}</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {showVotesArchive && tally && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={() => setShowVotesArchive(false)}>
                <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
                  <div className="sticky top-0 bg-black/90 backdrop-blur p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-amber-400">📊 ארכיון הצבעות 2025</h2>
                      <p className="text-white/60 text-sm mt-1">סה״כ {totalVotes.toLocaleString()} הצבעות</p>
                    </div>
                    <button onClick={() => setShowVotesArchive(false)} className="text-3xl hover:text-white/80 transition">✕</button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] space-y-6">
                    {Object.entries(tally).map(([catId, nominees]) => {
                      const total = Object.values(nominees).reduce((s, c) => s + c, 0);
                      return (
                        <div key={catId} className="glass rounded-2xl p-4">
                          <h3 className="text-lg font-bold text-cyan-400 border-b border-white/10 pb-2 mb-3">{getCategoryTitle(catId)}</h3>
                          <div className="space-y-2">
                            {Object.entries(nominees).sort(([,a], [,b]) => b - a).slice(0, 5).map(([nId, count], i) => (
                              <div key={nId} className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? 'bg-yellow-500/10' : ''}`}>
                                <span className="w-8 text-center">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                                <div className="flex-1">
                                  <div className={`font-medium ${i === 0 ? 'text-yellow-300' : ''}`}>{getNomineeName(catId, nId)}</div>
                                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
                                    <div className={`h-full rounded-full ${i === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'}`} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                                  </div>
                                </div>
                                <div className="text-left w-16">
                                  <div className={`font-bold ${i === 0 ? 'text-yellow-300' : 'text-cyan-400'}`}>{count}</div>
                                  <div className="text-xs text-white/50">{total > 0 ? ((count / total) * 100).toFixed(1) : 0}%</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
