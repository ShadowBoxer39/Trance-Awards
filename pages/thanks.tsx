// pages/thanks.tsx
import Head from "next/head";
import Link from "next/link";
import React from "react";

/** ───────── BRAND ───────── */
const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/images/logo.png",
  siteUrl: "https://trance-awards.vercel.app",
};

/** ───────── DATA (mirror categories used on awards page) ───────── */
type Nominee = { id: string; name: string; artwork?: string };
type Category = { id: string; title: string; nominees: Nominee[] };

const CATEGORIES: Category[] = [
  {
    id: "best-artist",
    title: "אמן השנה",
    nominees: [
      { id: "libra", name: "Libra" },
      { id: "gorovich", name: "Gorovich", artwork: "/images/Gorovich.webp" },
      { id: "freedom-fighters", name: "Freedom Fighters", artwork: "/images/Freedom Fighters.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/Mystic.jpg" },
      { id: "bliss", name: "Bliss", artwork: "/images/bliss.jpg" },
      { id: "cosmic-flow", name: "Cosmic Flow", artwork: "/images/cosmic flow.webp" },
    ],
  },
  {
    id: "best-female-artist",
    title: "אמנית השנה",
    nominees: [
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
      { id: "chuka", name: "Chuka", artwork: "/images/chuka.jpg" },
    ],
  },
  {
    id: "best-group",
    title: "הרכב השנה",
    nominees: [
      { id: "bigitam-detune", name: "Bigitam & Detune", artwork: "/images/bigitam & detune.png" },
      { id: "uncharted-territory", name: "Uncharted Territory", artwork: "/images/Uncharted Territory.webp" },
      { id: "humanoids", name: "Humanoids", artwork: "/images/Humanoids.jpg" },
      { id: "outsiders", name: "Outsiders", artwork: "/images/Outsiders.webp" },
      { id: "rising-dust", name: "Rising Dust", artwork: "/images/rising dust.jpg" },
    ],
  },
  {
    id: "best-album",
    title: "אלבום השנה",
    nominees: [
      { id: "libra-subjective", name: "Libra - Subjective", artwork: "/images/libra subjective album.jpg" },
      { id: "gorovich-creative", name: "Gorovich - Creative Acts", artwork: "/images/gorovich creative acts album.jpg" },
      { id: "bliss-me-vs-me", name: "Bliss - Me vs Me", artwork: "/images/bliss me vs me album.jpg" },
      { id: "cosmic-flow-infinity", name: "Cosmic Flow - Infinity", artwork: "/images/cosmic flow infinity album.jpg" },
      { id: "2minds-acid", name: "2Minds - Acid Therapy", artwork: "/images/2minds acid therapy album.jpg" },
    ],
  },
  {
    id: "best-track",
    title: "טראק השנה",
    nominees: [
      { id: "libra-subjective-track", name: "Libra - Subjective", artwork: "/images/libra subjective track.jpg" },
      { id: "mystic-reborn", name: "Mystic - Reborn", artwork: "/images/mystic - reborn.jpg" },
      { id: "2minds-nova", name: "2Minds - Nova", artwork: "/images/2minds nova track.jpg" },
      { id: "uncharted-brain-event", name: "Uncharted Territory - Brain Event", artwork: "/images/Uncharted Territory - brain event track.webp" },
      { id: "bigitam-dubel", name: "Bigitam & Detune - Dubel K", artwork: "/images/bigitam & detune dubel k track.jpg" },
      { id: "artmis-momentum", name: "Artmis - Momentum", artwork: "/images/artmis momentum track.jpg" },
      { id: "nevo-some1-guide", name: "Nevo & Some1 - Guide", artwork: "/images/nevo & some1 guide track.jpg" },
    ],
  },
  {
    id: "breakthrough",
    title: "פריצת השנה",
    nominees: [
      { id: "bigitam", name: "Bigitam", artwork: "/images/bigitam & detune.png" },
      { id: "mystic", name: "Mystic", artwork: "/images/Mystic.jpg" },
      { id: "artmis", name: "Artmis", artwork: "/images/artmis.jpg" },
      { id: "amigdala", name: "Amigdala", artwork: "/images/Amigdala.jpg" },
    ],
  },
];

/** ───────── UTIL ───────── */
function getChosen(selections: Record<string, string> | null) {
  if (!selections) return [];
  return CATEGORIES.map((cat) => {
    const id = selections[cat.id];
    const n = cat.nominees.find((x) => x.id === id);
    return { catTitle: cat.title, nomineeName: n?.name || "-", artwork: n?.artwork };
  }).filter((x) => x.nomineeName !== "-");
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitRtlText(ctx: CanvasRenderingContext2D, text: string, xRight: number, y: number, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) {
    ctx.fillText(text, xRight + maxWidth, y, maxWidth);
    return;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(1);
  }
  ctx.fillText("…" + truncated, xRight + maxWidth, y, maxWidth);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous"; // safe for same-origin /images
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Build a 1080×1920 IG Story PNG and return dataURL */
async function buildStoryImage(selections: Record<string, string>) {
  const W = 1080;
  const H = 1920; // Instagram Story
  const padX = 64;
  const padY = 64;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.direction = "rtl";

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#141320");
  bg.addColorStop(1, "#0a0b10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // neon glows
  const g1 = ctx.createRadialGradient(W * 0.85, H * 0.12, 60, W * 0.85, H * 0.12, 700);
  g1.addColorStop(0, "rgba(255,90,165,0.28)");
  g1.addColorStop(1, "rgba(255,90,165,0)");
  ctx.fillStyle = g1;
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.12, 700, 0, Math.PI * 2);
  ctx.fill();

  const g2 = ctx.createRadialGradient(W * 0.15, H * 0.18, 60, W * 0.15, H * 0.18, 650);
  g2.addColorStop(0, "rgba(123,97,255,0.22)");
  g2.addColorStop(1, "rgba(123,97,255,0)");
  ctx.fillStyle = g2;
  ctx.beginPath();
  ctx.arc(W * 0.15, H * 0.18, 650, 0, Math.PI * 2);
  ctx.fill();

  // Logo (top-right)
  try {
    const logo = await loadImage(BRAND.logo);
    const L = 140;
    ctx.save();
    roundRect(ctx, W - padX - L, padY, L, L, 28);
    ctx.clip();
    ctx.drawImage(logo, W - padX - L, padY, L, L);
    ctx.restore();
  } catch {}

  // Title & subtitle
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.font = "700 100px 'Arial'";
  ctx.fillText("הצבעתי!", W - padX, 360);

  ctx.font = "700 68px 'Arial'";
  ctx.fillText("פרסי השנה 2025", W - padX, 440);

  // Picks grid (2 cols × 3 rows)
  const chosen = getChosen(selections);
  const COLS = 2;
  const ROWS = 3;
  const cellW = (W - padX * 2 - 28) / COLS;
  const cellH = 260;
  let startY = 540;

  for (let i = 0; i < Math.min(chosen.length, COLS * ROWS); i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = padX + col * (cellW + 28);
    const y = startY + row * (cellH + 24);

    // panel
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    roundRect(ctx, x, y, cellW, cellH, 22);
    ctx.fill();

    // artwork (square, right side)
    const artSize = 180;
    const artX = x + cellW - 18 - artSize;
    const artY = y + 18;

    const artSrc = chosen[i].artwork;
    if (artSrc) {
      try {
        const img = await loadImage(artSrc);
        ctx.save();
        roundRect(ctx, artX, artY, artSize, artSize, 16);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artSize, artSize);
        ctx.restore();
      } catch {
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        roundRect(ctx, artX, artY, artSize, 16);
        ctx.fill();
      }
    }

    // text block
    const textX = x + 20;
    const textW = artX - textX - 12;

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "700 34px 'Arial'";
    fitRtlText(ctx, chosen[i].catTitle, textX, y + 66, textW);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "400 30px 'Arial'";
    fitRtlText(ctx, chosen[i].nomineeName, textX, y + 118, textW);
  }

  // Footer
  ctx.font = "400 32px 'Arial'";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText("מגישים: יוצאים לטראק", W - padX, H - 120);

  ctx.font = "400 28px 'Arial'";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(BRAND.siteUrl.replace(/^https?:\/\//, ""), W - padX, H - 70);

  return canvas.toDataURL("image/png");
}

/** Lightweight confetti (no dependencies) */
function burstConfetti(refEl: HTMLElement | null) {
  if (!refEl) return;
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

  let t0 = performance.now();
  function tick(t: number) {
    const dt = Math.min(32, t - t0);
    t0 = t;
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
    if (t - (performance.now() - 1800) < 1800) requestAnimationFrame(tick);
    else document.body.removeChild(canvas);
  }
  requestAnimationFrame(tick);
}

/** ───────── PAGE ───────── */
export default function Thanks() {
  const [imgUrl, setImgUrl] = React.useState<string | null>(null);
  const [selections, setSelections] = React.useState<Record<string, string> | null>(null);
  const cardRef = React.useRef<HTMLDivElement | null>(null);

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
            // celebrate 🎉
            burstConfetti(cardRef.current);
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

      // Web Share with files (Android Chrome, iOS 15+ Safari (some versions))
      // @ts-ignore
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({
          text: caption,
          files: [file],
          title: "Trance Awards 2025",
        });
        return;
      }
      // Fallback: direct download
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = "trance-awards-story.png";
      a.click();
      alert("שמרנו את התמונה. פתחו אותה ושיתפו ל-Instagram Story.");
    } catch {
      const a = document.createElement("a");
      a.href = imgUrl;
      a.download = "trance-awards-story.png";
      a.click();
    }
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(caption);
      alert("הטקסט הועתק ✓");
    } catch {
      // ignore
    }
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
          <div ref={cardRef} className="glass rounded-3xl p-6 md:p-8 text-center max-w-3xl mx-auto">
            <p className="text-white/80 mb-6">
              הכנו לך תמונת שיתוף מותאמת לסטורי (1080×1920). שתפו אותה ב-Instagram!
            </p>

            {imgUrl ? (
              <>
                {/* Pretty phone-frame preview */}
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
                  <button
                    className="btn-primary rounded-2xl px-5 py-2"
                    onClick={shareImage}
                  >
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
                  בטלפונים נתמכים לחיצה על “שתפו לסטורי” תפתח את חלון השיתוף עם התמונה.
                  אם לא נפתח שיתוף – שמרו את התמונה ושתפו אותה ידנית ל-Instagram Story.
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
