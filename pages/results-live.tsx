// pages/results-live.tsx - LIVE RESULTS PAGE
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

export default function ResultsLive() {
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [totalVotes, setTotalVotes] = React.useState(0);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  // Fetch stats function (public, no auth needed)
  async function fetchPublicStats() {
    try {
      const r = await fetch(`/api/public-stats?_t=${Date.now()}`);
      const j = await r.json();
      
      if (j?.ok) {
        setTally(j.tally);
        setTotalVotes(j.totalVotes || 0);
        setLastUpdate(new Date());
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }

  // Initial fetch + auto-refresh every 10 seconds
  React.useEffect(() => {
    fetchPublicStats();
    const interval = setInterval(fetchPublicStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const getNomineeData = (catId: string, nomineeId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    const nominee = cat?.nominees.find(n => n.id === nomineeId);
    return {
      name: nominee?.name || nomineeId,
      artwork: nominee?.artwork || "/images/default.jpg",
    };
  };

  const getCategoryTitle = (catId: string) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat?.title || catId;
  };

  // Get top 3 for a category
  const getTop3 = (catId: string) => {
    if (!tally || !tally[catId]) return [];
    
    const entries = Object.entries(tally[catId]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nomineeId, votes], index) => ({
        nomineeId,
        votes,
        percent: total > 0 ? (votes / total) * 100 : 0,
        position: index + 1,
      }));
  };

  if (loading) {
    return (
      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📊</div>
          <div className="text-xl text-white/70">טוען תוצאות...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen neon-backdrop text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/vote" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={36}
              height={36}
              className="rounded-full border border-white/15"
            />
            <span className="text-sm text-white/70">חזרה</span>
          </Link>

          {/* Live indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-white/70">LIVE</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-12 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-bounce">🔥</div>
          
          <h1 className="text-4xl sm:text-6xl font-[900] mb-4">
            <span className="gradient-title">התוצאות בזמן אמת</span>
          </h1>

          <p className="text-white/70 text-lg mb-6">
            מתעדכן אוטומטית כל 10 שניות
          </p>

          {/* Stats */}
          <div className="glass rounded-2xl px-8 py-4 inline-block">
            <div className="text-sm text-white/60 mb-1">סה״כ הצבעות</div>
            <div className="text-4xl font-[900] gradient-title">
              {totalVotes.toLocaleString()}
            </div>
          </div>

          {lastUpdate && (
            <div className="mt-4 text-sm text-white/50">
              עודכן לאחרונה: {lastUpdate.toLocaleTimeString('he-IL')}
            </div>
          )}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {CATEGORIES.map((cat) => {
            const top3 = getTop3(cat.id);
            const medals = ['🥇', '🥈', '🥉'];

            return (
              <div key={cat.id} className="glass rounded-3xl p-6 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 blur-2xl opacity-0 hover:opacity-100 transition-opacity" />

                {/* Category Title */}
                <div className="relative z-10 mb-6">
                  <h2 className="text-2xl font-[900] gradient-title mb-1">
                    {cat.title}
                  </h2>
                  <div className="text-sm text-white/60">
                    {top3.reduce((sum, item) => sum + item.votes, 0)} הצבעות
                  </div>
                </div>

                {/* Top 3 List */}
                <div className="relative z-10 space-y-4">
                  {top3.length > 0 ? (
                    top3.map((item, index) => {
                      const nomineeData = getNomineeData(cat.id, item.nomineeId);
                      
                      return (
                        <div
                          key={item.nomineeId}
                          className={`relative overflow-hidden rounded-2xl transition-all ${
                            index === 0 
                              ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-4' 
                              : 'bg-white/5 p-4'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Position */}
                            <div className="text-4xl shrink-0">
                              {medals[index]}
                            </div>

                            {/* Artwork */}
                            <div className="relative w-16 h-16 shrink-0">
                              <Image
                                src={nomineeData.artwork}
                                alt={nomineeData.name}
                                fill
                                className="rounded-xl object-cover"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white truncate mb-1" dir="ltr">
                                {nomineeData.name}
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="relative h-3 bg-black/40 rounded-full overflow-hidden">
                                <div
                                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                                    index === 0
                                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                      : index === 1
                                      ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                      : 'bg-gradient-to-r from-orange-400 to-orange-600'
                                  }`}
                                  style={{ width: `${item.percent}%` }}
                                />
                              </div>
                              
                              {/* Percentage */}
                              <div className="text-xs text-white/70 mt-1">
                                {item.percent.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-white/50 py-8">
                      אין הצבעות עדיין
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold mb-3">עוד לא הצבעתם?</h3>
          <p className="text-white/70 mb-6">
            קולכם יכול לשנות את המאזן!
          </p>
          <Link
            href="/awards"
            className="btn-primary rounded-2xl px-8 py-4 text-lg font-bold inline-block"
          >
            הצביעו עכשיו! 🚀
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/60 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} יוצאים לטראק — נבחרי השנה בטראנס</p>
          <p className="mt-2 text-xs">מתעדכן אוטומטית • {totalVotes} הצבעות • LIVE 🔴</p>
        </div>
      </footer>
    </main>
  );
}
