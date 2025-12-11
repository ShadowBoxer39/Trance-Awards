// pages/lineup/create.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { GetServerSideProps } from "next";
import supabase from "../../lib/supabaseServer";

interface Artist {
  id: number;
  stage_name: string;
  photo_url: string;
  country_code: string | null;
  is_israeli: boolean;
}

interface Props {
  artists: Artist[];
}

type PartyType = "day" | "night" | null;

const TIME_SLOTS = {
  day: ["12:00", "14:00", "16:00", "18:00", "20:00", "22:00"],
  night: ["22:00", "00:00", "02:00", "04:00", "06:00", "08:00"],
};

// Get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Get image src (handles local vs URL)
function getImageSrc(photoUrl: string): string {
  if (photoUrl.startsWith("http")) return photoUrl;
  return photoUrl;
}

export default function CreateLineup({ artists }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [partyType, setPartyType] = useState<PartyType>(null);
  const [selectedArtists, setSelectedArtists] = useState<(Artist | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draggedArtist, setDraggedArtist] = useState<Artist | null>(null);
  const [showIsraeli, setShowIsraeli] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl");
  }, []);

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = artist.stage_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = showIsraeli ? artist.is_israeli : !artist.is_israeli;
    const notSelected = !selectedArtists.some((a) => a?.id === artist.id);
    return matchesSearch && matchesFilter && notSelected;
  });

  const selectedCount = selectedArtists.filter(Boolean).length;
  const canProceed = selectedCount === 6;

  const addArtist = (artist: Artist) => {
    const emptyIndex = selectedArtists.findIndex((a) => a === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedArtists];
      newSelected[emptyIndex] = artist;
      setSelectedArtists(newSelected);
    }
  };

  const removeArtist = (index: number) => {
    const newSelected = [...selectedArtists];
    newSelected[index] = null;
    setSelectedArtists(newSelected);
  };

  const handleDrop = (index: number, artist: Artist) => {
    const newSelected = [...selectedArtists];
    const existingIndex = selectedArtists.findIndex((a) => a?.id === artist.id);
    if (existingIndex !== -1 && existingIndex !== index) {
      newSelected[existingIndex] = newSelected[index];
    }
    newSelected[index] = artist;
    setSelectedArtists(newSelected);
    setDraggedArtist(null);
  };

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // ============================================
  // STUNNING IMAGE GENERATION
  // ============================================
  const generateImage = async () => {
    if (!canvasRef.current || !partyType) return;
    setIsGenerating(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const isNight = partyType === "night";
    const times = TIME_SLOTS[partyType];

    // ============================================
    // BACKGROUND - Rich nature gradients
    // ============================================
    if (isNight) {
      // Deep night sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#0a0a1a");
      gradient.addColorStop(0.3, "#1a1035");
      gradient.addColorStop(0.6, "#15202a");
      gradient.addColorStop(1, "#0d1520");
      ctx.fillStyle = gradient;
    } else {
      // Golden hour forest gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#1a1510");
      gradient.addColorStop(0.2, "#2d2218");
      gradient.addColorStop(0.5, "#1e2a1a");
      gradient.addColorStop(0.8, "#152015");
      gradient.addColorStop(1, "#0d150d");
      ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, W, H);

    // ============================================
    // ATMOSPHERIC ELEMENTS
    // ============================================
    if (isNight) {
      // Milky way effect
      const milkyWay = ctx.createLinearGradient(0, 0, W, H * 0.4);
      milkyWay.addColorStop(0, "rgba(100, 80, 150, 0)");
      milkyWay.addColorStop(0.5, "rgba(100, 80, 150, 0.1)");
      milkyWay.addColorStop(1, "rgba(100, 80, 150, 0)");
      ctx.fillStyle = milkyWay;
      ctx.fillRect(0, 0, W, H * 0.5);

      // Stars - multiple layers
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.6;
        const r = Math.random() * 1.5 + 0.5;
        const opacity = Math.random() * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright stars with glow
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.4;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 8);
        glow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        glow.addColorStop(0.5, "rgba(200, 200, 255, 0.3)");
        glow.addColorStop(1, "rgba(200, 200, 255, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - 10, y - 10, 20, 20);
      }

      // Moon with glow
      const moonX = W - 150;
      const moonY = 180;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 30, moonX, moonY, 120);
      moonGlow.addColorStop(0, "rgba(255, 250, 230, 0.3)");
      moonGlow.addColorStop(0.5, "rgba(200, 180, 255, 0.1)");
      moonGlow.addColorStop(1, "rgba(200, 180, 255, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 120, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = "#f5f0e0";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 45, 0, Math.PI * 2);
      ctx.fill();

      // Tree silhouettes at bottom
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      for (let i = 0; i < 8; i++) {
        const treeX = i * 150 + Math.random() * 50;
        const treeH = 150 + Math.random() * 100;
        ctx.beginPath();
        ctx.moveTo(treeX, H);
        ctx.lineTo(treeX + 30, H - treeH);
        ctx.lineTo(treeX + 60, H);
        ctx.fill();
      }

    } else {
      // Sun with rays
      const sunX = W - 120;
      const sunY = 140;
      
      ctx.save();
      ctx.translate(sunX, sunY);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        const rayGradient = ctx.createLinearGradient(0, 0, 200, 0);
        rayGradient.addColorStop(0, "rgba(255, 200, 100, 0.3)");
        rayGradient.addColorStop(1, "rgba(255, 200, 100, 0)");
        ctx.fillStyle = rayGradient;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(200, -2);
        ctx.lineTo(200, 2);
        ctx.lineTo(0, 8);
        ctx.fill();
      }
      ctx.restore();

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, 200);
      sunGlow.addColorStop(0, "rgba(255, 220, 150, 0.6)");
      sunGlow.addColorStop(0.3, "rgba(255, 180, 100, 0.2)");
      sunGlow.addColorStop(1, "rgba(255, 150, 50, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
      ctx.fill();

      // Sun
      ctx.fillStyle = "#ffe4b0";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
      ctx.fill();

      // Dust particles
      ctx.fillStyle = "rgba(255, 220, 150, 0.4)";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.5;
        const r = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Tree silhouettes
      ctx.fillStyle = "rgba(20, 40, 20, 0.3)";
      for (let i = 0; i < 6; i++) {
        const treeX = i * 200 + Math.random() * 80;
        const treeH = 200 + Math.random() * 150;
        ctx.beginPath();
        ctx.moveTo(treeX, H);
        ctx.lineTo(treeX + 40, H - treeH);
        ctx.lineTo(treeX + 80, H);
        ctx.fill();
      }
    }

    // ============================================
    // HEADER SECTION
    // ============================================
    
    // Top decorative line
    const lineGradient = ctx.createLinearGradient(100, 0, W - 100, 0);
    if (isNight) {
      lineGradient.addColorStop(0, "rgba(139, 92, 246, 0)");
      lineGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.8)");
      lineGradient.addColorStop(1, "rgba(139, 92, 246, 0)");
    } else {
      lineGradient.addColorStop(0, "rgba(251, 191, 36, 0)");
      lineGradient.addColorStop(0.5, "rgba(251, 191, 36, 0.8)");
      lineGradient.addColorStop(1, "rgba(251, 191, 36, 0)");
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 80);
    ctx.lineTo(W - 100, 80);
    ctx.stroke();

    // "יוצאים לטראק" branding - TOP
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "500 28px Arial, sans-serif";
    ctx.fillText("יוצאים לטראק", W / 2, 130);
    ctx.fillText("מגישים", W / 2, 160);

    // Main title with glow - HEBREW
    ctx.save();
    if (isNight) {
      ctx.shadowColor = "rgba(139, 92, 246, 0.5)";
    } else {
      ctx.shadowColor = "rgba(251, 191, 36, 0.5)";
    }
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 72px Arial, sans-serif";
    ctx.fillText("הלייאנפ", W / 2, 250);
    ctx.fillText("של החלומות", W / 2, 330);
    ctx.restore();

    // Creator name
    if (creatorName) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "500 40px Arial, sans-serif";
      ctx.fillText(`של ${creatorName}`, W / 2, 390);
    }

    // Party type badge - HEBREW
    const badgeY = creatorName ? 450 : 410;
    ctx.save();
    ctx.fillStyle = isNight ? "rgba(139, 92, 246, 0.2)" : "rgba(251, 191, 36, 0.2)";
    const badgeWidth = 300;
    ctx.beginPath();
    ctx.roundRect(W / 2 - badgeWidth / 2, badgeY - 30, badgeWidth, 50, 25);
    ctx.fill();
    ctx.strokeStyle = isNight ? "rgba(139, 92, 246, 0.5)" : "rgba(251, 191, 36, 0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "700 32px Arial, sans-serif";
    ctx.fillText(isNight ? "🌙  מסיבת לילה  🌙" : "☀️  מסיבת יום  ☀️", W / 2, badgeY + 5);
    ctx.restore();

    // ============================================
    // LINEUP CARDS
    // ============================================
    const startY = badgeY + 80;
    const cardHeight = 180;
    const cardGap = 16;
    const cardMargin = 50;
    const cardWidth = W - cardMargin * 2;

    for (let i = 0; i < 6; i++) {
      const artist = selectedArtists[i];
      const y = startY + i * (cardHeight + cardGap);

      // Card background
      const cardGradient = ctx.createLinearGradient(cardMargin, y, cardMargin + cardWidth, y);
      if (isNight) {
        cardGradient.addColorStop(0, "rgba(30, 20, 50, 0.8)");
        cardGradient.addColorStop(1, "rgba(20, 15, 35, 0.8)");
      } else {
        cardGradient.addColorStop(0, "rgba(40, 35, 25, 0.8)");
        cardGradient.addColorStop(1, "rgba(30, 40, 30, 0.8)");
      }
      ctx.fillStyle = cardGradient;
      ctx.beginPath();
      ctx.roundRect(cardMargin, y, cardWidth, cardHeight, 20);
      ctx.fill();

      // Card border
      ctx.strokeStyle = isNight ? "rgba(139, 92, 246, 0.3)" : "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Accent line
      ctx.fillStyle = isNight ? "#8b5cf6" : "#f59e0b";
      ctx.beginPath();
      ctx.roundRect(cardMargin, y, 6, cardHeight, [20, 0, 0, 20]);
      ctx.fill();

      // Time slot
      ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
      ctx.font = "900 56px monospace";
      ctx.textAlign = "left";
      ctx.fillText(times[i], cardMargin + 30, y + 70);

      // Separator
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(cardMargin + 200, y + 55, 4, 0, Math.PI * 2);
      ctx.fill();

      // Artist name with flag for international (flag AFTER name)
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 44px Arial, sans-serif";
      ctx.textAlign = "left";
      
      const artistName = artist?.stage_name || "—";
      ctx.fillText(artistName, cardMargin + 230, y + 70);
      
      // Flag AFTER artist name for international artists
      if (artist && !artist.is_israeli && artist.country_code) {
        const nameWidth = ctx.measureText(artistName).width;
        ctx.font = "48px Arial";
        const flag = getFlagEmoji(artist.country_code);
        ctx.fillText(flag, cardMargin + 245 + nameWidth, y + 72);
      }

      // Duration - Hebrew
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "400 24px Arial, sans-serif";
      ctx.fillText("סט של שעתיים", cardMargin + 230, y + 120);

      // Artist image
      if (artist) {
        const imgSize = 130;
        const imgX = cardMargin + cardWidth - imgSize - 25;
        const imgY = y + (cardHeight - imgSize) / 2;

        try {
          const img = await loadImage(getImageSrc(artist.photo_url));
          ctx.save();
          ctx.shadowColor = isNight ? "rgba(139, 92, 246, 0.5)" : "rgba(251, 191, 36, 0.5)";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
          ctx.clip();
          const scale = Math.max(imgSize / img.width, imgSize / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const drawX = imgX + (imgSize - w) / 2;
          const drawY = imgY + (imgSize - h) / 2;
          ctx.drawImage(img, drawX, drawY, w, h);
          ctx.restore();

          ctx.strokeStyle = isNight ? "#8b5cf6" : "#f59e0b";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath();
          ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ============================================
    // FOOTER
    // ============================================
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, H - 180);
    ctx.lineTo(W - 100, H - 180);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 32px Arial, sans-serif";
    ctx.fillText("🔥 צרו את הלייאנפ שלכם 🔥", W / 2, H - 130);

    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "700 40px Arial, sans-serif";
    ctx.fillText("tracktrip.co.il/lineup", W / 2, H - 75);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "400 24px Arial, sans-serif";
    ctx.fillText("יוצאים לטראק © 2025", W / 2, H - 30);

    setGeneratedImage(canvas.toDataURL("image/png"));
    setIsGenerating(false);
    setStep(3);
  };

  async function shareImage() {
    if (!generatedImage) return;
    try {
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const file = new File([blob], "dream-lineup.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch {}
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "dream-lineup.png";
    a.click();
  }

  return (
    <>
      <Head>
        <title>בנו את הלייאנפ | יוצאים לטראק</title>
      </Head>

      <div className="min-h-screen bg-[#0a0a1f] text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/lineup" className="flex items-center gap-2 text-white/70 hover:text-white">
              <span>→</span>
              <span className="text-sm">חזרה</span>
            </Link>
            <div className="text-sm font-medium">
              {step === 1 && "בחרו סוג מסיבה"}
              {step === 2 && `${selectedCount}/6 אמנים`}
              {step === 3 && "הלייאנפ מוכן!"}
            </div>
          </div>
        </header>

        {/* Step 1 */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-4">איזו מסיבה אתם בונים?</h1>
            <p className="text-center text-white/60 mb-12">הבחירה תשפיע על השעות והעיצוב</p>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => { setPartyType("day"); setStep(2); }}
                className="group relative overflow-hidden rounded-3xl border-2 border-amber-500/30 hover:border-amber-500/60 transition-all p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-green-900/20" />
                <div className="relative z-10">
                  <div className="text-6xl mb-4">☀️</div>
                  <h2 className="text-2xl font-bold mb-2">מסיבת יום</h2>
                  <p className="text-white/60 text-sm mb-4">12:00 - 22:00</p>
                  <p className="text-white/50 text-sm">שמש זורחת, יער, אבק זהוב</p>
                </div>
              </button>

              <button
                onClick={() => { setPartyType("night"); setStep(2); }}
                className="group relative overflow-hidden rounded-3xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />
                <div className="absolute inset-0 opacity-30">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
                  ))}
                </div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4">🌙</div>
                  <h2 className="text-2xl font-bold mb-2">מסיבת לילה</h2>
                  <p className="text-white/60 text-sm mb-4">22:00 - 08:00</p>
                  <p className="text-white/50 text-sm">כוכבים, ירח, לייזרים ביער</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && partyType && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Artist selection */}
              <div className="space-y-4">
                <div className="sticky top-20">
                  <input
                    type="text"
                    placeholder="🔍 חפשו אמן..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:outline-none text-lg mb-4"
                  />

                  {/* IMPROVED Filter tabs */}
                  <div className="flex gap-2 mb-4 p-1 bg-black/40 rounded-2xl border border-white/10">
                    <button
                      onClick={() => setShowIsraeli(true)}
                      className={`flex-1 px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                        showIsraeli
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xl">🇮🇱</span>
                      <span>ישראלים</span>
                      <span className="text-xs opacity-70">({artists.filter(a => a.is_israeli).length})</span>
                    </button>
                    <button
                      onClick={() => setShowIsraeli(false)}
                      className={`flex-1 px-4 py-3 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                        !showIsraeli
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xl">🌍</span>
                      <span>בינלאומיים</span>
                      <span className="text-xs opacity-70">({artists.filter(a => !a.is_israeli).length})</span>
                    </button>
                  </div>

                  {/* Disclaimer - shows on both tabs */}
                  <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm text-purple-300/80 text-center">
                    ✦ חלק מהאמנים כבר אינם איתנו, אבל המוזיקה שלהם חיה לנצח ✦
                  </div>

                  {/* Artist grid */}
                  <div className="h-[calc(100vh-340px)] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filteredArtists.map((artist) => (
                        <button
                          key={artist.id}
                          onClick={() => addArtist(artist)}
                          draggable
                          onDragStart={() => setDraggedArtist(artist)}
                          className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all"
                        >
                          <img src={getImageSrc(artist.photo_url)} alt={artist.stage_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <div className="text-xs font-medium text-white truncate">{artist.stage_name}</div>
                            {!artist.is_israeli && artist.country_code && (
                              <div className="text-xs opacity-70">{getFlagEmoji(artist.country_code)}</div>
                            )}
                          </div>
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm">+</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {filteredArtists.length === 0 && (
                      <div className="text-center text-white/40 py-8">לא נמצאו אמנים</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className={`rounded-2xl border-2 p-6 ${partyType === "night" ? "border-purple-500/30 bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-slate-950/50" : "border-amber-500/30 bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-green-900/10"}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">הלייאנפ שלכם</h2>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${partyType === "night" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                      {partyType === "night" ? "🌙 לילה" : "☀️ יום"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {TIME_SLOTS[partyType].map((time, index) => (
                      <div
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => draggedArtist && handleDrop(index, draggedArtist)}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 border-dashed transition-all ${selectedArtists[index] ? "border-transparent bg-black/30" : "border-white/20 bg-black/10 hover:border-white/40"}`}
                      >
                        <div className={`text-lg font-mono font-bold w-16 ${partyType === "night" ? "text-purple-400" : "text-amber-400"}`}>{time}</div>
                        {selectedArtists[index] ? (
                          <div className="flex items-center gap-3 flex-1">
                            <img src={getImageSrc(selectedArtists[index]!.photo_url)} alt={selectedArtists[index]!.stage_name} className="w-12 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <div className="font-medium">{selectedArtists[index]!.stage_name}</div>
                              {!selectedArtists[index]!.is_israeli && selectedArtists[index]!.country_code && (
                                <div className="text-sm opacity-60">{getFlagEmoji(selectedArtists[index]!.country_code!)}</div>
                              )}
                            </div>
                            <button onClick={() => removeArtist(index)} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex items-center justify-center">✕</button>
                          </div>
                        ) : (
                          <div className="flex-1 text-white/30 text-sm">גררו או לחצו על אמן</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="text-sm text-white/60 mb-2 block">השם שלכם (אופציונלי)</label>
                    <input
                      type="text"
                      placeholder="הכניסו שם..."
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={generateImage}
                    disabled={!canProceed || isGenerating}
                    className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${canProceed ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/30" : "bg-white/10 text-white/40 cursor-not-allowed"}`}
                  >
                    {isGenerating ? "🎨 מייצר..." : canProceed ? "צרו את התמונה 🎨" : `בחרו עוד ${6 - selectedCount} אמנים`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && generatedImage && (
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2">הלייאנפ מוכן!</h1>
              <p className="text-white/60">שתפו עם חברים ותייגו את האמנים</p>
            </div>

            <div className="rounded-2xl overflow-hidden border-2 border-purple-500/30 mb-6 shadow-2xl shadow-purple-500/20">
              <img src={generatedImage} alt="Dream Lineup" className="w-full" />
            </div>

            <div className="space-y-3">
              <button onClick={shareImage} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30">
                <span>שתפו עכשיו</span><span>📤</span>
              </button>
              <a href={generatedImage} download="dream-lineup.png" className="w-full py-4 bg-white/10 border border-white/20 rounded-xl font-medium flex items-center justify-center gap-2 block text-center">
                <span>שמרו תמונה</span><span>💾</span>
              </a>
              <button onClick={() => { setStep(2); setGeneratedImage(null); }} className="w-full py-3 text-white/60 hover:text-white transition">← ערכו את הלייאנפ</button>
            </div>

            <div className="mt-8 p-4 bg-white/5 rounded-xl text-center">
              <p className="text-sm text-white/70 mb-2">📸 תייגו אותנו ואת האמנים!</p>
              <p className="text-purple-400 font-medium">@track_trip.trance</p>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { data: artists, error } = await supabase
    .from("lineup_artists")
    .select("*")
    .order("stage_name", { ascending: true });

  if (error) {
    console.error("Failed to fetch artists:", error);
    return { props: { artists: [] } };
  }

  return { props: { artists: artists || [] } };
};
