// pages/admin.tsx - COMPLETE FIXED VERSION
import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from "recharts";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

export default function Admin() {
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  // ✅ FIXED: Use state instead of useMemo
  const [totalVotes, setTotalVotes] = React.useState<number>(0);

  // Load key from localStorage on mount
  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    
    // Load saved admin key
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) {
      setKey(savedKey);
    }
  }, []);

  // Auto-load results if we have a saved key and haven't loaded yet
  React.useEffect(() => {
    if (key && !tally && !loading && !error) {
      fetchStats();
    }
  }, [key]);

  async function fetchStats(e?: React.FormEvent) {
    e?.preventDefault();
    if (!key) return;
    
    setLoading(true);
    setError(null);
    setInfo(null);
    setTally(null);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "request_failed");
      setTally(j.tally as Tally);
      // ✅ FIXED: Get totalVotes from API
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
    const msg =
      mode === "all"
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
      if (!r.ok || !j?.ok) throw new Error(j?.error || "request_failed");
      setInfo(`נמחקו ${j?.deleted ?? 0} הצבעות.`);
      await fetchStats();
    } catch (err: any) {
      setError(err?.message || "error");
    } finally {
      setClearing(false);
    }
  }

  // Get human-readable category name
  const getCategoryTitle = (catId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat?.title || catId;
  };

  // Get nominee name
  const getNomineeName = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    const nominee = cat?.nominees.find((n) => n.id === nomineeId);
    return nominee?.name || nomineeId;
  };

  // Prepare data for overview pie chart
  const overviewData = React.useMemo(() => {
    if (!tally) return [];
    return Object.entries(tally).map(([catId, votes]) => {
      const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
      return {
        name: getCategoryTitle(catId),
        value: total,
      };
    });
  }, [tally]);

  const COLORS = ["#00ffcc", "#ff00ff", "#ffb86b", "#7b61ff", "#06D6A0", "#FFD166"];

  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-title">Admin Dashboard</h1>
          {totalVotes > 0 && (
            <div className="glass rounded-2xl px-6 py-3">
              <div className="text-sm text-white/60">סה״כ הצבעות</div>
              <div className="text-3xl font-bold text-cyan-400">{totalVotes}</div>
            </div>
          )}
        </div>

        {/* Login Form - Only show if no results loaded */}
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
              {loading ? "טוען…" : "טען תוצאות"}
            </button>

            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}

        {/* Results */}
        {tally && (
          <>
            {/* Action Buttons */}
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
                  נקה הצבעות (מכשיר זה)
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

            {info && <div className="glass rounded-xl p-4 text-green-400 text-center">{info}</div>}

            {/* Category Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tally).map(([catId, perNominee]) => {
                const rows = Object.entries(perNominee).sort((a, b) => b[1] - a[1]);
                const total = rows.reduce((acc, [, n]) => acc + n, 0);
                const winner = rows[0];

                return (
                  <div
                    key={catId}
                    className="glass rounded-2xl p-5 cursor-pointer hover:border-cyan-400/50 transition"
                    onClick={() => setSelectedCategory(catId)}
                  >
                    <h3 className="text-lg font-bold mb-2 text-cyan-400">
                      {getCategoryTitle(catId)}
                    </h3>
                    
                    <div className="text-sm text-white/60 mb-4">
                      {total} הצבעות
                    </div>

                    {/* Winner */}
                    {winner && (
                      <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl p-3 border border-cyan-500/30">
                        <div className="text-xs text-cyan-400 mb-1">🏆 מוביל</div>
                        <div className="font-bold text-white">
                          {getNomineeName(catId, winner[0])}
                        </div>
                        <div className="text-sm text-white/80">
                          {winner[1]} קולות ({Math.round((winner[1] / total) * 100)}%)
                        </div>
                      </div>
                    )}

                    <button className="mt-4 w-full text-xs text-cyan-400 hover:text-cyan-300">
                      לחץ לפרטים מלאים →
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Detailed Category View */}
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

                  {/* Bar Chart */}
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
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: "#fff", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#fff" }} />
                        <Tooltip
                          contentStyle={{ background: "#1a1a2e", border: "1px solid #00ffcc", borderRadius: "8px" }}
                        />
                        <Bar dataKey="votes" fill="#00ffcc" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Detailed Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-white/70 border-b border-white/10">
                        <tr>
                          <th className="text-right py-3">מקום</th>
                          <th className="text-right py-3">שם</th>
                          <th className="text-right py-3">קולות</th>
                          <th className="text-right py-3">אחוז</th>
                          <th className="text-right py-3"></th>
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
                                  <span className={index === 0 ? "text-2xl" : ""}>
                                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                                  </span>
                                </td>
                                <td className="py-3 text-right font-medium">{getNomineeName(selectedCategory, nomineeId)}</td>
                                <td className="py-3 text-right text-cyan-400 font-bold">{count}</td>
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
      </div>
    </main>
  );
}
