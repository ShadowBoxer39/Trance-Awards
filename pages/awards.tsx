// pages/awards.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

/** ───────────────── BRAND ───────────────── */
const BRAND = {
  logo: "/logo.png",
  title: "פרסי השנה 2025",
};

/** ───────────────── TYPES ───────────────── */
export type Nominee = {
  id: string;
  name: string;
  artwork?: string;
  audioPreview?: string; // used only by 'best-track'
};
export type Category = {
  id: string;
  title: string;
  description?: string;
  nominees: Nominee[];
};

/** ─────────────── SMART-FIT ARTWORK ─────────────── */
function Artwork({ src, alt }: { src?: string; alt: string }) {
  const [isPortrait, setIsPortrait] = React.useState(false);
  return (
    <div className="relative w-full overflow-hidden rounded-t-xl bg-black/60 aspect-[1/1] sm:aspect-[4/3] md:aspect-[16/9]">
      {src ? (
        <img
          src={src}
          alt={alt}
          className={
            "absolute inset-0 h-full w-full object-center " +
            (isPortrait ? "object-contain" : "object-cover")
          }
          onLoad={(e) => {
            const img = e.currentTarget;
            setIsPortrait(img.naturalHeight >= img.naturalWidth);
          }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-white/50 text-xs">
          ללא תמונה
        </div>
      )}
    </div>
  );
}

/** ─────────────── GLOBAL AUDIO ─────────────── */
class GlobalAudio {
  private static _inst: GlobalAudio;
  private current?: HTMLAudioElement | null;
  private listeners = new Set<() => void>();
  static get inst() {
    if (!this._inst) this._inst = new GlobalAudio();
    return this._inst;
  }
  play(src: string) {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
    }
    const a = new Audio(src);
    a.play();
    this.current = a;
    a.addEventListener("ended", () => this.notify());
    this.notify();
  }
  stop() {
    if (!this.current) return;
    this.current.pause();
    this.current.currentTime = 0;
    this.current = null;
    this.notify();
  }
  isPlaying(src?: string) {
    return !!this.current && (!src || this.current.src.endsWith(src));
  }
  onChange(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

/** ─────────────── DATA ─────────────── */
const CATEGORIES: Category[] = [
  {
    id: "
