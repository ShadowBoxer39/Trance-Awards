// pages/admin.tsx - MERGED VERSION: VOTES + YOUNG ARTISTS + ANALYTICS (FIXED ANALYTICS)
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

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

// Data structure now matches the Supabase 'site_visits' table
interface ServerVisitData {
  id: string;
  timestamp: string;
  page: string;
  referrer: string | null;
  userAgent: string | null;
  entry_time: number | null;
  exit_time: number | null;
  duration: number | null; // In seconds
  client_ip: string | null;
  is_israel: boolean | null;
}

// Helper to format duration from seconds to HH:MM:SS
function formatDuration(seconds: number | null): string {
  if (!seconds || seconds < 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  return [h, m, s]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}


export default function Admin() {
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  
  // Young Artists State
  const [signups, setSignups] = React.useState<Signup[]>([]);
  const [signupsLoading, setSignupsLoading] = React.useState(false);
  const [selectedSignup, setSelectedSignup] = React.useState<Signup | null>(null);
  
  // Analytics State - Now holds data from the server
  const [visits, setVisits] = React.useState<ServerVisitData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = React.useState<"votes" | "signups" | "analytics">("votes");

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading && !error) {
      fetchStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (tally) {
      if (activeTab === "signups") {
        fetchSignups();
      } else if (activeTab === "analytics") {
        fetchAnalytics(); // <-- Fetch analytics when tab is active
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tally, activeTab]);

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      // Fetch data from the new secure API endpoint
      const r = await fetch(`/api/analytics-data?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "Failed to fetch analytics data.");
      }
      
      setVisits(j.visits as ServerVisitData[]);
      
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      alert("Error fetching analytics. Check console.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSignups = async () => {
    if (!key) return;
    setSignupsLoading(true);
    try {
      const r = await fetch(`/api/artist-signups?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "Failed to fetch signups.");
      }
      
      setSignups(j.signups as Signup[]);
      
    } catch (err: any) {
      console.error("Error fetching signups:", err);
      alert("Error fetching signups. Check console.");
    } finally {
      setSignupsLoading(false);
    }
  };

  const getAnalytics = () => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    // Filter by timestamp (which is a string, so we convert)
    const activeVisits = visits.filter(v => v.entry_time); // Filter for recorded entry times
    const today = activeVisits.filter(v => now - new Date(v.timestamp).getTime() < oneDay);
    const week = activeVisits.filter(v => now - new Date(v.timestamp).getTime() < oneWeek);
    const month = activeVisits.filter(v => now - new Date(v.timestamp).getTime() < oneMonth);

    // Filter for completed sessions to calculate average duration
    const visitsWithDuration = activeVisits.filter(v => v.duration);
    const totalDuration = visitsWithDuration.reduce((acc, v) => acc + (v.duration || 0), 0);
    const avgDurationSeconds = visitsWithDuration.length > 0
      ? totalDuration / visitsWithDuration.length
      : 0;

    // Page Views
    const pageViews = activeVisits.reduce((acc, v) => {
      acc[v.page] = (acc[v.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Referrers (Cleaned)
    const referrers = activeVisits.reduce((acc, v) => {
      let domain = 'direct';
      if (v.referrer) {
        try {
          domain = new URL(v.referrer).hostname.replace(/^www\./, '') || 'direct';
        } catch {
          // Keep as 'direct' or use raw referrer if URL parsing fails
          domain = v.referrer.split('/')[0] || 'direct';
        }
      }
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activeVisits.length,
      today: today.length,
      week: week.length,
      month: month.length,
      avgDuration: Math.round(avgDurationSeconds) || 0,
      pageViews: Object.entries(pageViews).sort((a, b) => b[1] - a[1]),
      referrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]),
    };
  };
  
  // NOTE: Deletion logic remains client-side only (not a priority security fix now)
  const deleteSignup = (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את ההרשמה?")) {
      alert("Note: Actual database deletion needs a secure, authorized endpoint. This is only removing it from the view for now.");
      setSignups(signups.filter(s => s.id !== id));
      setSelectedSignup(null);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const downloadCSV = () => {
    if (signups.length === 0) {
      alert("אין הרשמות להורדה");
      return;
    }

    const headers = ["תאריך", "שם מלא", "שם במה", "גיל", "טלפון", "ניסיון", "השראות", "לינק לטראק"];
    const rows = signups.map(s => [
      formatDate(s.submitted_at),
      s.full_name,
      s.stage_name,
      s.age || "לא צוין",
      s.phone || "לא צוין",
      s.experience_years,
      s.inspirations.replace(/"/g, '""'),
      s.track_link
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `young-artists-signups-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function fetchStats(e?: React.FormEvent) {
    e?.preventDefault();
    if (!key) return;
    
    setLoading(true);
    setError(null);
    setInfo(null);
    setTally(null);
    
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "request_failed");
      }
      
      setTally(j.tally as Tally);
      setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
      
    } catch (err: any) {
      setError(err?.message || "error");
    } finally {
      setLoading(false);
    }
  }

  async function callClear(mode: "all" | "me") {
    // ... (clear logic omitted for brevity)
  }

  const getCategoryTitle = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat?.title || catId;
  };

  const getNomineeName = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    const nominee = cat?.nominees.find((n) => n.id === nomineeId);
    return nominee?.name || nomineeId;
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
        
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-title">
            Admin Dashboard
          </h1>
          {totalVotes > 0 && (
            <div className="glass rounded-2xl px-6 py-3">
              <div className="text-sm text-white/60">סה״כ הצבעות</div>
              <div className="text-3xl font-bold text-cyan-400">
                {totalVotes}
              </div>
            </div>
          )}
        </div>

        {/* Login Form */}
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
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
          </form>
        )}

        {/* Dashboard Content */}
        {tally && (
          <>
            {/* Tabs */}
            <div className="glass rounded-2xl p-1 flex gap-2">
              <button
                onClick={() => setActiveTab("votes")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition ${
                  activeTab === "votes"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                🗳️ תוצאות הצבעה ({totalVotes})
              </button>
              <button
                onClick={() => setActiveTab("signups")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition ${
                  activeTab === "signups"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                🌟 הרשמות אמנים ({signups.length})
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition ${
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
                {/* ... (Votes UI omitted for brevity) ... */}
              </>
            )}

            {/* SIGNUPS TAB */}
            {activeTab === "signups" && (
              <>
                {/* ... (Signups UI omitted for brevity) ... */}
              </>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (() => {
              const stats = getAnalytics();
              
              return (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-4 glass rounded-2xl p-4">
                    <h2 className="text-xl font-semibold">סקירת תנועה</h2>
                    <button
                      onClick={fetchAnalytics}
                      className="btn-primary rounded-xl px-4 py-2 text-sm"
                      disabled={analyticsLoading}
                    >
                      {analyticsLoading ? "טוען..." : "🔄 רענן נתונים"}
                    </button>
                  </div>

                  {analyticsLoading && (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4 animate-spin">⏳</div>
                      <p>טוען נתונים גלובליים...</p>
                    </div>
                  )}
                  
                  {!analyticsLoading && (
                    <>
                      {/* Overview Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass rounded-xl p-6">
                          <div className="text-3xl font-semibold text-gradient mb-2">{stats.total}</div>
                          <div className="text-white/60 text-sm">סה״כ ביקורים</div>
                        </div>
                        <div className="glass rounded-xl p-6">
                          <div className="text-3xl font-semibold text-gradient mb-2">{stats.today}</div>
                          <div className="text-white/60 text-sm">היום</div>
                        </div>
                        <div className="glass rounded-xl p-6">
                          <div className="text-3xl font-semibold text-gradient mb-2">{stats.week}</div>
                          <div className="text-white/60 text-sm">שבוע אחרון</div>
                        </div>
                        <div className="glass rounded-xl p-6">
                          <div className="text-3xl font-semibold text-gradient mb-2">{stats.month}</div>
                          <div className="text-white/60 text-sm">חודש אחרון</div>
                        </div>
                      </div>

                      {/* Average Duration - FIXED FORMATTING */}
                      <div className="glass rounded-xl p-6">
                        <h3 className="text-xl font-semibold mb-2">זמן שהייה ממוצע</h3>
                        <div className="text-4xl font-bold text-gradient">
                          {formatDuration(stats.avgDuration)}
                        </div>
                        <div className="text-white/60 text-sm">שעות:דקות:שניות</div>
                      </div>

                      {/* Top Pages */}
                      <div className="glass rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                          <h3 className="text-xl font-semibold">דפים פופולריים</h3>
                        </div>
                        <div className="p-6">
                          {stats.pageViews.length === 0 ? (
                            <div className="text-center text-white/50 py-8">אין נתונים עדיין</div>
                          ) : (
                            <div className="space-y-3">
                              {stats.pageViews.slice(0, 10).map(([page, count]) => (
                                <div key={page} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-cyan-400">{page}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs">
                                        <div
                                          className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                          style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right mr-4">
                                    <div className="text-xl font-bold">{count}</div>
                                    <div className="text-xs text-white/60">
                                      {Math.round((count / stats.total) * 100)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Referrers - CLEANED UP DISPLAY */}
                      <div className="glass rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                          <h3 className="text-xl font-semibold">מקורות תנועה</h3>
                        </div>
                        <div className="p-6">
                          {stats.referrers.length === 0 ? (
                            <div className="text-center text-white/50 py-8">אין נתונים עדיין</div>
                          ) : (
                            <div className="space-y-3">
                              {stats.referrers.slice(0, 10).map(([referrer, count]) => (
                                <div key={referrer} className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium">{referrer === 'direct' ? 'כניסה ישירה' : referrer}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs">
                                        <div
                                          className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                                          style={{ width: `${(count / stats.total) * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right mr-4">
                                    <div className="text-xl font-bold">{count}</div>
                                    <div className="text-xs text-white/60">
                                      {Math.round((count / stats.total) * 100)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Visits Table */}
                      <div className="glass rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                          <h3 className="text-xl font-semibold">ביקורים אחרונים</h3>
                          <button
                            onClick={fetchAnalytics}
                            className="btn-primary rounded-xl px-4 py-2 text-sm"
                            disabled={analyticsLoading}
                          >
                            🔄 רענן
                          </button>
                        </div>
                        {visits.length === 0 ? (
                          <div className="p-12 text-center text-white/50">
                            <div className="text-4xl mb-4">📊</div>
                            <p>אין ביקורים עדיין</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-black/30 border-b border-white/10">
                                <tr>
                                  <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">תאריך</th>
                                  <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">דף</th>
                                  <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">משך</th>
                                  <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">מקור</th>
                                  <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">IP/מדינה</th>
                                </tr>
                              </thead>
                              <tbody>
                                {visits.slice(0, 50).map((visit) => (
                                  <tr key={visit.id} className="border-b border-white/5 hover:bg-white/5">
                                    <td className="px-6 py-4 text-sm text-white/60">
                                      {new Date(visit.timestamp).toLocaleString('he-IL')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-cyan-400">{visit.page}</td>
                                    <td className="px-6 py-4 text-sm">
                                      {formatDuration(visit.duration).replace(/^00:/, '')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60">
                                      {visit.referrer ? (() => {
                                        try {
                                          return new URL(visit.referrer).hostname.replace(/^www\./, '');
                                        } catch {
                                          return 'ישיר';
                                        }
                                      })() : 'ישיר'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60">
                                      {visit.client_ip} ({visit.is_israel ? 'IL' : visit.country_code || '??'})
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
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
