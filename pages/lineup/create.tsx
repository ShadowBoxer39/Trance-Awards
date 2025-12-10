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
  return photoUrl; // local paths like /images/...
}

export default function CreateLineup({ artists }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [partyType, setPartyType] = useState<PartyType>(null);
  const [selectedArtists, setSelectedArtists] = useState<(Artist | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
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

  // Filter artists
  const filteredArtists = artists.filter((artist) => {
    const matchesSearch = artist.stage_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = showIsraeli ? artist.is_israeli : !artist.is_israeli;
    const notSelected = !selectedArtists.some((a) => a?.id === artist.id);
    return matchesSearch && matchesFilter && notSelected;
  });

  const selectedCount = selectedArtists.filter(Boolean).length;
  const canProceed = selectedCount === 6;

  // Add artist to first empty slot
  const addArtist = (artist: Artist) => {
    const emptyIndex = selectedArtists.findIndex((a) => a === null);
    if (emptyIndex !== -1) {
      const newSelected = [...selectedArtists];
      newSelected[emptyIndex] = artist;
      setSelectedArtists(newSelected);
    }
  };

  // Remove artist from slot
  const removeArtist = (index: number) => {
    const newSelected = [...selectedArtists];
    newSelected[index] = null;
    setSelectedArtists(newSelected);
  };

  // Handle drop on slot
  const handleDrop = (index: number, artist: Artist) => {
    const newSelected = [...selectedArtists];
    // If artist is already in another slot, swap
    const existingIndex = selectedArtists.findIndex((a) => a?.id === artist.id);
    if (existingIndex !== -1 && existingIndex !== index) {
      newSelected[existingIndex] = newSelected[index];
    }
    newSelected[index] = artist;
    setSelectedArtists(newSelected);
    setDraggedArtist(null);
  };

  // Generate shareable image
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

    // Background gradient
    if (isNight) {
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#0f0f2e");
      gradient.addColorStop(0.5, "#1a1040");
      gradient.addColorStop(1, "#0a0a1f");
      ctx.fillStyle = gradient;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, H);
      gradient.addColorStop(0, "#4a3728");
      gradient.addColorStop(0.3, "#5c4a35");
      gradient.addColorStop(0.7, "#3d5a3d");
      gradient.addColorStop(1, "#2a4a2a");
      ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, W, H);

    // Add some atmosphere
    if (isNight) {
      // Stars
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H * 0.4;
        const r = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Moon
      ctx.fillStyle = "rgba(255,255,240,0.9)";
      ctx.beginPath();
      ctx.arc(W - 120, 150, 50, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Sun rays
      ctx.fillStyle = "rgba(255,200,100,0.1)";
      ctx.beginPath();
      ctx.arc(W - 100, 100, 200, 0, Math.PI * 2);
      ctx.fill();
    }

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Arial";
    ctx.fillText("DREAM LINEUP", W / 2, 180);

    // Creator name
    if (creatorName) {
      ctx.font = "36px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`by ${creatorName}`, W / 2, 240);
    }

    // Party type badge
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.fillText(isNight ? "🌙 NIGHT PARTY" : "☀️ DAY PARTY", W / 2, 310);

    // Load and draw artist images
    const startY = 380;
    const cardHeight = 220;
    const cardGap = 20;
    const cardWidth = W - 120;
    const imageSize = 180;

    for (let i = 0; i < 6; i++) {
      const artist = selectedArtists[i];
      const y = startY + i * (cardHeight + cardGap);

      // Card background
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.roundRect(60, y, cardWidth, cardHeight, 20);
      ctx.fill();

      // Time slot
      ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
      ctx.font = "bold 48px monospace";
      ctx.textAlign = "left";
      ctx.fillText(times[i], 100, y + 70);

      // Artist name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px Arial";
      ctx.fillText(artist?.stage_name || "???", 100, y + 130);

      // Flag for international
      if (artist && !artist.is_israeli && artist.country_code) {
        ctx.font = "36px Arial";
        ctx.fillText(getFlagEmoji(artist.country_code), 100, y + 180);
      }

      // Artist image
      if (artist) {
        try {
          const img = await loadImage(getImageSrc(artist.photo_url));
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardWidth - imageSize + 20, y + 20, imageSize - 40, cardHeight - 40, 16);
          ctx.clip();
          // Cover fit
          const scale = Math.max(
            (imageSize - 40) / img.width,
            (cardHeight - 40) / img.height
          );
          const w = img.width * scale;
          const h = img.height * scale;
          const x = cardWidth - imageSize + 20 + (imageSize - 40 - w) / 2;
          const yImg = y + 20 + (cardHeight - 40 - h) / 2;
          ctx.drawImage(img, x, yImg, w, h);
          ctx.restore();
        } catch (e) {
          // Draw placeholder
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.beginPath();
          ctx.roundRect(cardWidth - imageSize + 20, y + 20, imageSize - 40, cardHeight - 40, 16);
          ctx.fill();
        }
      }
    }

    // Footer
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "28px Arial";
    ctx.fillText("🔥 צרו את הלייאנפ שלכם", W / 2, H - 120);
    ctx.fillStyle = isNight ? "#a78bfa" : "#fbbf24";
    ctx.font = "bold 32px Arial";
    ctx.fillText("tracktrip.co.il/lineup", W / 2, H - 70);

    // Logo placeholder
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "24px Arial";
    ctx.fillText("יוצאים לטראק", W / 2, H - 30);

    setGeneratedImage(canvas.toDataURL("image/png"));
    setIsGenerating(false);
    setStep(3);
  };

  // Helper to load images
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Share function
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
    // Fallback: download
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

        {/* Step 1: Choose party type */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold text-center mb-4">
              איזו מסיבה אתם בונים?
            </h1>
            <p className="text-center text-white/60 mb-12">
              הבחירה תשפיע על השעות והעיצוב
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Day Party */}
              <button
                onClick={() => {
                  setPartyType("day");
                  setStep(2);
                }}
                className="group relative overflow-hidden rounded-3xl border-2 border-amber-500/30 hover:border-amber-500/60 transition-all p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-green-900/20 group-hover:opacity-80 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-6xl mb-4">☀️</div>
                  <h2 className="text-2xl font-bold mb-2">מסיבת יום</h2>
                  <p className="text-white/60 text-sm mb-4">12:00 - 22:00</p>
                  <p className="text-white/50 text-sm">
                    שמש זורחת, עצים, אבק זהוב
                  </p>
                </div>
              </button>

              {/* Night Party */}
              <button
                onClick={() => {
                  setPartyType("night");
                  setStep(2);
                }}
                className="group relative overflow-hidden rounded-3xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all p-8 text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 opacity-30">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="relative z-10">
                  <div className="text-6xl mb-4">🌙</div>
                  <h2 className="text-2xl font-bold mb-2">מסיבת לילה</h2>
                  <p className="text-white/60 text-sm mb-4">22:00 - 08:00</p>
                  <p className="text-white/50 text-sm">
                    כוכבים, ירח, לייזרים בין העצים
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Build lineup */}
        {step === 2 && partyType && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Artist selection */}
              <div className="space-y-4">
                <div className="sticky top-20">
                  {/* Search */}
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="חפשו אמן..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setShowIsraeli(true)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        showIsraeli
                          ? "bg-purple-500 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      🇮🇱 ישראלים
                    </button>
                    <button
                      onClick={() => setShowIsraeli(false)}
                      className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        !showIsraeli
                          ? "bg-purple-500 text-white"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      🌍 בינלאומיים
                    </button>
                  </div>

                  {/* Artist grid */}
                  <div className="h-[calc(100vh-300px)] overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {filteredArtists.map((artist) => (
                        <button
                          key={artist.id}
                          onClick={() => addArtist(artist)}
                          draggable
                          onDragStart={() => setDraggedArtist(artist)}
                          className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all"
                        >
                          <img
                            src={getImageSrc(artist.photo_url)}
                            alt={artist.stage_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <div className="text-xs font-medium text-white truncate">
                              {artist.stage_name}
                            </div>
                            {!artist.is_israeli && artist.country_code && (
                              <div className="text-xs opacity-70">
                                {getFlagEmoji(artist.country_code)}
                              </div>
                            )}
                          </div>
                          {/* Add indicator */}
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm">+</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {filteredArtists.length === 0 && (
                      <div className="text-center text-white/40 py-8">
                        לא נמצאו אמנים
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Timeline */}
              <div className="space-y-4">
                <div
                  className={`rounded-2xl border-2 p-6 ${
                    partyType === "night"
                      ? "border-purple-500/30 bg-gradient-to-br from-indigo-950/50 via-purple-950/50 to-slate-950/50"
                      : "border-amber-500/30 bg-gradient-to-br from-amber-900/30 via-orange-900/20 to-green-900/10"
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">הלייאנפ שלכם</h2>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        partyType === "night"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {partyType === "night" ? "🌙 לילה" : "☀️ יום"}
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="space-y-3">
                    {TIME_SLOTS[partyType].map((time, index) => (
                      <div
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => draggedArtist && handleDrop(index, draggedArtist)}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 border-dashed transition-all ${
                          selectedArtists[index]
                            ? "border-transparent bg-black/30"
                            : "border-white/20 bg-black/10 hover:border-white/40"
                        }`}
                      >
                        {/* Time */}
                        <div
                          className={`text-lg font-mono font-bold w-16 ${
                            partyType === "night" ? "text-purple-400" : "text-amber-400"
                          }`}
                        >
                          {time}
                        </div>

                        {/* Artist or placeholder */}
                        {selectedArtists[index] ? (
                          <div className="flex items-center gap-3 flex-1">
                            <img
                              src={getImageSrc(selectedArtists[index]!.photo_url)}
                              alt={selectedArtists[index]!.stage_name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <div className="font-medium">
                                {selectedArtists[index]!.stage_name}
                              </div>
                              {!selectedArtists[index]!.is_israeli &&
                                selectedArtists[index]!.country_code && (
                                  <div className="text-sm opacity-60">
                                    {getFlagEmoji(selectedArtists[index]!.country_code!)}
                                  </div>
                                )}
                            </div>
                            <button
                              onClick={() => removeArtist(index)}
                              className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition flex items-center justify-center"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1 text-white/30 text-sm">
                            גררו או לחצו על אמן
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Creator name */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <label className="text-sm text-white/60 mb-2 block">
                      השם שלכם (אופציונלי)
                    </label>
                    <input
                      type="text"
                      placeholder="הכניסו שם..."
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={generateImage}
                    disabled={!canProceed || isGenerating}
                    className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${
                      canProceed
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                  >
                    {isGenerating ? "מייצר..." : canProceed ? "צרו את התמונה 🎨" : `בחרו עוד ${6 - selectedCount} אמנים`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Preview & Share */}
        {step === 3 && generatedImage && (
          <div className="max-w-lg mx-auto px-4 py-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold mb-2">הלייאנפ מוכן!</h1>
              <p className="text-white/60">שתפו עם חברים ותייגו את האמנים</p>
            </div>

            {/* Preview */}
            <div className="rounded-2xl overflow-hidden border-2 border-purple-500/30 mb-6">
              <img src={generatedImage} alt="Your Dream Lineup" className="w-full" />
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={shareImage}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
              >
                <span>שתפו עכשיו</span>
                <span>📤</span>
              </button>

              <a
                href={generatedImage}
                download="dream-lineup.png"
                className="w-full py-4 bg-white/10 border border-white/20 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <span>שמרו תמונה</span>
                <span>💾</span>
              </a>

              <button
                onClick={() => {
                  setStep(2);
                  setGeneratedImage(null);
                }}
                className="w-full py-3 text-white/60 hover:text-white transition"
              >
                ← ערכו את הלייאנפ
              </button>
            </div>

            {/* Tag reminder */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl text-center">
              <p className="text-sm text-white/70 mb-2">
                📸 תייגו אותנו ואת האמנים!
              </p>
              <p className="text-purple-400 font-medium">@track_trip.trance</p>
            </div>
          </div>
        )}

        {/* Hidden canvas for image generation */}
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
