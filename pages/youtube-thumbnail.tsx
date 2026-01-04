// pages/youtube-thumbnail.tsx - YouTube Stream Thumbnail (1280x720)
import { useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function YouTubeThumbnail() {
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  }, []);

  return (
    <>
      <Head>
        <title>YouTube Thumbnail - יוצאים לטראק</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </Head>

      <div 
        className="relative overflow-hidden flex items-center justify-center"
        style={{ 
          width: '1280px', 
          height: '720px',
          fontFamily: 'Rubik, sans-serif',
          background: '#0a0a12',
        }}
      >
        {/* Gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(147, 51, 234, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(192, 38, 211, 0.15) 0%, transparent 60%),
              linear-gradient(180deg, #0a0a12 0%, #12121f 50%, #0a0a12 100%)
            `,
          }}
        />

        {/* Decorative glowing orbs */}
        <div 
          className="absolute rounded-full blur-[80px]"
          style={{
            width: '400px',
            height: '400px',
            top: '-100px',
            right: '-50px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute rounded-full blur-[80px]"
          style={{
            width: '350px',
            height: '350px',
            bottom: '-80px',
            left: '-50px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(192, 38, 211, 1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(192, 38, 211, 1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          
          {/* Logo with glow */}
          <div className="relative mb-6">
            {/* Glow behind logo */}
            <div 
              className="absolute rounded-full blur-2xl"
              style={{
                width: '200px',
                height: '200px',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(192, 38, 211, 0.5) 0%, rgba(147, 51, 234, 0.3) 50%, transparent 70%)',
              }}
            />
            <Image
              src="/images/logo.png"
              alt="יוצאים לטראק"
              width={160}
              height={160}
              className="relative z-10 rounded-full"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(192, 38, 211, 0.6))',
              }}
            />
          </div>

          {/* Main title */}
          <h1 
            className="text-6xl font-black mb-3 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #c084fc, #e879f9, #f472b6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(192, 38, 211, 0.5))',
            }}
          >
            הרדיו של יוצאים לטראק
          </h1>

          {/* Subtitle */}
          <p 
            className="text-3xl font-bold mb-6 tracking-wide"
            style={{ color: '#a1a1aa' }}
          >
            🎵 טראנס ישראלי 24/7 🎵
          </p>

          {/* Website URL box */}
          <div 
            className="px-8 py-3 rounded-full border border-purple-500/40"
            style={{
              background: 'rgba(147, 51, 234, 0.15)',
              boxShadow: '0 0 30px rgba(192, 38, 211, 0.3)',
            }}
          >
            <p 
              className="text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              tracktrip.co.il/radio
            </p>
          </div>
        </div>

        {/* LIVE badge - top left */}
        <div 
          className="absolute top-6 left-6 flex items-center gap-3 px-5 py-2.5 rounded-full"
          style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)',
          }}
        >
          <div 
            className="w-4 h-4 rounded-full bg-red-500"
            style={{ boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)' }}
          />
          <span className="text-red-400 font-bold text-xl tracking-widest">LIVE</span>
        </div>

        {/* YouTube icon - top right */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <span className="text-gray-400 text-lg font-medium">@tracktripil</span>
          <div 
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ 
              background: 'rgba(255, 0, 0, 0.15)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
            }}
          >
            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>

        {/* Decorative bottom elements */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, transparent, #9333ea, #ec4899, transparent)',
            boxShadow: '0 0 20px rgba(192, 38, 211, 0.5)',
          }}
        />

      </div>
    </>
  );
}
