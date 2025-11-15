// pages/results-instagram.tsx - PRIVATE ADMIN PAGE FOR INSTAGRAM POSTS
import React, { useRef } from "react";
import Image from "next/image";
import { CATEGORIES } from "@/data/awards-data";

type Tally = Record<string, Record<string, number>>;

export default function ResultsInstagram() {
  const [key, setKey] = React.useState<string>("");
  const [authenticated, setAuthenticated] = React.useState(false);
  const [tally, setTally] = React.useState<Tally | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    const savedKey = localStorage.getItem("ADMIN_KEY");
    if (savedKey) {
      setKey(savedKey);
      authenticateAndFetch(savedKey);
    }
  }, []);

  async function authenticateAndFetch(adminKey: string) {
    setLoading(true);
    try {
      const r = await fetch(`/api/stats?key=${encodeURIComponent(adminKey)}&_t=${Date.now()}`);
      const j = await r.json();
      
      if (!r.ok || !j?.ok) {
        alert("מפתח לא תקין");
        return;
      }
      
      setTally(j.tally as Tally);
      setAuthenticated(true);
      localStorage.setItem("ADMIN_KEY", adminKey);
    } catch (err) {
      alert("שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!key) return;
    authenticateAndFetch(key);
  }

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

  // Get top 7 for a category
  const getTop7 = (catId: string) => {
    if (!tally || !tally[catId]) return [];
    
    const entries = Object.entries(tally[catId]);
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    
    return entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([nomineeId, votes], index) => ({
        nomineeId,
        votes,
        percent: total > 0 ? (votes / total) * 100 : 0,
        position: index + 1,
      }));
  };

  // Generate Instagram story image (1080x1920)
  async function generateInstagramImage(categoryId: string) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Instagram STORY dimensions (9:16 ratio)
    canvas.width = 1080;
    canvas.height = 1920;

    // Background gradient - darker and more dramatic
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#0a0615');
    gradient.addColorStop(0.5, '#0f0a1e');
    gradient.addColorStop(1, '#050510');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Animated glow effects - more vibrant
    const glow1 = ctx.createRadialGradient(900, 200, 0, 900, 200, 500);
    glow1.addColorStop(0, 'rgba(0, 255, 200, 0.4)');
    glow1.addColorStop(0.5, 'rgba(0, 255, 200, 0.15)');
    glow1.addColorStop(1, 'rgba(0, 255, 200, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1080, 1920);

    const glow2 = ctx.createRadialGradient(180, 1700, 0, 180, 1700, 450);
    glow2.addColorStop(0, 'rgba(255, 90, 165, 0.35)');
    glow2.addColorStop(0.5, 'rgba(255, 90, 165, 0.12)');
    glow2.addColorStop(1, 'rgba(255, 90, 165, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1080, 1920);

    // Logo (top) - bigger
    try {
      const logo = await loadImage('/images/logo.png');
      ctx.save();
      ctx.beginPath();
      ctx.arc(540, 130, 70, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logo, 470, 60, 140, 140);
      ctx.restore();
      
      // Logo glow
      ctx.shadowColor = 'rgba(0, 255, 200, 0.5)';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(540, 130, 70, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } catch {}

    // Brand name
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('יוצאים לטראק', 540, 235);

    // Category title - bigger and bolder
    ctx.save();
    ctx.direction = 'rtl';
    const titleGradient = ctx.createLinearGradient(0, 280, 0, 360);
    titleGradient.addColorStop(0, '#00ffcc');
    titleGradient.addColorStop(0.5, '#00d4ff');
    titleGradient.addColorStop(1, '#ff00ff');
    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(getCategoryTitle(categoryId), 540, 320);
    ctx.restore();

    // Year with style
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2025', 540, 385);

    // Top 7 list - adjusted spacing for story format
    const top7 = getTop7(categoryId);
    const startY = 480;
    const itemHeight = 190;

    for (let i = 0; i < top7.length; i++) {
      const item = top7[i];
      const nomineeData = getNomineeData(categoryId, item.nomineeId);
      const y = startY + (i * itemHeight);

      // Card background with gradient
      if (i === 0) {
        const cardGradient = ctx.createLinearGradient(50, y, 1030, y);
        cardGradient.addColorStop(0, 'rgba(255, 215, 0, 0.08)');
        cardGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.18)');
        cardGradient.addColorStop(1, 'rgba(255, 165, 0, 0.12)');
        ctx.fillStyle = cardGradient;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      }
      roundRect(ctx, 50, y, 980, 170, 20);
      ctx.fill();

      // Border
      ctx.strokeStyle = i === 0 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = i === 0 ? 3 : 1.5;
      roundRect(ctx, 50, y, 980, 170, 20);
      ctx.stroke();

      // Position number with medal/number emoji
      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
      ctx.font = '72px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(medals[i], 120, y + 105);

      // Artwork - bigger for story format
      try {
        const img = await loadImage(nomineeData.artwork);
        ctx.save();
        ctx.beginPath();
        ctx.arc(260, y + 85, 60, 0, Math.PI * 2);
        ctx.clip();
        // Cover fit the image
        const scale = Math.max(120 / img.width, 120 / img.height);
        const scaledW = img.width * scale;
        const scaledH = img.height * scale;
        const offsetX = 260 - scaledW / 2;
        const offsetY = (y + 85) - scaledH / 2;
        ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
        ctx.restore();
        
        // Artwork border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(260, y + 85, 60, 0, Math.PI * 2);
        ctx.stroke();
      } catch {}

      // Nominee name (LTR, left-aligned) - bigger for story
      ctx.save();
      ctx.direction = 'ltr';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'left';
      const maxWidth = 650;
      const text = nomineeData.name;
      let fontSize = 48;
      ctx.font = `bold ${fontSize}px Arial`;
      while (ctx.measureText(text).width > maxWidth && fontSize > 28) {
        fontSize -= 2;
        ctx.font = `bold ${fontSize}px Arial`;
      }
      ctx.fillText(text, 345, y + 95);
      ctx.restore();

      // NO PERCENTAGE - removed completely
    }

    // Footer with better styling
    ctx.save();
    ctx.direction = 'rtl';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('נבחרי השנה בטראנס', 540, 1870);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  async function downloadImage(categoryId: string) {
    try {
      const dataUrl = await generateInstagramImage(categoryId);
      const link = document.createElement('a');
      link.download = `${categoryId}-top7-story.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert('שגיאה ביצירת התמונה');
      console.error(err);
    }
  }

  async function downloadAllImages() {
    for (const cat of CATEGORIES) {
      await downloadImage(cat.id);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen neon-backdrop text-white flex items-center justify-center">
        <form onSubmit={handleLogin} className="glass p-8 rounded-2xl max-w-md w-full mx-4 space-y-4">
          <h1 className="text-2xl font-bold gradient-title mb-6">Admin Login</h1>
          <div>
            <label className="text-sm text-white/80 block mb-2">Admin Key</label>
            <input
              className="w-full rounded-xl bg-black/50 border border-white/15 px-4 py-3 text-white"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="הזן מפתח ניהול"
            />
          </div>
          <button
            className="w-full btn-primary rounded-2xl px-4 py-3 font-semibold"
            disabled={!key || loading}
            type="submit"
          >
            {loading ? "טוען..." : "כניסה"}
          </button>
        </form>
      </main>
    );
  }

  if (loading) {
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
    <main className="min-h-screen neon-backdrop text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-title">Instagram Stories Generator</h1>
            <p className="text-sm text-white/60">תמונות Top 7 לסטורי אינסטגרם</p>
          </div>
          
          <button
            onClick={downloadAllImages}
            className="btn-primary rounded-xl px-6 py-3 font-semibold"
          >
            📥 הורד הכל
          </button>
        </div>
      </header>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((cat) => {
            const top7 = getTop7(cat.id);

            return (
              <div key={cat.id} className="glass rounded-2xl p-6">
                {/* Category Info */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold gradient-title mb-2">
                    {cat.title}
                  </h2>
                  <div className="text-sm text-white/60">
                    {top7.reduce((sum, item) => sum + item.votes, 0)} הצבעות
                  </div>
                </div>

                {/* Top 7 Preview */}
                <div className="space-y-2 mb-4">
                  {top7.map((item, index) => {
                    const nomineeData = getNomineeData(cat.id, item.nomineeId);
                    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣'];
                    
                    return (
                      <div
                        key={item.nomineeId}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-white/5'
                        }`}
                      >
                        <span className="text-2xl">{medals[index]}</span>
                        <div className="relative w-10 h-10 shrink-0">
                          <Image
                            src={nomineeData.artwork}
                            alt={nomineeData.name}
                            fill
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" dir="ltr">
                            {nomineeData.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Download Button */}
                <button
                  onClick={() => downloadImage(cat.id)}
                  className="w-full btn-primary rounded-xl px-4 py-3 text-sm font-semibold"
                >
                  📥 הורד תמונה (1080x1920)
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Instructions */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-3">📱 הוראות שימוש</h3>
          <ul className="space-y-2 text-white/80 text-sm">
            <li>• התמונות מותאמות לסטורי אינסטגרם (1080x1920 פיקסלים)</li>
            <li>• כל תמונה מציגה את 7 המועמדים המובילים ללא אחוזים</li>
            <li>• ניתן להוריד כל קטגוריה בנפרד או את כולן ביחד</li>
            <li>• התמונות מתעדכנות בזמן אמת עם הנתונים האחרונים</li>
            <li>• מומלץ לעדכן ולהוריד מחדש לפני כל פרסום</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
