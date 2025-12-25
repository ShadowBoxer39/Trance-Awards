// pages/admin.tsx - UPDATED VERSION
// Changes:
// 1. Votes tab moved to archive modal (button in header)
// 2. Removed total votes from header
// 3. Improved artist signups cards with duplicate detection

import React from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

// ============ TYPES ============
interface Analytics {
  totalVisits: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: string;
  israelVisits: number;
  israelPercentage: string;
  topPages: { page: string; count: number; percentage: string }[];
  topLandingPages: { page: string; count: number; percentage: string }[];
  topSources: { source: string; count: number; percentage: string }[];
  peakHours: { hour: string; count: number }[];
  trendData: { date: string; visits: number }[];
  deviceData: { name: string; value: number; color: string }[];
  topArtists: { slug: string; visits: number }[];
  comparison: {
    prevTotalVisits: number;
    prevUniqueVisitors: number;
    prevAvgDuration: number;
    visitsChange: number;
    uniqueChange: number;
    durationChange: number;
  };
}

type Tally = Record<string, Record<string, number>>;
type DateRange = "today" | "7d" | "30d" | "all";
type TabType = "signups" | "analytics" | "track-submissions" | "artists";

// ============ HELPERS ============
const formatDuration = (seconds: number | null): string => {
  if (!seconds || seconds < 0) return "00:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
};

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

// ============ COMPONENTS ============
const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  change,
  showComparison 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: string;
  change?: number;
  showComparison?: boolean;
}) => (
  <div className={`glass rounded-2xl p-5 border-r-4 ${color}`}>
    <div className="flex justify-between mb-2">
      <span className="text-white/60 text-sm">{title}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className={`text-3xl font-bold ${color.replace('border-', 'text-')}`}>{value}</div>
    {showComparison && change !== undefined && (
      <div className={`text-xs mt-1 font-medium ${change === 0 ? 'text-gray-400' : change > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {change === 0 ? '=' : change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </div>
    )}
  </div>
);

const ProgressBar = ({ percentage, gradient }: { percentage: string; gradient: string }) => (
  <div className="w-full bg-gray-800 rounded-full h-2">
    <div className={`h-full rounded-full ${gradient}`} style={{ width: `${percentage}%` }} />
  </div>
);

// ============ MAIN COMPONENT ============
export default function Admin() {
  // Auth State
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Data State
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const [signups, setSignups] = React.useState<any[]>([]);
  const [trackSubs, setTrackSubs] = React.useState<any[]>([]);
  const [adminArtists, setAdminArtists] = React.useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = React.useState<TabType>("signups");
  const [dateRange, setDateRange] = React.useState<DateRange>("today");
  const [showComparison, setShowComparison] = React.useState(false);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  const [showVotesArchive, setShowVotesArchive] = React.useState(false);

  // Modal State
  const [selectedSignup, setSelectedSignup] = React.useState<any | null>(null);

  // ============ DUPLICATE DETECTION ============
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

  // ============ EFFECTS ============
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading && !error) fetchStats();
  }, [key]);

  React.useEffect(() => {
    if (tally && activeTab === "analytics") fetchAnalytics();
  }, [tally, activeTab, dateRange]);

  React.useEffect(() => {
    if (tally) {
      if (activeTab === "signups") fetchSignups();
      else if (activeTab === "track-submissions") fetchTrackSubmissions();
      else if (activeTab === "artists") fetchArtists();
    }
  }, [tally, activeTab]);

  // ============ API CALLS ============
  const fetchStats = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "שגיאה");
      setTally(j.tally);
      setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics-aggregated?key=${encodeURIComponent(key)}&range=${dateRange}&_t=${Date.now()}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error);
      setAnalytics(j.analytics);
    } catch (e: any) {
      console.error("Analytics error:", e);
      try {
        const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
        const j = await r.json();
        if (j?.ok) console.log("Using fallback API");
      } catch {
        alert("שגיאה בטעינת סטטיסטיקות");
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSignups = async () => {
    if (!key) return;
    try {
      const r = await fetch(`/api/artist-signups?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (j?.ok) setSignups(j.signups || []);
    } catch { }
  };

  const fetchTrackSubmissions = async () => {
    if (!key) return;
    try {
      const r = await fetch(`/api/track-submissions?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (j?.ok) setTrackSubs(j.submissions || []);
    } catch { }
  };

  const fetchArtists = async () => {
    if (!key) return;
    try {
      const r = await fetch(`/api/admin-artists?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      if (j?.ok) setAdminArtists(j.artists || []);
    } catch { }
  };

  const exportSignupsCSV = () => {
    if (signups.length === 0) return;
    const headers = ['שם במה', 'שם מלא', 'גיל', 'טלפון', 'ניסיון', 'השראות', 'לינק לטראק', 'תאריך'];
    const rows = signups.map(s => [
      s.stage_name || '',
      s.full_name || '',
      s.age || '',
      s.phone || '',
      s.experience_years || '',
      s.inspirations || '',
      s.track_link || '',
      s.created_at ? formatDate(s.created_at) : ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artist-signups-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ============ HELPERS ============
  const getCategoryTitle = (catId: string) => CATEGORIES.find(c => c.id === catId)?.title || catId;
  const getNomineeName = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat?.nominees.find(n => n.id === nomineeId)?.name || nomineeId;
  };

  // ============ RENDER ============
  
  // Login Screen
  if (!tally && !loading) {
    return (
      <main className="min-h-screen neon-backdrop text-white">
        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-center pt-20">
            <h1 className="text-4xl font-bold gradient-title">Admin Dashboard</h1>
          </div>
          <form onSubmit={fetchStats} className="glass p-6 rounded-2xl max-w-md mx-auto space-y-4">
            <input 
              className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3" 
              type="password" 
              value={key} 
              onChange={e => setKey(e.target.value)} 
              placeholder="Admin Key" 
            />
            <button 
              className="w-full btn-primary rounded-2xl px-4 py-3 font-semibold disabled:opacity-50" 
              disabled={!key || loading}
            >
              {loading ? "טוען…" : "התחבר"}
            </button>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        </div>
      </main>
    );
  }

  // Loading State
  if (!tally && loading) {
    return (
      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center">
        <div className="text-6xl animate-pulse">⏳</div>
      </main>
    );
  }

  // Main Dashboard
  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-title">Admin Dashboard</h1>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/featured-artist" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition hover:scale-105">
            ⭐ ניהול אמן מומלץ
          </Link>
          <Link href="/admin/duels" className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold border-purple-500/50 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2 transition hover:scale-105">
            ⚔️ ניהול דואל יומי
          </Link>
          <button 
            onClick={() => setShowVotesArchive(true)}
            className="btn-secondary px-6 py-3 rounded-xl text-sm font-bold border-amber-500/50 text-amber-300 hover:bg-amber-500/20 flex items-center gap-2 transition hover:scale-105"
          >
            📊 ארכיון הצבעות 2025 ({totalVotes.toLocaleString()})
          </button>
        </div>

        {/* Tabs - Without Votes */}
        <div className="glass rounded-2xl p-1 flex gap-2 overflow-x-auto">
          {[
            { id: "signups", label: `🌟 הרשמות (${signups.length})` },
            { id: "analytics", label: `📊 סטטיסטיקות` },
            { id: "track-submissions", label: `💬 טרקים (${trackSubs.length})` },
            { id: "artists", label: `🎧 אמנים (${adminArtists.length})` },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ SIGNUPS TAB - IMPROVED ============ */}
        {activeTab === "signups" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
              <h2 className="text-2xl font-semibold">הרשמות אמנים</h2>
              <div className="flex gap-2">
                <button onClick={exportSignupsCSV} className="btn-secondary rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                  📥 CSV
                </button>
                <button onClick={fetchSignups} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl">🔄</button>
              </div>
            </div>
            
            {signups.length === 0 ? (
              <div className="text-center p-12 text-white/50">אין הרשמות</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {signups.map(s => {
                  const hasDuplicate = isDuplicate(s.phone);
                  return (
                    <div 
                      key={s.id} 
                      className={`glass rounded-2xl p-5 transition-all hover:scale-[1.02] ${
                        hasDuplicate ? 'border-2 border-orange-500/50 bg-orange-500/5' : 'border border-white/10'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-cyan-400">{s.stage_name}</h3>
                          <p className="text-sm text-white/60">{s.full_name}</p>
                        </div>
                        {hasDuplicate && (
                          <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            ⚠️ כפול
                          </span>
                        )}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10 my-3" />

                      {/* Info Grid */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📞</span>
                          <span className="text-white/80 font-mono">{s.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎂</span>
                          <span className="text-white/60">גיל:</span>
                          <span className="text-white/80">{s.age}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎵</span>
                          <span className="text-white/60">ניסיון:</span>
                          <span className="text-white/80">{s.experience_years}</span>
                        </div>
                        {s.inspirations && (
                          <div className="flex items-start gap-2">
                            <span className="text-lg">💭</span>
                            <span className="text-white/60 line-clamp-2">{s.inspirations}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          <span className="text-white/60">נשלח:</span>
                          <span className="text-white/80">{s.created_at ? formatDate(s.created_at) : 'לא ידוע'}</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-white/10 my-3" />

                      {/* Actions */}
                      <div className="flex gap-2">
                        <a 
                          href={s.track_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm text-center transition flex items-center justify-center gap-2"
                        >
                          🎧 האזן לטראק
                        </a>
                        <button 
                          onClick={() => setSelectedSignup(s)}
                          className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition"
                          title="פרטים נוספים"
                        >
                          👁️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          analyticsLoading ? (
            <div className="p-12 text-center"><div className="text-4xl animate-spin">⏳</div></div>
          ) : !analytics ? (
            <div className="p-12 text-center text-white/50">📊 אין נתונים</div>
          ) : (
            <div className="space-y-6">
              {/* Controls */}
              <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-2xl font-semibold">סטטיסטיקות אתר</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  {(["today", "7d", "30d", "all"] as const).map(range => (
                    <button 
                      key={range} 
                      onClick={() => setDateRange(range)}
                      className={`px-4 py-2 rounded-xl font-medium transition ${
                        dateRange === range 
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500" 
                          : "bg-white/5 text-white/60 hover:text-white"
                      }`}
                    >
                      {range === "today" ? "היום" : range === "7d" ? "7 ימים" : range === "30d" ? "30 ימים" : "הכל"}
                    </button>
                  ))}
                  <div className="h-6 w-px bg-white/20 mx-2" />
                  <button 
                    onClick={() => setShowComparison(!showComparison)}
                    className={`px-4 py-2 rounded-xl font-medium transition ${
                      showComparison ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-white/5 text-white/60"
                    }`}
                  >
                    📊 השוואה
                  </button>
                  <button onClick={fetchAnalytics} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl">🔄</button>
                </div>
              </div>

              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard 
                  title="סה״כ ביקורים" 
                  value={analytics.totalVisits.toLocaleString()} 
                  icon="👥" 
                  color="border-cyan-500"
                  change={analytics.comparison.visitsChange}
                  showComparison={showComparison}
                />
                <StatCard 
                  title="מבקרים ייחודיים" 
                  value={analytics.uniqueVisitors.toLocaleString()} 
                  icon="🧑‍💻" 
                  color="border-emerald-500"
                  change={analytics.comparison.uniqueChange}
                  showComparison={showComparison}
                />
                <StatCard 
                  title="זמן שהייה" 
                  value={formatDuration(analytics.avgDuration)} 
                  icon="⏱️" 
                  color="border-purple-500"
                  change={analytics.comparison.durationChange}
                  showComparison={showComparison}
                />
                <StatCard 
                  title="מישראל" 
                  value={`${analytics.israelPercentage}%`} 
                  icon="🇮🇱" 
                  color="border-green-500"
                />
                <StatCard 
                  title="נטישה" 
                  value={`${analytics.bounceRate}%`} 
                  icon="📉" 
                  color="border-orange-500"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Devices */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📱 מכשירים</h3>
                  <div className="flex items-center justify-around">
                    <div className="w-32 h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={analytics.deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value">
                            {analytics.deviceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {analytics.deviceData.map((d, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-sm">{d.name}: {d.value} ({analytics.totalVisits > 0 ? ((d.value / analytics.totalVisits) * 100).toFixed(0) : 0}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Peak Hours */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🕐 שעות שיא</h3>
                  <div className="grid grid-cols-5 gap-3">
                    {analytics.peakHours.map((h, i) => (
                      <div key={i} className="bg-white/5 rounded-xl p-3 text-center">
                        <div className="text-2xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "📊"}</div>
                        <div className="text-lg font-bold text-cyan-400">{h.hour}</div>
                        <div className="text-xs text-white/60">{h.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trend Chart */}
              {dateRange !== "today" && analytics.trendData.length > 1 && (
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

              {/* Lists Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Landing Pages */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🚪 דפי נחיתה</h3>
                  <div className="space-y-3">
                    {analytics.topLandingPages.map((p, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{i + 1}</span>
                            <span className="font-medium truncate max-w-[250px]">{p.page}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-cyan-400">{p.count}</div>
                            <div className="text-xs text-white/50">{p.percentage}%</div>
                          </div>
                        </div>
                        <ProgressBar percentage={p.percentage} gradient="bg-gradient-to-r from-cyan-500 to-purple-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Pages */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">📄 דפים פופולריים</h3>
                  <div className="space-y-3">
                    {analytics.topPages.map((p, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                            <span className="font-medium truncate max-w-[250px]">{p.page}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-purple-400">{p.count}</div>
                            <div className="text-xs text-white/50">{p.percentage}%</div>
                          </div>
                        </div>
                        <ProgressBar percentage={p.percentage} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Traffic Sources */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔗 מקורות תנועה</h3>
                  <div className="space-y-3">
                    {analytics.topSources.map((s, i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-pink-500/20 text-pink-400'}`}>{i + 1}</span>
                            <span className="font-medium truncate max-w-[200px]">{s.source}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-pink-400">{s.count}</div>
                            <div className="text-xs text-white/50">{s.percentage}%</div>
                          </div>
                        </div>
                        <ProgressBar percentage={s.percentage} gradient="bg-gradient-to-r from-pink-500 to-orange-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Artists */}
                {analytics.topArtists?.length > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-3">🔥 אמנים חמים</h3>
                    <div className="space-y-3">
                      {analytics.topArtists.slice(0, 5).map((a, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/30 text-yellow-400' : 'bg-orange-500/20 text-orange-400'}`}>{i + 1}</span>
                              <span className="font-medium text-cyan-300">{a.slug}</span>
                            </div>
                            <div className="font-bold text-orange-400">{a.visits} ביקורים</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Track Submissions Tab */}
        {activeTab === "track-submissions" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">טרקים להמלצה ({trackSubs.length})</h2>
              <button onClick={fetchTrackSubmissions} className="btn-secondary rounded-xl px-4 py-2 text-sm">🔄</button>
            </div>
            {trackSubs.length === 0 ? (
              <div className="text-center p-12 text-white/50">אין טרקים</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trackSubs.map(t => (
                  <div key={t.id} className={`glass rounded-2xl p-4 ${t.is_approved ? 'border-2 border-green-500/50' : ''}`}>
                    <p className="text-sm text-cyan-400">{new Date(t.created_at).toLocaleDateString('he-IL')}</p>
                    <h3 className="text-lg font-bold">{t.track_title}</h3>
                    <p className="text-sm text-white/70">מגיש: {t.name}</p>
                    {t.is_approved && <div className="mt-2 bg-green-600/50 py-1 px-2 rounded text-xs inline-block">✅ פעיל</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Artists Tab */}
        {activeTab === "artists" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">אמנים ({adminArtists.length})</h2>
              <button onClick={fetchArtists} className="btn-secondary rounded-xl px-4 py-2 text-sm">🔄</button>
            </div>
            {adminArtists.length === 0 ? (
              <div className="text-center p-12 text-white/50">אין אמנים</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminArtists.map(a => (
                  <div key={a.id} className="glass rounded-2xl p-4">
                    <h3 className="text-lg font-bold text-cyan-400">{a.stage_name || a.name}</h3>
                    <p className="text-sm text-white/50">/{a.slug}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ MODALS ============ */}
        
        {/* Signup Details Modal */}
        {selectedSignup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6" onClick={() => setSelectedSignup(null)}>
            <div className="glass rounded-xl max-w-2xl w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between">
                <h3 className="text-xl font-bold text-cyan-400">{selectedSignup.stage_name}</h3>
                <button onClick={() => setSelectedSignup(null)} className="text-2xl">✕</button>
              </div>
              <p><b>שם מלא:</b> {selectedSignup.full_name}</p>
              <p><b>גיל:</b> {selectedSignup.age} | <b>טלפון:</b> {selectedSignup.phone}</p>
              <p><b>ניסיון:</b> {selectedSignup.experience_years}</p>
              <p><b>השראות:</b> {selectedSignup.inspirations}</p>
              <a href={selectedSignup.track_link} target="_blank" className="text-cyan-400 hover:underline block">🎵 {selectedSignup.track_link}</a>
            </div>
          </div>
        )}

        {/* Votes Archive Modal */}
        {showVotesArchive && tally && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={() => setShowVotesArchive(false)}>
            <div className="glass rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-black/90 backdrop-blur p-6 border-b border-white/10 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">📊 ארכיון הצבעות 2025</h2>
                  <p className="text-white/60 text-sm mt-1">סה״כ {totalVotes.toLocaleString()} הצבעות</p>
                </div>
                <button onClick={() => setShowVotesArchive(false)} className="text-3xl hover:text-white/80 transition">✕</button>
              </div>
              
              {/* Modal Content */}
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
      </div>
    </main>
  );
}
