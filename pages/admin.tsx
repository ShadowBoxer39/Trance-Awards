// pages/admin.tsx - COMPLETE VERSION WITH TRACK SUBMISSIONS

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

// Helper function to extract YouTube video ID from various URLs
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

interface ServerVisitData {
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

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="glass p-3 rounded-lg text-sm" style={{ border: '1px solid #4f46e5' }}>
        <p className="font-semibold text-cyan-400">{label}</p>
        <p>{`${value} ביקורים`}</p>
      </div>
    );
  }
  return null;
};

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
  
  // Track Submissions State
  const [trackSubs, setTrackSubs] = React.useState<TrackSubmission[]>([]);
  const [trackSubsLoading, setTrackSubsLoading] = React.useState(false);
  const [selectedTrackSub, setSelectedTrackSub] = React.useState<TrackSubmission | null>(null);

  // Analytics State
  const [visits, setVisits] = React.useState<ServerVisitData[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  
  // Tab State
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tally, activeTab]);

  const fetchTrackSubmissions = async () => {
    if (!key) return;
    setTrackSubsLoading(true);
    try {
      const r = await fetch(`/api/track-submissions?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "Failed to fetch track submissions.");
      }
      
      setTrackSubs(j.submissions as TrackSubmission[]);
      
    } catch (err: any) {
      console.error("Error fetching track submissions:", err);
      alert("שגיאה בטעינת הגשות טרקים. בדוק את הקונסול.");
    } finally {
      setTrackSubsLoading(false);
    }
  };

  const approveTrack = async (trackId: string) => {
    if (!confirm("האם אתה בטוח שברצונך לאשר טרק זה כ'טרק השבועי'? זה יבטל את האישור של הטרק הנוכחי.")) return;
    setLoading(true);

    try {
        const response = await fetch('/api/approve-track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, trackId }),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.error || `Approval failed with status: ${response.status}`);
        }

        alert("✅ הטרק אושר בהצלחה! הוא יופיע באתר מיד.");
        setSelectedTrackSub(null);
        fetchTrackSubmissions(); // Refresh the list
        
    } catch (error: any) {
        alert(`שגיאה באישור הטרק: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!key) return;
    setAnalyticsLoading(true);
    try {
      const r = await fetch(`/api/analytics?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "Failed to fetch analytics.");
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
    const pageVisits: Record<string, number> = {};
    const dailyVisits: Record<string, number> = {};
    const countryVisits: Record<string, number> = {};
    let totalDuration = 0;
    let validDurations = 0;
    let israelVisits = 0;

    visits.forEach((v) => {
      pageVisits[v.page] = (pageVisits[v.page] || 0) + 1;

      const dateKey = new Date(v.timestamp).toISOString().split('T')[0];
      dailyVisits[dateKey] = (dailyVisits[dateKey] || 0) + 1;

      if (v.country_code) {
        countryVisits[v.country_code] = (countryVisits[v.country_code] || 0) + 1;
      }

      if (v.duration && v.duration > 0) {
        totalDuration += v.duration;
        validDurations++;
      }

      if (v.is_israel) {
        israelVisits++;
      }
    });

    const avgDuration = validDurations > 0 ? totalDuration / validDurations : 0;

    const chartData = Object.keys(dailyVisits)
      .sort()
      .slice(-14)
      .map((date) => ({
        date: new Date(date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
        visits: dailyVisits[date],
      }));

    return {
      pageVisits,
      dailyVisits,
      countryVisits,
      avgDuration,
      israelVisits,
      chartData,
    };
  };

  const deleteSignup = (id: string) => {
    if (!confirm("למחוק הרשמה זו?")) return;
    setSignups((prev) => prev.filter((s) => s.id !== id));
  };

  const downloadCSV = () => {
    const headers = [
      "שם מלא",
      "שם במה",
      "גיל",
      "טלפון",
      "ניסיון",
      "השראות",
      "לינק",
      "תאריך הגשה",
    ];

    const rows = signups.map((s) => [
      s.full_name,
      s.stage_name,
      s.age,
      s.phone,
      s.experience_years,
      s.inspirations,
      s.track_link,
      new Date(s.submitted_at).toLocaleString('he-IL'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `artist-signups-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  async function fetchStats(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!key) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const r = await fetch(`/api/results?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "שגיאה בטעינת הנתונים");
      }

      setTally(j.tally as Tally);
      
      const total = Object.values(j.tally as Tally).reduce((sum, nominees) => {
        return sum + Object.values(nominees).reduce((s, count) => s + count, 0);
      }, 0);
      setTotalVotes(total);

      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) {
      setError(err.message || "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  }

  async function callClear(mode: "all" | "me") {
    const msg = mode === "all" ? "למחוק את כל ההצבעות?" : "למחוק את ההצבעות שלך?";
    if (!confirm(msg)) return;

    setClearing(true);
    setInfo(null);
    setError(null);

    try {
      const r = await fetch("/api/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, mode }),
      });
      const j = await r.json();

      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "שגיאה במחיקה");
      }

      setInfo(j.message);
      await fetchStats();
    } catch (err: any) {
      setError(err.message || "שגיאה לא ידועה");
    } finally {
      setClearing(false);
    }
  }

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
            <div className="glass rounded-2xl p-1 flex gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab("votes")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "votes"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                🗳️ תוצאות הצבעה ({totalVotes})
              </button>
              <button
                onClick={() => setActiveTab("signups")}
                className={`flex-1 rounded-xl px-6 py-3 font-semibold transition whitespace-nowrap ${
                  activeTab === "signups"
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                    : "text-white/60 hover:text-white"
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
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <h2 className="text-2xl font-semibold">תוצאות הצבעה</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => callClear("me")}
                      className="btn-secondary rounded-xl px-4 py-2 text-sm"
                      disabled={clearing}
                    >
                      {clearing ? "מוחק..." : "מחק ההצבעות שלי"}
                    </button>
                    <button
                      onClick={() => callClear("all")}
                      className="bg-red-600/80 hover:bg-red-600 rounded-xl px-4 py-2 text-sm font-semibold"
                      disabled={clearing}
                    >
                      {clearing ? "מוחק..." : "מחק הכל"}
                    </button>
                  </div>
                </div>

                {info && (
                  <div className="glass border-l-4 border-green-500 p-4 rounded-xl text-green-400">
                    {info}
                  </div>
                )}

                <div className="grid gap-4">
                  {Object.entries(tally).map(([catId, nominees]) => {
                    const totalCat = Object.values(nominees).reduce((s, c) => s + c, 0);
                    return (
                      <div key={catId} className="glass rounded-2xl p-6">
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() =>
                            setSelectedCategory(selectedCategory === catId ? null : catId)
                          }
                        >
                          <h3 className="text-xl font-semibold text-cyan-400">
                            {getCategoryTitle(catId)}
                          </h3>
                          <div className="text-sm">
                            <span className="text-white/60">סה״כ: </span>
                            <span className="font-bold text-white">{totalCat}</span>
                          </div>
                        </div>

                        {selectedCategory === catId && (
                          <div className="mt-4 space-y-2">
                            {Object.entries(nominees)
                              .sort(([, a], [, b]) => b - a)
                              .map(([nomineeId, count]) => (
                                <div
                                  key={nomineeId}
                                  className="flex items-center justify-between bg-black/30 rounded-lg p-3"
                                >
                                  <span className="text-white/80">
                                    {getNomineeName(catId, nomineeId)}
                                  </span>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm text-white/60">
                                      {totalCat > 0
                                        ? `${((count / totalCat) * 100).toFixed(1)}%`
                                        : "0%"}
                                    </div>
                                    <span className="font-bold text-cyan-400">{count}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* SIGNUPS TAB */}
            {activeTab === "signups" && (
              <>
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <h2 className="text-2xl font-semibold">הרשמות אמנים צעירים</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={downloadCSV}
                      className="btn-primary rounded-xl px-4 py-2 text-sm"
                      disabled={signups.length === 0}
                    >
                      📥 הורד CSV
                    </button>
                    <button
                      onClick={fetchSignups}
                      className="btn-secondary rounded-xl px-4 py-2 text-sm"
                      disabled={signupsLoading}
                    >
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
                        <h3 className="text-lg font-bold text-cyan-400 mb-1">
                          {s.stage_name}
                        </h3>
                        <p className="text-sm text-white/70 mb-3">{s.full_name}</p>
                        <div className="space-y-1 text-sm mb-3">
                          <p>
                            <span className="text-white/60">גיל:</span> {s.age}
                          </p>
                          <p>
                            <span className="text-white/60">ניסיון:</span> {s.experience_years}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSignup(s)}
                            className="btn-primary px-3 py-2 rounded-xl text-sm flex-1"
                          >
                            צפה בפרטים
                          </button>
                          <button
                            onClick={() => deleteSignup(s.id)}
                            className="bg-red-600/50 hover:bg-red-600 px-3 py-2 rounded-xl text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Signup Details Modal */}
                {selectedSignup && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
                    <div className="glass rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">פרטי אמן</h3>
                        <button
                          onClick={() => setSelectedSignup(null)}
                          className="text-white/60 hover:text-white text-2xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <div className="text-sm text-white/60 mb-1">שם במה</div>
                          <div className="text-2xl font-bold text-cyan-400">
                            {selectedSignup.stage_name}
                          </div>
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
                            <div dir="ltr" className="text-left">
                              {selectedSignup.phone}
                            </div>
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
                          <a
                            href={selectedSignup.track_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline break-all"
                          >
                            {selectedSignup.track_link}
                          </a>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">תאריך הגשה</div>
                          <div>
                            {new Date(selectedSignup.submitted_at).toLocaleString('he-IL')}
                          </div>
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
                  <button
                    onClick={fetchTrackSubmissions}
                    className="btn-primary rounded-xl px-4 py-2 text-sm"
                    disabled={trackSubsLoading}
                  >
                    {trackSubsLoading ? "טוען..." : `🔄 רענן (${trackSubs.length})`}
                  </button>
                </div>
                
                {trackSubsLoading ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4 animate-spin">⏳</div>
                    <p>טוען המלצות טרקים...</p>
                  </div>
                ) : trackSubs.length === 0 ? (
                  <div className="p-12 text-center text-white/50">
                    <div className="text-4xl mb-4">🎵</div>
                    <p>אין המלצות טרקים חדשות</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trackSubs.map((track) => (
                        <div
                          key={track.id}
                          className={`glass rounded-2xl p-4 transition ${
                            track.is_approved
                              ? 'bg-green-900/20 border-2 border-green-500/50'
                              : 'border border-purple-500/30'
                          }`}
                        >
                          <p className="text-sm text-cyan-400 mb-1">
                            {new Date(track.created_at).toLocaleDateString('he-IL')}
                          </p>
                          <h3 className="text-lg font-bold mb-2">{track.track_title}</h3>
                          <p className="text-white/80 text-sm mb-1">מגיש: {track.name}</p>
                          <p className="text-white/60 text-xs line-clamp-2 mb-4">
                            {track.description.substring(0, 80)}...
                          </p>

                          <div className="flex flex-col gap-2">
                            {track.is_approved ? (
                              <div className="bg-green-600/50 text-white text-sm py-2 rounded-xl text-center">
                                ✅ טרק שבועי פעיל
                              </div>
                            ) : (
                              <button
                                onClick={() => approveTrack(track.id)}
                                className="btn-primary px-3 py-2 rounded-xl text-sm font-semibold"
                                disabled={loading}
                              >
                                {loading ? 'מבצע...' : '⭐ אשר כטרק שבועי'}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedTrackSub(track)}
                              className="btn-secondary px-3 py-2 rounded-xl text-sm"
                            >
                              👁️ צפייה בפרטים
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Track Details Modal */}
                {selectedTrackSub && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
                    <div className="glass rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">פרטי טרק</h3>
                        <button
                          onClick={() => setSelectedTrackSub(null)}
                          className="text-white/60 hover:text-white text-2xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* YouTube Embed */}
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                              selectedTrackSub.youtube_url
                            )}?autoplay=0`}
                            title={selectedTrackSub.track_title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">שם הטרק</div>
                          <div className="text-2xl font-bold">{selectedTrackSub.track_title}</div>
                        </div>

                        <div className="flex items-center gap-4">
                          {selectedTrackSub.photo_url && (
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-green-500/50">
                              <img
                                src={selectedTrackSub.photo_url}
                                alt={selectedTrackSub.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-white/60">מגיש</div>
                            <div className="text-lg text-cyan-400 font-semibold">
                              {selectedTrackSub.name}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">הסיבה לבחירה</div>
                          <div className="text-base leading-relaxed bg-black/30 rounded-lg p-4">
                            {selectedTrackSub.description}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">תאריך הגשה</div>
                          <div>{new Date(selectedTrackSub.created_at).toLocaleString('he-IL')}</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">סטטוס</div>
                          <div>
                            {selectedTrackSub.is_approved ? (
                              <span className="text-green-400 font-semibold">✅ אושר כטרק שבועי</span>
                            ) : (
                              <span className="text-yellow-400">⏳ ממתין לאישור</span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          {!selectedTrackSub.is_approved && (
                            <button
                              onClick={() => approveTrack(selectedTrackSub.id)}
                              className="btn-primary px-6 py-3 rounded-xl font-medium flex-1 text-center"
                              disabled={loading}
                            >
                              {loading ? 'מאשר...' : '⭐ אשר כטרק שבועי'}
                            </button>
                          )}
                          <a
                            href={selectedTrackSub.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary px-6 py-3 rounded-xl font-medium flex-1 text-center"
                          >
                            צפה ביוטיוב
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "analytics" && (() => {
              const analytics = getAnalytics();
              
              return (
                <>
                  <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                    <h2 className="text-2xl font-semibold">סטטיסטיקות אתר</h2>
                    <button
                      onClick={fetchAnalytics}
                      className="btn-primary rounded-xl px-4 py-2 text-sm"
                      disabled={analyticsLoading}
                    >
                      {analyticsLoading ? "טוען..." : `🔄 רענן (${visits.length})`}
                    </button>
                  </div>

                  {analyticsLoading ? (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4 animate-spin">⏳</div>
                      <p>טוען נתוני ביקורים...</p>
                    </div>
                  ) : visits.length === 0 ? (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4">📊</div>
                      <p>אין נתונים עדיין</p>
                    </div>
                  ) : (
                    <>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass rounded-2xl p-6">
                          <div className="text-sm text-white/60 mb-1">סה״כ ביקורים</div>
                          <div className="text-3xl font-bold text-cyan-400">{visits.length}</div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                          <div className="text-sm text-white/60 mb-1">ממוצע זמן ביקור</div>
                          <div className="text-3xl font-bold text-purple-400">
                            {formatDuration(Math.round(analytics.avgDuration))}
                          </div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                          <div className="text-sm text-white/60 mb-1">ביקורים מישראל</div>
                          <div className="text-3xl font-bold text-green-400">
                            {analytics.israelVisits}
                          </div>
                          <div className="text-xs text-white/50 mt-1">
                            ({((analytics.israelVisits / visits.length) * 100).toFixed(1)}%)
                          </div>
                        </div>
                        <div className="glass rounded-2xl p-6">
                          <div className="text-sm text-white/60 mb-1">מדינות שונות</div>
                          <div className="text-3xl font-bold text-yellow-400">
                            {Object.keys(analytics.countryVisits).length}
                          </div>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4">ביקורים יומיים (14 ימים אחרונים)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="visits" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Page Visits */}
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4">ביקורים לפי דף</h3>
                        <div className="space-y-2">
                          {Object.entries(analytics.pageVisits)
                            .sort(([, a], [, b]) => b - a)
                            .map(([page, count]) => (
                              <div key={page} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                                <span className="text-white/80">{page}</span>
                                <span className="font-bold text-cyan-400">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Country Visits */}
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-4">ביקורים לפי מדינה</h3>
                        <div className="space-y-2">
                          {Object.entries(analytics.countryVisits)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 10)
                            .map(([country, count]) => (
                              <div key={country} className="flex items-center justify-between bg-black/30 rounded-lg p-3">
                                <span className="text-white/80">{country}</span>
                                <span className="font-bold text-cyan-400">{count}</span>
                              </div>
                            ))}
                        </div>
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
