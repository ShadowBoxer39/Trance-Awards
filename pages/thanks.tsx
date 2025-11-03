// pages/thanks.tsx
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React from "react";

/** ───────────────── BRAND ───────────────── */
const BRAND = {
  title: "פרסי השנה 2025",
  logo: "/images/logo.png",
  siteUrl: "https://trance-awards.vercel.app", // optional: set your final domain
};

/** ───────────────── DATA (same as awards page) ───────────────── */
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

/** ───────────────── UTIL ───────────────── */
function getChosen(selections: Record<string, string> | null) {
  if (!selections) return [];
  return CATEGORIES.map((cat) => {
    const id = selections[cat.id];
    const n = cat.nominees.find((x) => x.id === id);
    return { catTitle: cat.title, nomineeName: n?.name || "-", artwork: n?.artwork };
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // safe; our images are same-origin
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Builds a 1080×1350 PNG with brand bg + picks + artworks
 * and triggers a download. All client-side, free.
 */
async function buildAndDownloadShareImage(selections: Record<string, string>) {
  const W = 1080;
  const H = 1350; // Instagram portrait
  const padX = 64;
  const padY = 64;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.direction = "rtl";

  // Background (dark + glow)
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a0b10");
  bg.addColorStop(1, "#0b0b0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W * 0.8, H * 0.2, 50, W * 0.8, H * 0.2, 600);
  glow.addColorStop(0, "rgba(255,90,165,0.28)");
  glow.addColorStop(1, "rgba(255,90,165,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.2, 600, 0, Math.PI * 2);
  ctx.fill();

  const glow2 = ctx.createRadialGradient(W * 0.2, H * 0.15, 50, W * 0.2, H * 0.15, 500);
  glow2.addColorStop(0, "rgba(123,97,255,0.22)");
  glow2.addColorStop(1, "rgba(123,97,255,0)");
  ctx.fillStyle = glow2;
  ctx.beginPath();
  ctx.arc(W * 0.2, H * 0.15, 500, 0, Math.PI * 2);
  ctx.fill();

  // Logo
  try {
    const logo = await loadImage(BRAND.logo);
    const L = 140;
    ctx.save();
    roundRect(ctx, W - padX - L, padY, L, L, 28);
    ctx.clip();
    ctx.drawImage(logo, W - padX - L, padY, L, L);
    ctx.restore();
  } catch {}

  // Titles
  ctx.fillStyle = "#fff";
  ctx.textAlign = "right";
  ctx.font = "700 86px 'Gan CLM', 'Arial'";
  ctx.fillText("הצבעתי!", W - padX, 300);

  ctx.font = "700 60px 'Gan CLM', 'Arial'";
  ctx.fillText("פרסי השנה 2025", W - padX, 370);

  // Picks + artworks grid (2 cols x 3 rows for 6 categories)
  const chosen = getChosen(selections).filter((x) => x.nomineeName !== "-");
  const COLS = 2;
  const ROWS = 3;
  const cellW = (W - padX * 2 - 24) / COLS;
  const cellH = 220;
  let startY = 440;

  for (let i = 0; i < Math.min(chosen.length, COLS * ROWS); i++) {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const x = padX + col * (cellW + 24);
    const y = startY + row * (cellH + 18);

    // cell bg
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, x, y, cellW, cellH, 18);
    ctx.fill();

    // artwork (square)
    const artSize = 160;
    const artX = x + cellW - 16 - artSize; // right side
    const artY = y + 16;

    const artSrc = chosen[i].artwork;
    if (artSrc) {
      try {
        const img = await loadImage(artSrc);
        ctx.save();
        roundRect(ctx, artX, artY, artSize, artSize, 14);
        ctx.clip();
        ctx.drawImage(img, artX, artY, artSize, artSize);
        ctx.restore();
      } catch {
        // no-op on load error
      }
    } else {
      // placeholder
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      roundRect(ctx, artX, artY, artSize, artSize, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "400 22px 'Arial'";
      ctx.fillText("ללא תמונה", artX + artSize - 12, artY + artSize / 2 + 8);
    }

    // text block
    const textX = x + 18;
    const textW = artX - textX - 12; // space left of artwork

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "700 30px 'Gan CLM','Arial'";
    fitRtlText(ctx, chosen[i].catTitle, textX, y + 52, textW);

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "400 28px 'Gan CLM','Arial'";
    fitRtlText(ctx, chosen[i].nomineeName, textX, y + 96, textW);
  }

  // Footer
  ctx.font = "400 30px 'Gan CLM','Arial'";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("מגישים: יוצאים לטראק", W - padX, H - 100);

  ctx.font = "400 28px 'Gan CLM','Arial'";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(BRAND.siteUrl.replace(/^https?:\/\//, ""), W - padX, H - 56);

  // Download
  const data = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = data;
  a.download = "i-voted-trance-awards-2025.png";
  a.click();
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
  // simple one-line clamp with ellipsis from the right
  if (ctx.measureText(text).width <= maxWidth) {
    ctx.fillText(text, xRight + maxWidth, y, maxWidth);
    return;
  }
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + "…").width > maxWidth) {
    truncated = truncated.slice(1); // remove from start for RTL
  }
  ctx.fillText("…" + truncated, xRight + maxWidth, y, maxWidth);
}

/** ───────────────── PAGE ───────────────── */
export default function Thanks() {
  const [selections, setSelections] = React.useState<Record<string, string> | null>(null);

  React.useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
    try {
      const raw = sessionStorage.getItem("lastSelections");
      if (raw) setSelections(JSON.parse(raw));
    } catch {}
  }, []);

  const hasPicks =
    selections &&
    Object.keys(selections).length > 0 &&
    getChosen(selections).some((x) => x.nomineeName !== "-");

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
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src={BRAND.logo}
                alt="יוצאים לטראק"
                width={36}
                height={36}
                className="rounded-full border border-white/15"
                priority
              />
              <span className="text-sm opacity-80 hidden sm:inline">יוצאים לטראק</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <Image
                src={BRAND.logo}
                alt="לוגו יוצאים לטראק"
                width={80}
                height={80}
                className="rounded-2xl border border-white/15"
              />
            </div>
            <h1 className="gradient-title text-3xl sm:text-4xl font-[700] mb-3">
              תודה שהצבעת!
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8">
              הקול שלך נקלט. רוצים לשתף את הבחירות שלכם?
            </p>

            <div className="flex flex-col items-center gap-3">
              <Link href="/" className="btn-ghost rounded-2xl px-6 py-3 text-base">
                חזרה לדף הראשי
              </Link>

              {/* Share button */}
              <button
                className="btn-primary rounded-2xl px-6 py-3 text-base"
                onClick={() => {
                  if (!selections) return;
                  void buildAndDownloadShareImage(selections);
                }}
                disabled={!hasPicks}
              >
                הורד תמונת שיתוף (אינסטגרם 1080×1350)
              </button>

              {!hasPicks && (
                <div className="text-xs text-white/60">
                  (לא מצאנו את הבחירות מהדפדפן — נסו להצביע שוב או להשתמש באותו מכשיר/חלון)
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black/40">
          <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-white/60 text-center">
            © {new Date().getFullYear()} יוצאים לטראק — פרסי השנה.
          </div>
        </footer>
      </main>
    </>
  );
}
