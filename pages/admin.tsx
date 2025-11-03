// pages/admin.tsx
import React from "react";

type Tally = Record<string, Record<string, number>>;

export default function Admin() {
  const [key, setKey] = React.useState<string>(() => {
    // remember key locally so you don’t paste every refresh
    if (typeof window !== "undefined") {
      return localStorage.getItem("ADMIN_KEY") || "";
    }
    return "";
  });
  const [loading, setLoading] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchStats = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setTally(null);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}`);
      const j = await r.json();
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "request_failed");
      }
      setTally(j.tally as Tally);
      if (typeof window !== "undefined") localStorage.setItem("ADMIN_KEY", key);
    } catch (err: any) {
      setError(err?.message || "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Admin — תוצאות</h1>

        <form onSubmit={fetchStats} className="glass p-4 rounded-2xl flex flex-col gap-3 max-w-md">
          <label className="text-sm text-white/80">Admin Key</label>
          <input
            className="rounded-xl bg-black/50 border border-white/15 px-3 py-2"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Paste ADMIN_KEY"
          />
          <button
            className="btn-primary rounded-2xl px-4 py-2 disabled:opacity-50"
            disabled={!key || loading}
            type="submit"
          >
            {loading ? "טוען…" : "טען תוצאות"}
          </button>
          {error && <div className="text-red-400 text-sm">שגיאה: {error}</div>}
        </form>

        {tally && (
          <div className="space-y-8">
            {Object.entries(tally).map(([catId, perNominee]) => {
              const rows = Object.entries(perNominee).sort((a, b) => b[1] - a[1]);
              const total = rows.reduce((acc, [, n]) => acc + n, 0);
              return (
                <section key={catId} className="glass p-4 rounded-2xl">
                  <h2 className="text-xl font-semibold mb-3">{catId}</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-white/70">
                        <tr>
                          <th className="text-right py-2">Nominee</th>
                          <th className="text-right py-2">Votes</th>
                          <th className="text-right py-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(([nomineeId, count]) => {
                          const pct = total ? Math.round((count / total) * 100) : 0;
                          return (
                            <tr key={nomineeId} className="border-t border-white/10">
                              <td className="py-2 text-right">{nomineeId}</td>
                              <td className="py-2 text-right">{count}</td>
                              <td className="py-2 text-right">{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-xs text-white/60 mt-2">סה״כ: {total}</div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
