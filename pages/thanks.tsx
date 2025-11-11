// pages/thanks.tsx
import Head from "next/head";
import Link from "next/link";
import React from "react";

import { CATEGORIES } from "@/data/awards-data";
type Category = (typeof CATEGORIES)[number];
type Nominee = Category["nominees"][number];

/** ───────── BRAND ───────── */
const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/images/logo.png",
  siteUrl: "https://trance-awards.vercel.app",
};

/** ───────── UTIL ───────── */
function getChosen(selections: Record<string, string> | null) {
  if (!selections) return [];
  return CATEGORIES.map((cat) => {
    const id = selections[cat.id];
    const n = cat.nominees.find((x) => x.id === id);
    return { catTitle: cat.title, nomineeName: n?.name || "-", artwork: n?.artwork };
  }).filter((x) => x.nomineeName !== "-");
}

/** draw rounded rect path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** cover-fit image (no stretching; crops like CSS object-fit: cover) */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.max(w / iw, h / ih);
  const nw = iw * scale;
  const nh = ih * scale;
  const dx = x + (w - nw) / 2;
  const dy = y + (h - nh) / 2;
  ctx.drawImage(img, dx, dy, nw, nh);
}

/** wrap text with max lines + ellipsis on last line (LTR or RTL) */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
) {
  const words = String(text ?? "").split(/\s+/);
  let line = "";
  let lines = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines++;

      if (lines >= maxLines - 1) {
        // ellipsize the tail
        let tail = words.slice(i).join(" ");
        while (ctx.measureText(`${tail}…`).width > maxWidth && tail.length > 0) {
          tail = tail.slice(0, -1);
        }
        ctx.fillText(`${tail}…`, x, y);
        return;
      }
      line = words[i];
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous"; // safe for local /images too
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildStoryImage(selections: Record<string, string>) {
  const SCALE = 2;
  const W = 1080 * SCALE;
  const H = 1920 * SCALE;
  const padX = 80 * SCALE;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  await document.fonts?.ready;

  // Dynamic gradient background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a0e2e");
  bg.addColorStop(0.5, "#16213e");
  bg.addColorStop(1, "#0f0f1e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Animated glow circles
  const glow1 = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, 800 * SCALE);
  glow1.addColorStop(0, "rgba(0, 255, 200, 0.3)");
  glow1.addColorStop(0.5, "rgba(0, 255, 200, 0.1)");
  glow1.addColorStop(1, "rgba(0, 255, 200, 0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.2, H * 0.85, 0, W * 0.2, H * 0.85, 700 * SCALE);
  glow2.addColorStop(0, "rgba(200, 100, 255, 0.3)");
  glow2.addColorStop(0.5, "rgba(200, 100, 255, 0.1)");
  glow2.addColorStop(1, "rgba(200, 100, 255, 0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Logo (top center)
  try {
    const logo = await loadImage(BRAND.logo);
    const logoSize = 180 * SCALE;
    const logoX = (W - logoSize) / 2;
    const logoY = 80 * SCALE;
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  } catch {}

  // Main title (Hebrew - RTL)
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  
  // "הצבעתי!"
  const gradient = ctx.createLinearGradient(0, 320 * SCALE, 0, 380 * SCALE);
  gradient.addColorStop(0, "#00ffcc");
  gradient.addColorStop(1, "#ff00ff");
  ctx.fillStyle = gradient;
  ctx.font = `900 ${140 * SCALE}px Arial`;
  ctx.fillText("הצבעתי!", W / 2, 360 * SCALE);

  // "נבחרי השנה בטראנס 2025"
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${60 * SCALE}px Arial`;
  ctx.fillText("נבחרי השנה בטראנס", W / 2, 450 * SCALE);
  
  ctx.fillStyle = "#00ffcc";
  ctx.font = `900 ${70 * SCALE}px Arial`;
  ctx.fillText("2025", W / 2, 530 * SCALE);
  ctx.restore();

  // Get selections
  const chosen = getChosen(selections);
  const COLS = 2;
  const CELL_W = (W - padX * 2 - 40 * SCALE) / COLS;
  const CELL_H = 240 * SCALE;
  const START_Y = 620 * SCALE;
  const GAP = 40 * SCALE;

  // Draw selection cards
  for (let i = 0; i < Math.min(chosen.length, 6); i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = padX + col * (CELL_W + GAP);
    const y = START_Y + row * (CELL_H + GAP);

    // Card background with glow
    ctx.save();
    ctx.shadowColor = "rgba(0, 255, 200, 0.4)";
    ctx.shadowBlur = 20 * SCALE;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    roundRect(ctx, x, y, CELL_W, CELL_H, 24 * SCALE);
    ctx.fill();
    ctx.restore();

    // Artwork (left side, square)
    const artSize = CELL_H - 36 * SCALE;
    const artX = x + 18 * SCALE;
    const artY = y + 18 * SCALE;

    if (chosen[i].artwork) {
      try {
        const img = await loadImage(chosen[i].artwork);
        ctx.save();
        roundRect(ctx, artX, artY, artSize, artSize, 16 * SCALE);
        ctx.clip();
        drawImageCover(ctx, img, artX, artY, artSize, artSize);
        ctx.restore();
      } catch {
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        roundRect(ctx, artX, artY, artSize, artSize, 16 * SCALE);
        ctx.fill();
      }
    }

    // Text area (right side)
    const textX = artX + artSize + 20 * SCALE;
    const textW = CELL_W - artSize - 56 * SCALE;

    // Category (Hebrew, RTL, smaller)
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "#00ffcc";
    ctx.font = `600 ${28 * SCALE}px Arial`;
    ctx.fillText(chosen[i].catTitle, textX + textW, y + 50 * SCALE);
    ctx.restore();

    // Nominee name (English, LTR, wrapped, bigger)
    ctx.save();
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 ${32 * SCALE}px Arial`;
    wrapText(ctx, chosen[i].nomineeName, textX, y + 100 * SCALE, textW, 38 * SCALE, 3);
    ctx.restore();
  }

  // Footer section
  const footerY = H - 200 * SCALE;
  
  // Call to action
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${40 * SCALE}px Arial`;
  ctx.fillText("בואו גם אתם להצביע!", W / 2, footerY);
  ctx.restore();

  // Brand name
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillStyle = "#00ffcc";
  ctx.font = `700 ${36 * SCALE}px Arial`;
  ctx.fillText("יוצאים לטראק", W / 2, footerY + 60 * SCALE);
  ctx.restore();

  // Website
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = `400 ${28 * SCALE}px Arial`;
  ctx.fillText("tracktrip.co.il", W / 2, footerY + 100 * SCALE);
  ctx.restore();

  return canvas.toDataURL("image/png");
}

/** Lightweight confetti (no dependencies) */
function burstConfetti() {
  const canvas = document.createElement("canvas");
  canvas.className = "pointer-events-none fixed inset-0 z-50";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d")!;
  document.body.appendChild(canvas);

  const COUNT = 160;
  const colors = ["#FF5AA5", "#7B61FF", "#FFD166", "#06D6A0", "#4ECDC4", "#ffffff"];
  const pieces = new Array(COUNT).fill(0).map(() => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * 80,
    r: 4 + Math.random() * 6,
    vx: -2 + Math.random() * 4,
    vy: 2 + Math.random() * 3,
    color: colors[(Math.random() * colors.length) | 0],
    tilt: Math.random() * Math.PI,
    spin: -0.2 + Math.random() * 0.4,
  }));

  let last = performance.now();
  const endAt = last + 1800;

  function tick(now: number) {
    const dt = Math.min(32, now - last);
    last = now;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.tilt += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    }
    if (now < endAt) requestAnimationFrame(tick);
    else document.body.removeChild(canvas);
  }
  requestAnimationFrame(tick);
}

/** ───────── PAGE ───────── */
export default function Thanks() {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [selections, setSelections] = React.useState<Record<string, string> | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    try {
      const raw = sessionStorage.getItem("lastSelections");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSelections(parsed);
        buildStoryImage(parsed)
          .then((url) => {
            setImgUrl(url);
            burstConfetti();
          })
          .catch(() => setImgUrl(null));
      }
    } catch {
      setImgUrl(null);
    }
  }, []);

  const caption =
    "הצבעתי בנבחרי השנה של יוצאים לטראק! 🎶 trance-awards.vercel.app";

  async function shareImage() {
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], "trance-awards-story.png", { type: "image/png" });

      // @ts-ignore - canShare typing varies
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({
          text: caption,
          files: [file],
          title: "Trance Awards 2025",
        });
        return;
      }
      // Fallback: download
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = "trance-awards-story.png";
      a.click();
      alert("שמרנו את התמונה. פתחו אותה ושיתפו ל-Instagram Story.");
    } catch {
      const a = document.createElement("a");
      a.href = imgUrl!;
      a.download = "trance-awards-story.png";
      a.click();
    }
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      alert("הטקסט הועתק ✓");
    } catch {}
  }

  return (
<>
  <Head>
    <title>🎉 הצבעת בנבחרי השנה! — יוצאים לטראק</title>
    <meta name="theme-color" content="#FF5AA5" />
    <meta name="description" content="הצבעתי בפרסי השנה של יוצאים לטראק! בואו גם אתם 🎶" />
    <meta property="og:title" content="הצבעתי בפרסי השנה בטראנס! 🎉" />
    <meta property="og:image" content={BRAND.logo} />
  </Head>

  <main className="min-h-screen neon-backdrop text-white relative overflow-hidden">
    {/* Animated background blobs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-20 right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-12">
      
      {/* Preview Card - MOVED TO TOP */}
      {imgUrl ? (
        <div className="mb-8 space-y-4">
          {/* Big celebration emoji at top */}
          <div className="text-center">
            <div className="text-6xl sm:text-7xl mb-3 animate-bounce">🎉</div>
            <h1 className="gradient-title text-3xl sm:text-4xl font-bold mb-2 leading-tight">
              תודה שהצבעת!
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-4">
              קולך נספר ✓
            </p>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-[320px] sm:max-w-[380px]">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 to-purple-500/30 blur-2xl rounded-[3rem]" />
            
            {/* Phone frame */}
            <div className="relative bg-black/40 backdrop-blur rounded-[2.5rem] p-3 border-2 border-white/20 shadow-2xl">
              <img
                src={imgUrl}
                alt="Instagram Story - הצבעתי!"
                className="w-full aspect-[9/16] object-cover rounded-[2rem]"
              />
            </div>

            {/* Floating Instagram icon */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-3 rounded-2xl shadow-xl animate-pulse">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
          </div>

          {/* CTA Text */}
          <div className="text-center">
            <p className="text-white/90 font-semibold text-lg mb-2">
              שתפו את הבחירות שלכם! 🚀
            </p>
            <p className="text-white/60 text-sm">
              עזרו לנו וליוצרים לקבל יותר חשיפה
            </p>
          </div>

          {/* Action Buttons - BIG and clear */}
          <div className="space-y-3">
            {/* Primary CTA */}
            <button 
              onClick={shareImage}
              className="w-full btn-primary rounded-2xl px-6 py-4 text-base font-bold flex items-center justify-center gap-2 transform hover:scale-105 transition-all shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              שתפו עכשיו לסטורי! 
            </button>

            {/* Secondary actions */}
            <div className="flex gap-2">
              <button
                onClick={copyCaption}
                className="flex-1 glass rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition"
              >
                📋 העתק טקסט
              </button>
              
              <a
                href={imgUrl}
                download="trance-awards-2025-story.png"
                className="flex-1 glass rounded-xl px-4 py-3 text-sm font-medium hover:bg-white/10 transition text-center"
              >
                💾 שמור תמונה
              </a>
            </div>
          </div>

          {/* Social proof */}
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-white/70 text-sm mb-2">
              💬 תייגו אותנו בסטורי:
            </p>
            <p className="text-white font-bold">
              @track_trip.trance
            </p>
          </div>

          {/* Bonus incentive */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-4 text-center">
            <p className="text-sm text-white/90">
              <span className="font-bold">נשתדל לשתף</span> כמה שיותר מהבחירות שלכם
            </p>
          </div>

          {/* Stats teaser - moved below share section */}
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-sm text-white/70 mb-1">תודה על שלקחת חלק</div>
            <div className="text-3xl font-bold gradient-title">בקהילת הטראנס</div>
          </div>
        </div>
      ) : (
        // Loading or error state
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl sm:text-7xl mb-3 animate-bounce">🎉</div>
            <h1 className="gradient-title text-3xl sm:text-4xl font-bold mb-2 leading-tight">
              תודה שהצבעת!
            </h1>
          </div>
          
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-white/70 mb-4">מכין את התמונה שלך...</p>
            <p className="text-white/50 text-sm">
              אם זה לוקח יותר מדי זמן, נסו לרענן את הדף
            </p>
          </div>
        </div>
      )}

      {/* Back button - less prominent */}
      <div className="text-center pt-6">
        <Link 
          href="/vote" 
          className="text-white/50 hover:text-white/80 text-sm transition inline-flex items-center gap-1"
        >
          ← חזרה לדף הבית
        </Link>
      </div>

      {/* Footer encouragement */}
      <div className="text-center pt-8 pb-4">
        <p className="text-white/40 text-xs">
          תודה שאתם חלק מקהילת הטראנס הישראלית! 🇮🇱🎶
        </p>
      </div>
    </div>
  </main>
</>
  );
}
