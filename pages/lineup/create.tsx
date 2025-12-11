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
  // FESTIVAL POSTER STYLE IMAGE GENERATION
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

    // Helper function to draw flags
    const drawFlag = (code: string, x: number, y: number, w: number, h: number) => {
      const c = code.toLowerCase();
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.clip();
      
      if (c === 'gb' || c === 'uk') {
        ctx.fillStyle = '#012169';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
        ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
        ctx.stroke();
        ctx.strokeStyle = '#C8102E';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w/2 - 4, y, 8, h);
        ctx.fillRect(x, y + h/2 - 3, w, 6);
        ctx.fillStyle = '#C8102E';
        ctx.fillRect(x + w/2 - 2, y, 4, h);
        ctx.fillRect(x, y + h/2 - 1.5, w, 3);
      } else if (c === 'de') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, w, h/3);
        ctx.fillStyle = '#DD0000';
        ctx.fillRect(x, y + h/3, w, h/3);
        ctx.fillStyle = '#FFCE00';
        ctx.fillRect(x, y + h*2/3, w, h/3);
      } else if (c === 'fr') {
        ctx.fillStyle = '#0055A4';
        ctx.fillRect(x, y, w/3, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w/3, y, w/3, h);
        ctx.fillStyle = '#EF4135';
        ctx.fillRect(x + w*2/3, y, w/3, h);
      } else if (c === 'nl') {
        ctx.fillStyle = '#AE1C28';
        ctx.fillRect(x, y, w, h/3);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y + h/3, w, h/3);
        ctx.fillStyle = '#21468B';
        ctx.fillRect(x, y + h*2/3, w, h/3);
      } else if (c === 'it') {
        ctx.fillStyle = '#009246';
        ctx.fillRect(x, y, w/3, h);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x + w/3, y, w/3, h);
        ctx.fillStyle = '#CE2B37';
        ctx.fillRect(x + w*2/3, y, w/3, h);
      } else if (c === 'se') {
        ctx.fillStyle = '#006AA7';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FECC00';
        ctx.fillRect(x + w*0.28, y, 6, h);
        ctx.fillRect(x, y + h/2 - 3, w, 6);
      } else if (c === 'jp') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#BC002D';
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, h/3, 0, Math.PI * 2);
        ctx.fill();
      } else if (c === 'us') {
        ctx.fillStyle = '#B22234';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#FFFFFF';
        for (let i = 1; i < 7; i += 2) {
          ctx.fillRect(x, y + (h/7)*i, w, h/7);
        }
        ctx.fillStyle = '#3C3B6E';
        ctx.fillRect(x, y, w*0.4, h*0.55);
      } else if (c === 'pl') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h/2);
        ctx.fillStyle = '#DC143C';
        ctx.fillRect(x, y + h/2, w, h/2);
      } else if (c === 'es') {
        ctx.fillStyle = '#AA151B';
        ctx.fillRect(x, y, w, h/4);
        ctx.fillStyle = '#F1BF00';
        ctx.fillRect(x, y + h/4, w, h/2);
        ctx.fillStyle = '#AA151B';
        ctx.fillRect(x, y + h*3/4, w, h/4);
      } else if (c === 'il') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#0038b8';
        ctx.fillRect(x, y + 2, w, 4);
        ctx.fillRect(x, y + h - 6, w, 4);
        // Star of David - simplified
        ctx.beginPath();
        const cx = x + w/2, cy = y + h/2, r = h/4;
        ctx.moveTo(cx, cy - r);
        ctx.lineTo(cx + r*0.866, cy + r/2);
        ctx.lineTo(cx - r*0.866, cy + r/2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy + r);
        ctx.lineTo(cx + r*0.866, cy - r/2);
        ctx.lineTo(cx - r*0.866, cy - r/2);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#555555';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(code.toUpperCase(), x + w/2, y + h/2 + 4);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 3);
      ctx.stroke();
    };

    // ============================================
    // RICH BACKGROUND
    // ============================================
    if (isNight) {
      // Deep cosmic purple/blue gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#0d0d2b");
      gradient.addColorStop(0.3, "#1a0a30");
      gradient.addColorStop(0.5, "#150825");
      gradient.addColorStop(0.7, "#0a1525");
      gradient.addColorStop(1, "#050510");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // Nebula effect
      const nebula1 = ctx.createRadialGradient(200, 400, 0, 200, 400, 400);
      nebula1.addColorStop(0, "rgba(138, 43, 226, 0.15)");
      nebula1.addColorStop(1, "rgba(138, 43, 226, 0)");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, W, H);

      const nebula2 = ctx.createRadialGradient(W - 150, 300, 0, W - 150, 300, 350);
      nebula2.addColorStop(0, "rgba(0, 150, 255, 0.1)");
      nebula2.addColorStop(1, "rgba(0, 150, 255, 0)");
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = Math.random() * 1.5 + 0.3;
        const opacity = Math.random() * 0.8 + 0.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bright stars with glow
      for (let i = 0; i < 15; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.6;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        glow.addColorStop(0.3, "rgba(200, 200, 255, 0.4)");
        glow.addColorStop(1, "rgba(200, 200, 255, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(x - 15, y - 15, 30, 30);
      }

      // Moon
      const moonX = W - 140;
      const moonY = 200;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 40, moonX, moonY, 150);
      moonGlow.addColorStop(0, "rgba(255, 250, 220, 0.4)");
      moonGlow.addColorStop(0.5, "rgba(200, 180, 255, 0.15)");
      moonGlow.addColorStop(1, "rgba(200, 180, 255, 0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f0e8d0";
      ctx.beginPath();
      ctx.arc(moonX, moonY, 55, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // Warm sunset/golden hour gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#1a0f05");
      gradient.addColorStop(0.15, "#3d1f0d");
      gradient.addColorStop(0.35, "#5c3a1d");
      gradient.addColorStop(0.5, "#4a5a30");
      gradient.addColorStop(0.7, "#2d4a25");
      gradient.addColorStop(1, "#1a2a15");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, W, H);

      // Sun with rays
      const sunX = W - 130;
      const sunY = 180;
      
      // Sun rays
      ctx.save();
      ctx.translate(sunX, sunY);
      for (let i = 0; i < 16; i++) {
        ctx.rotate(Math.PI / 8);
        const rayGradient = ctx.createLinearGradient(0, 0, 250, 0);
        rayGradient.addColorStop(0, "rgba(255, 180, 50, 0.4)");
        rayGradient.addColorStop(1, "rgba(255, 180, 50, 0)");
        ctx.fillStyle = rayGradient;
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(250, -1);
        ctx.lineTo(250, 1);
        ctx.lineTo(0, 6);
        ctx.fill();
      }
      ctx.restore();

      // Sun glow
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 200);
      sunGlow.addColorStop(0, "rgba(255, 200, 100, 0.7)");
      sunGlow.addColorStop(0.4, "rgba(255, 150, 50, 0.3)");
      sunGlow.addColorStop(1, "rgba(255, 100, 0, 0)");
      ctx.fillStyle = sunGlow;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
      ctx.fill();

      // Sun
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Dust/light particles
      ctx.fillStyle = "rgba(255, 200, 100, 0.5)";
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const r = Math.random() * 2.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tree/forest silhouette at bottom
    ctx.fillStyle = isNight ? "rgba(5, 5, 20, 0.7)" : "rgba(15, 25, 10, 0.6)";
    for (let i = 0; i < 12; i++) {
      const treeX = i * 100 + Math.random() * 40 - 20;
      const treeH = 120 + Math.random() * 80;
      const treeW = 40 + Math.random() * 30;
      ctx.beginPath();
      ctx.moveTo(treeX, H);
      ctx.lineTo(treeX + treeW/2, H - treeH);
      ctx.lineTo(treeX + treeW, H);
      ctx.fill();
    }

    // ============================================
    // HEADER - Festival Style
    // ============================================
    
    // Top branding - small
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "400 24px Arial, sans-serif";
    ctx.fillText("יוצאים לטראק מגישים", W / 2, 80);

    // Main title - BIG and stylized
    ctx.save();
    ctx.shadowColor = isNight ? "rgba(138, 43, 226, 0.8)" : "rgba(255, 150, 0, 0.8)";
    ctx.shadowBlur = 40;
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 90px Arial, sans-serif";
    ctx.fillText("DREAM", W / 2, 200);
    ctx.fillText("LINEUP", W / 2, 300);
    ctx.restore();

    // Creator name with style
    if (creatorName) {
      ctx.fillStyle = isNight ? "#c4b5fd" : "#fcd34d";
      ctx.font = "600 42px Arial, sans-serif";
      ctx.fillText(`✦ ${creatorName} ✦`, W / 2, 380);
    }

    // Party type badge
    const badgeY = creatorName ? 440 : 380;
    ctx.fillStyle = isNight ? "rgba(138, 43, 226, 0.3)" : "rgba(255, 150, 0, 0.3)";
    ctx.beginPath();
    ctx.roundRect(W/2 - 140, badgeY - 25, 280, 50, 25);
    ctx.fill();
    ctx.strokeStyle = isNight ? "rgba(167, 139, 250, 0.6)" : "rgba(251, 191, 36, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "700 28px Arial, sans-serif";
    ctx.fillText(isNight ? "🌙 מסיבת לילה 🌙" : "☀️ מסיבת יום ☀️", W / 2, badgeY + 8);

    // ============================================
    // LINEUP - Festival Poster Style (no times!)
    // ============================================
    const lineupStartY = badgeY + 100;
    
    // "LINE-UP" label
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "600 24px Arial, sans-serif";
    ctx.fillText("LINE-UP", W / 2, lineupStartY);

    // Decorative line
    ctx.strokeStyle = isNight ? "rgba(167, 139, 250, 0.4)" : "rgba(251, 191, 36, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2 - 200, lineupStartY + 15);
    ctx.lineTo(W/2 + 200, lineupStartY + 15);
    ctx.stroke();

    // Artist names - BIG, BOLD, Festival style
    const artists = selectedArtists.filter(a => a !== null) as Artist[];
    const artistStartY = lineupStartY + 80;
    const lineHeight = 140;

    for (let i = 0; i < artists.length; i++) {
      const artist = artists[i];
      const y = artistStartY + i * lineHeight;
      
      // Artist photo - circular, larger
      const imgSize = 100;
      const imgX = 80;
      const imgY = y - imgSize/2 + 10;
      
      if (artist) {
        try {
          const img = await loadImage(getImageSrc(artist.photo_url));
          
          // Glow behind
          ctx.save();
          ctx.shadowColor = isNight ? "rgba(138, 43, 226, 0.6)" : "rgba(255, 150, 0, 0.6)";
          ctx.shadowBlur = 20;
          ctx.fillStyle = isNight ? "#8b5cf6" : "#f59e0b";
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2 + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          // Photo
          ctx.save();
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
          ctx.clip();
          const scale = Math.max(imgSize / img.width, imgSize / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, imgX + (imgSize - w)/2, imgY + (imgSize - h)/2, w, h);
          ctx.restore();

          // Border
          ctx.strokeStyle = isNight ? "#a78bfa" : "#fbbf24";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2 + 1, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          // Placeholder
          ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
          ctx.beginPath();
          ctx.arc(imgX + imgSize/2, imgY + imgSize/2, imgSize/2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Artist name - BIG
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 52px Arial, sans-serif";
      
      const nameX = 200;
      ctx.fillText(artist.stage_name.toUpperCase(), nameX, y + 20);

      // Flag for international artists
      if (!artist.is_israeli && artist.country_code) {
        const nameWidth = ctx.measureText(artist.stage_name.toUpperCase()).width;
        drawFlag(artist.country_code, nameX + nameWidth + 15, y - 12, 48, 32);
      }
    }

    // ============================================
    // FOOTER
    // ============================================
    ctx.textAlign = "center";
    
    // CTA
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 28px Arial, sans-serif";
    ctx.fillText("צרו את הלייאנפ שלכם", W / 2, H - 180);

    // Website - prominent
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "800 36px Arial, sans-serif";
    ctx.fillText("tracktrip.co.il/lineup", W / 2, H - 130);

    // Branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "400 22px Arial, sans-serif";
    ctx.fillText("יוצאים לטראק © 2025", W / 2, H - 80);

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
