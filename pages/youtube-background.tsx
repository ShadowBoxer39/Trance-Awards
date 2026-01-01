// pages/youtube-background.tsx - YouTube Live Stream Background (1920x1080)
// Screenshot this page or use a tool to export as PNG
import { useEffect } from 'react';
import Head from 'next/head';
import { FaMusic, FaHeadphones, FaComment } from 'react-icons/fa';

export default function YouTubeBackground() {
  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  }, []);

  return (
    <>
      <Head>
        <title>YouTube Background - Track Trip Radio</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </Head>

      <div 
        className="relative overflow-hidden bg-black"
        style={{ 
          width: '1920px', 
          height: '1080px',
          fontFamily: 'Heebo, sans-serif',
        }}
      >
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 40%),
              radial-gradient(ellipse at 90% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 30%),
              linear-gradient(to bottom, #050814, #0a0a1f, #050814)
            `,
          }}
        />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? 'rgba(147, 51, 234, 0.6)' 
                : 'rgba(6, 182, 212, 0.6)',
              boxShadow: i % 2 === 0 
                ? '0 0 10px rgba(147, 51, 234, 0.8)' 
                : '0 0 10px rgba(6, 182, 212, 0.8)',
            }}
          />
        ))}

        {/* Large decorative circles */}
        <div 
          className="absolute rounded-full border border-purple-500/20"
          style={{
            width: '600px',
            height: '600px',
            top: '-200px',
            right: '-100px',
          }}
        />
        <div 
          className="absolute rounded-full border border-cyan-500/20"
          style={{
            width: '400px',
            height: '400px',
            bottom: '-100px',
            left: '-50px',
          }}
        />

        {/* Main content container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Logo area with glow */}
          <div className="relative mb-8">
            {/* Outer glow */}
            <div 
              className="absolute -inset-8 rounded-full blur-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.4), rgba(6, 182, 212, 0.4))',
              }}
            />
            
            {/* Logo circle */}
            <div 
              className="relative w-48 h-48 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #06b6d4)',
                boxShadow: '0 0 60px rgba(147, 51, 234, 0.5), 0 0 100px rgba(6, 182, 212, 0.3)',
              }}
            >
              <FaHeadphones className="text-8xl text-white" />
            </div>
          </div>

          {/* Main title */}
          <h1 
            className="text-7xl font-black mb-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #c084fc, #22d3ee, #c084fc)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(147, 51, 234, 0.5)',
            }}
          >
            הרדיו של יוצאים לטראק
          </h1>

          {/* Subtitle */}
          <p className="text-3xl text-gray-400 mb-12 tracking-wide">
            🎵 טראנס ישראלי 24/7 🎵
          </p>

          {/* Divider line */}
          <div 
            className="w-96 h-1 rounded-full mb-12"
            style={{
              background: 'linear-gradient(90deg, transparent, #9333ea, #06b6d4, transparent)',
            }}
          />

          {/* QR Code placeholder + Website */}
          <div className="flex items-center gap-12 mb-12">
            {/* QR Code box */}
            <div 
              className="w-40 h-40 rounded-2xl flex items-center justify-center border-2 border-purple-500/50"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)',
              }}
            >
              <div className="text-center text-gray-800">
                <div className="text-4xl mb-1">📱</div>
                <div className="text-xs font-bold">QR CODE</div>
                <div className="text-xs">HERE</div>
              </div>
            </div>

            {/* Website URL */}
            <div className="text-center">
              <p className="text-xl text-gray-500 mb-2">האזינו באתר:</p>
              <p 
                className="text-4xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #c084fc, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                tracktrip.co.il/radio
              </p>
            </div>
          </div>

          {/* Chat command box */}
          <div 
            className="flex items-center gap-4 px-8 py-5 rounded-2xl border border-cyan-500/30"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)',
            }}
          >
            <FaComment className="text-3xl text-cyan-400" />
            <div className="text-right">
              <p className="text-2xl text-white font-bold">
                כתבו <span className="text-cyan-400 font-mono">!np</span> בצ'אט
              </p>
              <p className="text-lg text-gray-400">לקבלת שם הטראק הנוכחי</p>
            </div>
          </div>

        </div>

        {/* Bottom artist showcase */}
        <div className="absolute bottom-0 left-0 right-0 py-8 px-12">
          <div 
            className="flex items-center justify-center gap-3 flex-wrap"
            style={{ opacity: 0.6 }}
          >
            <span className="text-gray-500 text-lg ml-4">אמנים ברדיו:</span>
            {['Skizologic', 'Detune', 'Kobi & Shayman', 'Bigitam', 'Laughing Skull', 'Artmis', 'Chaos604'].map((artist, i) => (
              <span 
                key={i}
                className="px-4 py-2 rounded-full text-sm border border-gray-700 text-gray-400"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {artist}
              </span>
            ))}
          </div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-bold text-xl tracking-wider">LIVE</span>
        </div>

        <div className="absolute top-8 right-8 text-gray-600 text-lg">
          youtube.com/@YotzimLaTrack
        </div>

      </div>
    </>
  );
}
