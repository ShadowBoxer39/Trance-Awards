// pages/admin.tsx
import React from "react";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

export default function Admin() {
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [clearing, setClearing] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  React.useEffect(() => {
    // RTL and saved key
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = typeof window !== "undefined" ? localStorage.getItem("ADMIN_KEY") : null;
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading && !error) fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ----- helpers (match DB ids to awards-data) -----
  const findCategory = (catId: string | number | null | undefined) => {
    const id = String(catId ?? "");
    return (
      CATEGORIES.find((c: any) => String(c.id) === id) ||
      CATEGORIES.find((c: any) => String((c as any).slug) === id) ||
      null
    );
  };

  const getCategoryTitle = (catId: string | number | null | undefined) => {
    const cat = findCategory(catId);
    if (cat?.title) return cat.title;
    const id = String(catId ?? "");
    return id && id !== "undefined" ? id : "לא ידוע";
  };

  const getNomineeName = (
    catId: string | number | null | undefined,
    nomineeId: string | number | null | undefined
  ) => {
    const cat = findCategory(catId);
    const id = String(nomineeId ?? "");
    const nominee =
      cat?.nominees.find((n: any) => String(n.id) === id) ||
      cat?.nominees.find((n: any) => String(n.name) === id);
    if (nominee?.name) return nominee.name;
    return id && id !== "undefined" ? id : "לא ידוע";
  };

  // ----- fetch stats (no filtering out keys; just coerce) -----
  async function fetchStats(e?: React.FormEvent) {
    e?.preventDefault();
    if (!key) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || "request_failed");

      const rawTally = j.tally ?? {};
      const normalized: Tally = Object.fromEntries(
        Object.entries(rawTally).map(([catId, perNominee]: [any, any]) => [
          String(catId),
          Object.fromEntries(
            Object.entries(perNominee || {}).map(([nomId, count]) => [
              String(nomId),
              Number(count) || 0,
            ])
          ),
        ])
      );

      setTally(normalized);
      setTotalVotes(Number(j.totalVotes) || 0);
      localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "error");
      setTally(null);
      setTotalVotes(0);
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

  // ----- UI -----
  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="glass rounded-2xl px-6 py-4">
            <div className="text-sm text-white/70">סך־הכל הצבעות</div>
            <div className="text-4xl font-extrabold text-cyan-300 tracking-wider">{totalVotes}</div>
          </div>

          <h1 className="text-4xl font-bold gradient-title">Admin Dashboard</h1>
        </div>

        {/* Actions bar */}
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => callClear("all")}
              className="rounded-xl px-4 py-2 bg-red-600/25 hover:bg-red-600/35 border border-red-500/30 text-red-200 font-semibold"
              disabled={clearing}
              title="Delete all votes"
            >
              נקה הכל 🗑️
            </button>

            <button
              onClick={() => callClear("me")}
              className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90"
              disabled={clearing}
              title="Delete votes from this device"
            >
              נקה הצבעות (מכשיר זה)
            </button>
          </div>

          <form onSubmit={fetchStats} className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-xl px-4 py-2 bg-gradient-to-r from-orange-400/70 to-fuchsia-500/70 hover:from-orange-400 hover:to-fuchsia-500 font-semibold"
              disabled={loading}
            >
              ריענון תוצאות
            </button>
          </form>
        </div>

        {/* Admin key prompt (when no data yet) */}
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

        {info && <div className="glass rounded-xl p-4 text-green-400 text-center">{info}</div>}
        {error && tally && <div className="glass rounded-xl p-4 text-red-400 text-center">{error}</div>}

        {/* Category grid */}
        {tally && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(tally).map(([catId, perNominee]) => {
              const rows = Object.entries(perNominee).sort((a, b) => b[1] - a[1]);
              const totalInCategory = rows.reduce((sum, [, n]) => sum + n, 0);
              const winner = rows[0];

              return (
                <div key={catId} className="rounded-2xl p-[1px] bg-gradient-to-b from-white/10 to-white/5">
                  <div className="glass rounded-2xl p-6">
                    {/* title centered (like your screenshot) */}
                    <h3 className="text-2xl font-extrabold text-center text-cyan-300 mb-1">
                      {getCategoryTitle(catId)}
                    </h3>
                    <div className="text-center text-white/70 mb-5">הצבעות {totalInCategory}</div>

                    {/* winner card */}
                    {winner && (
                      <div className="rounded-xl p-[1px] bg-gradient-to-r from-cyan-500/50 to-fuchsia-500/50">
                        <div className="rounded-xl p-5 bg-gradient-to-r from-slate-800/70 to-slate-800/40">
                          <div className="text-xs text-cyan-300 mb-1">מוביל 🏆</div>
                          <div className="text-lg font-semibold">
                            {getNomineeName(catId, winner[0])}
                          </div>
                          <div className="text-sm text-white/80">
                            {winner[1]} קולות ({totalInCategory ? Math.round((winner[1] / totalInCategory) * 100) : 0}
                            %)
                          </div>
                        </div>
                      </div>
                    )}

                    {/* link at bottom */}
                    <div className="mt-4 text-center">
                      <button className="text-cyan-300 hover:text-cyan-200 text-sm">
                        → לחץ לפרטים מלאים
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
