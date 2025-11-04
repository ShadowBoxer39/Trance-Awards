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

/** Build a crisp IG Story PNG (1080×1920, rendered at 2× for quality) */
async function buildStoryImage(selections: Record<string, string>) {
  // High-res export
  const SCALE = 2;
  const W = 1080 * SCALE;
  const H = 1920 * SCALE;
  const padX = 64 * SCALE;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  await document.fonts?.ready; // better glyph metrics

  // Background gradient + soft glows
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#141320");
  bg.addColorStop(1, "#0a0b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const g1 = ctx.createRadialGradient(W * 0.82, H * 0.10, 60 * SCALE, W * 0.82, H * 0.10, 700 * SCALE);
  g1.addColorStop(0, "rgba(255,90,165,0.28)");
  g1.addColorStop(1, "rgba(255,90,165,0)");
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.10, 700 * SCALE, 0, Math.PI * 2);
  ctx.fill();

  const g2 = ctx.createRadialGradient(W * 0.18, H * 0.16, 60 * SCALE, W * 0.18, H * 0.16, 650 * SCALE);
  g2.addColorStop(0, "rgba(123,97,255,0.22)");
  g2.addColorStop(1, "rgba(123,97,255,0)");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(W * 0.18, H * 0.16, 650 * SCALE, 0, Math.PI * 2);
  ctx.fill();

  // Logo (top-right)
  try {
    const logo = await loadImage(BRAND.logo);
    const L = 140 * SCALE;
    ctx.save();
    roundRect(ctx, W - padX - L, 64 * SCALE, L, L, 28 * SCALE);
    ctx.clip();
    drawImageCover(ctx, logo, W - padX - L, 64 * SCALE, L, L);
    ctx.restore();
  } catch {}

  // Title (Hebrew / RTL)
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = `700 ${100 * SCALE}px Arial`;
  ctx.fillText("הצבעתי!", W - padX, 360 * SCALE);

  ctx.font = `700 ${68 * SCALE}px Arial`;
  ctx.fillText("פרסי השנה בטראנס 2025", W - padX, 440 * SCALE);
  ctx.restore();

  // Picks grid
  const chosen = getChosen(selections);
  const COLS = 2;
  const ROWS = 3;
  const CELL_W = ((W - padX * 2) - 28 * SCALE) / COLS;
  const CELL_H = 260 * SCALE;
  const START_Y = 540 * SCALE;
  const GAP_X = 28 * SCALE;
  const GAP_Y = 24 * SCALE;

  for (let i = 0; i < Math.min(chosen.length, COLS * ROWS); i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = padX + col * (CELL_W + GAP_X);
    const y = START_Y + row * (CELL_H + GAP_Y);

    // panel
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    roundRect(ctx, x, y, CELL_W, CELL_H, 22 * SCALE);
    ctx.fill();

    // artwork (square, cover-fit; right side)
    const artSize = 180 * SCALE;
    const artX = x + CELL_W - 18 * SCALE - artSize;
    const artY = y + 18 * SCALE;

    const artSrc = chosen[i].artwork;
    if (artSrc) {
      try {
        const img = await loadImage(artSrc);
        ctx.save();
        roundRect(ctx, artX, artY, artSize, artSize, 16 * SCALE);
        ctx.clip();
        drawImageCover(ctx, img, artX, artY, artSize, artSize);
        ctx.restore();
      } catch {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, artX, artY, artSize, artSize, 16 * SCALE);
        ctx.fill();
      }
    }

    // text block
    const textX = x + 20 * SCALE;
    const textW = artX - textX - 12 * SCALE;

    // Hebrew category label (RTL)
    ctx.save();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = `700 ${34 * SCALE}px Arial`;
    ctx.fillText(chosen[i].catTitle, textX + textW, y + 66 * SCALE);
    ctx.restore();

    // English (or mixed) nominee name (LTR, wrapped)
    ctx.save();
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = `400 ${30 * SCALE}px Arial`;
    wrapText(ctx, chosen[i].nomineeName, textX, y + 114 * SCALE, textW, 34 * SCALE, 2);
    ctx.restore();
  }

  // Footer
  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.font = `400 ${32 * SCALE}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText("מגישים: יוצאים לטראק", W - padX, H - 120 * SCALE);

  ctx.font = `400 ${28 * SCALE}px Arial`;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(BRAND.siteUrl.replace(/^https?:\/\//, ""), W - padX, H - 70 * SCALE);
  ctx.restore();

  // export (downscale by browser when saving/sharing)
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
    "הצבעתי בפרסי השנה של יוצאים לטראק! 🎶 trance-awards.vercel.app";

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
        <title>תודה שהצבעת — יוצאים לטראק</title>
        <meta name="theme-color" content="#090a0f" />
        <meta name="description" content="תודה על ההצבעה לפרסי השנה של יוצאים לטראק" />
        <meta property="og:title" content="תודה שהצבעת — יוצאים לטראק" />
        <meta property="og:image" content={BRAND.logo} />
      </Head>

      <main className="min-h-screen neon-backdrop text-white">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <h1 className="text-2xl font-bold">תודה שהצבעת!</h1>
          </div>
        </header>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="glass rounded-3xl p-6 md:p-8 text-center max-w-3xl mx-auto">
            <p className="text-white/80 mb-6">
              הכנו לך תמונת שיתוף לסטורי. שתפו ותגו אותנו! 🎉
            </p>

            {imgUrl ? (
              <>
                {/* phone-like preview */}
                <div className="mx-auto w-full max-w-[420px]">
                  <div className="relative rounded-[2.2rem] border border-white/10 shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <img
                      src={imgUrl}
                      alt="Instagram Story — I Voted"
                      className="w-full aspect-[9/16] object-cover"
                      style={{ display: "block" }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                  <button className="btn-primary rounded-2xl px-5 py-2" onClick={shareImage}>
                    שתפו לסטורי
                  </button>
                  <a
                    className="btn-ghost rounded-2xl px-5 py-2"
                    href={imgUrl}
                    download="i-voted-trance-awards-2025-story.png"
                  >
                    שמור כתמונה
                  </a>
                  <button className="btn-ghost rounded-2xl px-5 py-2" onClick={copyCaption}>
                    העתק טקסט לשיתוף
                  </button>
                  <Link href="/" className="btn-ghost rounded-2xl px-5 py-2">
                    חזרה לדף הראשי
                  </Link>
                </div>

                <div className="text-xs text-white/60 mt-4 leading-relaxed">
                  אם “שתפו לסטורי” לא נפתח — שמרו את התמונה ושתפו ידנית ב-Instagram Story.
                </div>
              </>
            ) : (
              <>
                <div className="text-white/70">לא מצאנו את הבחירות להצגה.</div>
                <div className="text-white/60 text-sm mt-2">
                  נסו להצביע שוב או להשתמש באותו מכשיר/חלון.
                </div>
                <div className="mt-6">
                  <Link href="/" className="btn-ghost rounded-2xl px-5 py-2">
                    חזרה לדף הראשי
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
