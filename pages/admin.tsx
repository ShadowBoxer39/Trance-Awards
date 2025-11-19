// pages/admin.tsx - MERGED VERSION: VOTES + YOUNG ARTISTS
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

interface Signup {
  id: string;
  fullName: string;
  stageName: string;
  experienceYears: string;
  inspirations: string;
  trackLink: string;
  submittedAt: string;
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
  const [selectedSignup, setSelectedSignup] = React.useState<Signup | null>(null);
  const [activeTab, setActiveTab] = React.useState<"votes" | "signups">("votes");

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
      loadSignups();
    }
  }, [tally]);

  const loadSignups = () => {
    const data = localStorage.getItem('youngArtistSignups');
    if (data) {
      const parsed = JSON.parse(data);
      parsed.sort((a: Signup, b: Signup) => 
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      );
      setSignups(parsed);
    }
  };

  const deleteSignup = (id: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק את ההרשמה?")) {
      const updated = signups.filter(s => s.id !== id);
      setSignups(updated);
      localStorage.setItem('youngArtistSignups', JSON.stringify(updated));
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
    if (!key) return alert("אין מפתח ניהול.");
    
    const msg = mode === "all"
      ? "למחוק את כל ההצבעות? פעולה זו אינה הפיכה."
      : "למחוק רק את ההצבעות מהמכשיר הזה?";
      
    if (!confirm(msg)) return;

    setClearing(true);
    setError(null);
    setInfo(null);
    
    try {
      const r = await fetch(`/api/dev-clear`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, mode }),
      });
      
      const j = await r.json();
      
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "request_failed");
      }
      
      setInfo(`נמחקו ${j?.deleted ?? 0} הצבעות.`);
      await fetchStats();
      
    } catch (err: any) {
      setError(err?.message || "error");
    } finally {
      setClearing(false);
    }
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
            </div>

            {/* VOTES TAB */}
            {activeTab === "votes" && (
              <>
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 justify-between items-center">
                  <button
                    onClick={fetchStats}
                    className="btn-primary rounded-xl px-4 py-2 text-sm"
                    disabled={loading}
                  >
                    🔄 רענן תוצאות
                  </button>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => callClear("me")}
                      className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm"
                      disabled={clearing}
                    >
                      נקה הצבעות (מכשיר)
                    </button>
                    
                    <button
                      onClick={() => callClear("all")}
                      className="rounded-xl px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm border border-red-500/30"
                      disabled={clearing}
                    >
                      🗑️ נקה הכל
                    </button>
                  </div>
                </div>

                {info && (
                  <div className="glass rounded-xl p-4 text-green-400 text-center">
                    {info}
                  </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat) => {
                    const perNominee = tally[cat.id] || {};
                    const rows = Object.entries(perNominee).sort((a, b) => b[1] - a[1]);
                    const total = rows.reduce((acc, [, n]) => acc + n, 0);
                    const winner = rows[0];

                    return (
                      <div
                        key={cat.id}
                        className="glass rounded-2xl p-5 cursor-pointer hover:border-cyan-400/50 transition"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        <h3 className="text-lg font-bold mb-2 text-cyan-400">
                          {cat.title}
                        </h3>
                        
                        <div className="text-sm text-white/60 mb-4">
                          {total} הצבעות
                        </div>

                        {winner && winner[1] > 0 ? (
                          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-3 border border-cyan-500/30">
                            <div className="text-xs text-cyan-400 mb-1">🏆 מוביל</div>
                            <div className="font-bold text-white">
                              {getNomineeName(cat.id, winner[0])}
                            </div>
                            <div className="text-sm text-white/80">
                              {winner[1]} קולות ({Math.round((winner[1] / total) * 100)}%)
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/5 rounded-xl p-3 text-center text-white/50 text-sm">
                            אין הצבעות
                          </div>
                        )}

                        <button className="mt-4 w-full text-xs text-cyan-400 hover:text-cyan-300">
                          לחץ לפרטים →
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedCategory && tally[selectedCategory] && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
                    <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold gradient-title">
                          {getCategoryTitle(selectedCategory)}
                        </h2>
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className="text-white/60 hover:text-white text-2xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mb-8 bg-black/30 rounded-xl p-4">
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart
                            data={Object.entries(tally[selectedCategory])
                              .sort((a, b) => b[1] - a[1])
                              .map(([id, count]) => ({
                                name: getNomineeName(selectedCategory, id),
                                votes: count,
                              }))}
                          >
                            <XAxis 
                              dataKey="name" 
                              angle={-45} 
                              textAnchor="end" 
                              height={100} 
                              tick={{ fill: "#fff", fontSize: 12 }} 
                            />
                            <YAxis tick={{ fill: "#fff" }} />
                            <Tooltip
                              contentStyle={{ 
                                background: "#1a1a2e", 
                                border: "1px solid #00ffcc", 
                                borderRadius: "8px" 
                              }}
                            />
                            <Bar dataKey="votes" fill="#00ffcc" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="text-white/70 border-b border-white/10">
                            <tr>
                              <th className="text-right py-3">מקום</th>
                              <th className="text-right py-3">שם</th>
                              <th className="text-right py-3">קולות</th>
                              <th className="text-right py-3">אחוז</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(tally[selectedCategory])
                              .sort((a, b) => b[1] - a[1])
                              .map(([nomineeId, count], index) => {
                                const total = Object.values(tally[selectedCategory]).reduce((a, b) => a + b, 0);
                                const pct = Math.round((count / total) * 100);
                                
                                return (
                                  <tr key={nomineeId} className="border-t border-white/5 hover:bg-white/5">
                                    <td className="py-3 text-right">
                                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                    </td>
                                    <td className="py-3 text-right font-medium">
                                      {getNomineeName(selectedCategory, nomineeId)}
                                    </td>
                                    <td className="py-3 text-right text-cyan-400 font-bold">
                                      {count}
                                    </td>
                                    <td className="py-3 text-right">
                                      <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                                            style={{ width: `${pct}%` }}
                                          />
                                        </div>
                                        <span className="text-white/80">{pct}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* SIGNUPS TAB */}
            {activeTab === "signups" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass rounded-xl p-6">
                    <div className="text-3xl font-semibold text-gradient mb-2">{signups.length}</div>
                    <div className="text-white/60 text-sm">סך הכל הרשמות</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-3xl font-semibold text-gradient mb-2">
                      {signups.filter(s => {
                        const date = new Date(s.submittedAt);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return date > weekAgo;
                      }).length}
                    </div>
                    <div className="text-white/60 text-sm">שבוע אחרון</div>
                  </div>
                  <div className="glass rounded-xl p-6">
                    <div className="text-3xl font-semibold text-gradient mb-2">
                      {signups.filter(s => {
                        const date = new Date(s.submittedAt);
                        const today = new Date();
                        return date.toDateString() === today.toDateString();
                      }).length}
                    </div>
                    <div className="text-white/60 text-sm">היום</div>
                  </div>
                </div>

                <div className="glass rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">הרשמות אמנים</h2>
                      <button
                        onClick={loadSignups}
                        className="btn-primary rounded-xl px-4 py-2 text-sm"
                      >
                        🔄 רענן
                      </button>
                    </div>
                  </div>

                  {signups.length === 0 ? (
                    <div className="p-12 text-center text-white/50">
                      <div className="text-4xl mb-4">📝</div>
                      <p>אין הרשמות עדיין</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-black/30 border-b border-white/10">
                          <tr>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">תאריך</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">שם מלא</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">שם במה</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">ניסיון</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-white/60">פעולות</th>
                          </tr>
                        </thead>
                        <tbody>
                          {signups.map((signup) => (
                            <tr
                              key={signup.id}
                              className={`border-b border-white/5 hover:bg-white/5 transition ${
                                selectedSignup?.id === signup.id ? 'bg-purple-500/10' : ''
                              }`}
                            >
                              <td className="px-6 py-4 text-sm text-white/60">
                                {formatDate(signup.submittedAt)}
                              </td>
                              <td className="px-6 py-4 text-sm font-medium">{signup.fullName}</td>
                              <td className="px-6 py-4 text-sm text-cyan-400">{signup.stageName}</td>
                              <td className="px-6 py-4 text-sm text-white/60">{signup.experienceYears}</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setSelectedSignup(signup)}
                                    className="rounded px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-medium transition"
                                  >
                                    פרטים
                                  </button>
                                  <button
                                    onClick={() => deleteSignup(signup.id)}
                                    className="rounded px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition"
                                  >
                                    מחק
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {selectedSignup && (
                  <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-6">
                    <div className="glass rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">פרטי הרשמה</h3>
                        <button
                          onClick={() => setSelectedSignup(null)}
                          className="text-white/60 hover:text-white text-2xl"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        <div>
                          <div className="text-sm text-white/60 mb-1">תאריך</div>
                          <div className="text-lg">{formatDate(selectedSignup.submittedAt)}</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">שם מלא</div>
                          <div className="text-lg font-medium">{selectedSignup.fullName}</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">שם במה</div>
                          <div className="text-lg text-cyan-400 font-semibold">{selectedSignup.stageName}</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">ניסיון</div>
                          <div className="text-lg">{selectedSignup.experienceYears}</div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">השראות</div>
                          <div className="text-base leading-relaxed bg-black/30 rounded-lg p-4">
                            {selectedSignup.inspirations}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-white/60 mb-1">לינק לטראק</div>
                          <a
                            href={selectedSignup.trackLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 transition break-all"
                          >
                            {selectedSignup.trackLink}
                          </a>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <a
                            href={selectedSignup.trackLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary px-6 py-3 rounded-xl font-medium flex-1 text-center"
                          >
                            שמע טראק
                          </a>
                          <button
                            onClick={() => deleteSignup(selectedSignup.id)}
                            className="rounded-xl px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-medium border border-red-500/30 transition"
                          >
                            מחק
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
