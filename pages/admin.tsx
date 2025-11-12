// pages/admin.tsx - DEBUG VERSION
import React from "react";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

export default function Admin() {
  const [key, setKey] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [totalVotes, setTotalVotes] = React.useState<number>(0);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) setKey(savedKey);
  }, []);

  React.useEffect(() => {
    if (key && !tally && !loading) {
      fetchStats();
    }
  }, [key]);

  async function fetchStats(e?: React.FormEvent) {
    e?.preventDefault();
    if (!key) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(key)}&_t=${Date.now()}`);
      const j = await r.json();
      
      if (!r.ok || !j?.ok) {
        throw new Error(j?.error || "request_failed");
      }
      
      // Debug: Show what we got vs what we expect
      const apiKeys = Object.keys(j.tally || {});
      const expectedKeys = CATEGORIES.map(c => c.id);
      
      setDebugInfo({
        apiKeys,
        expectedKeys,
        matches: apiKeys.map(k => ({
          apiKey: k,
          expectedKey: expectedKeys.find(e => e === k) || "NOT FOUND",
          hasMatch: expectedKeys.includes(k)
        }))
      });
      
      setTally(j.tally as Tally);
      setTotalVotes(j.totalVotes || 0);
      localStorage.setItem("ADMIN_KEY", key);
      
    } catch (err: any) {
      setError(err?.message || "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen text-white neon-backdrop">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-title">Admin Dashboard - DEBUG</h1>
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
              className="w-full btn-primary rounded-2xl px-4 py-3"
              disabled={!key || loading}
              type="submit"
            >
              {loading ? "טוען…" : "טען תוצאות"}
            </button>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          </form>
        )}

        {/* DEBUG INFO */}
        {debugInfo && (
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-yellow-400">🔍 DEBUG INFO - CATEGORY KEYS</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2 text-cyan-400">Keys from API:</h3>
                <pre className="bg-black/50 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.apiKeys, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 text-purple-400">Expected Keys (CATEGORIES):</h3>
                <pre className="bg-black/50 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo.expectedKeys, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-orange-400">Key Matching:</h3>
              <div className="space-y-2">
                {debugInfo.matches.map((m: any, i: number) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded ${m.hasMatch ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">API: "{m.apiKey}"</span>
                      <span className="text-2xl">{m.hasMatch ? '✅' : '❌'}</span>
                      <span className="font-mono text-sm">Expected: "{m.expectedKey}"</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-4">
              <p className="text-sm">
                <strong>What this means:</strong><br/>
                - ✅ Green = Keys match, data will show<br/>
                - ❌ Red = Keys don't match, data won't show<br/>
                <br/>
                If you see red, the category IDs in your database don't match the IDs in your CATEGORIES array.
              </p>
            </div>
          </div>
        )}

        {/* Show raw tally data */}
        {tally && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold mb-3">Raw Tally Data from API:</h3>
            <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(tally, null, 2)}
            </pre>
          </div>
        )}

        {/* Show CATEGORIES data */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-bold mb-3">Expected Category IDs:</h3>
          <div className="space-y-2">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="bg-black/30 p-3 rounded">
                <div className="font-mono text-sm">
                  ID: <span className="text-cyan-400">"{cat.id}"</span>
                  {" | "}
                  Title: <span className="text-white">{cat.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
