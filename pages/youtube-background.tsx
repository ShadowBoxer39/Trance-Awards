// pages/youtube-background.tsx - Animated YouTube Live Stream Background (1920x1080)
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FaComment } from 'react-icons/fa';

// Visualizer component
const Visualizer = () => {
  const [heights, setHeights] = useState<number[]>(Array(48).fill(20));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(Array(48).fill(0).map((_, i) => {
        const base = Math.sin(Date.now() / 400 + i * 0.25) * 35 + 50;
        const random = Math.random() * 25;
        return base + random;
      }));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-center gap-[3px] h-28">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-[6px] rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            background: `linear-gradient(to top, #9333ea, #c026d3, #ec4899)`,
            boxShadow: '0 0 12px rgba(192, 38, 211, 0.6)',
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
};

// Particle system - more subtle and elegant
const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1920;
    canvas.height = 1080;

    const particles: any[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        hue: 280 + Math.random() * 40, // Purple to pink range
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += 0.02;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const pulseAmount = Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (1 + pulseAmount * 0.3);
        const opacity = 0.2 + pulseAmount * 0.3;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 5
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${opacity})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 50%, ${opacity * 0.4})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, size * 5, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles with subtle lines
        particles.forEach((other, otherIndex) => {
          if (index === otherIndex) return;
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${particle.hue}, 100%, 60%, ${(1 - distance / 120) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ opacity: 0.7 }}
    />
  );
};

// Pulsing ring component
const PulsingRing = ({ delay = 0, size = 350 }: { delay?: number; size?: number }) => {
  return (
    <div 
      className="absolute rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '1px solid rgba(192, 38, 211, 0.3)',
        boxShadow: '0 0 20px rgba(192, 38, 211, 0.2)',
        animation: `pulseRing 5s ease-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

export default function YouTubeBackground() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('dir', 'rtl');
    
    const interval = setInterval(() => {
      setTime(t => t + 1);
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  // Slow animated gradient positions
  const gradientX1 = 25 + Math.sin(time / 150) * 15;
  const gradientY1 = 20 + Math.cos(time / 120) * 10;
  const gradientX2 = 75 + Math.cos(time / 150) * 15;
  const gradientY2 = 80 + Math.sin(time / 120) * 10;

  return (
    <>
      <Head>
        <title>רדיו יוצאים לטראק - LIVE</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.8);
              opacity: 0.6;
            }
            100% {
              transform: scale(2.2);
              opacity: 0;
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-12px); }
          }

          @keyframes logoGlow {
            0%, 100% { 
              filter: drop-shadow(0 0 30px rgba(192, 38, 211, 0.6)) drop-shadow(0 0 60px rgba(147, 51, 234, 0.4));
            }
            50% { 
              filter: drop-shadow(0 0 40px rgba(236, 72, 153, 0.7)) drop-shadow(0 0 80px rgba(192, 38, 211, 0.5));
            }
          }

          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          @keyframes livePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }

          @keyframes borderGlow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(192, 38, 211, 0.3), inset 0 0 20px rgba(192, 38, 211, 0.1);
            }
            50% { 
              box-shadow: 0 0 30px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.15);
            }
          }
        `}</style>
      </Head>

      <div 
        className="relative overflow-hidden"
        style={{ 
          width: '1920px', 
          height: '1080px',
          fontFamily: 'Rubik, sans-serif',
          background: '#0a0a12',
        }}
      >
        {/* Deep dark animated gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at ${gradientX1}% ${gradientY1}%, rgba(147, 51, 234, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at ${gradientX2}% ${gradientY2}%, rgba(192, 38, 211, 0.1) 0%, transparent 45%),
              radial-gradient(ellipse at 50% 120%, rgba(236, 72, 153, 0.08) 0%, transparent 40%),
              linear-gradient(180deg, #050508 0%, #0a0a12 50%, #080810 100%)
            `,
          }}
        />

        {/* Particles canvas */}
        <Particles />

        {/* Subtle grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(192, 38, 211, 0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(192, 38, 211, 0.8) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Large decorative glowing orbs */}
        <div 
          className="absolute rounded-full blur-[100px]"
          style={{
            width: '600px',
            height: '600px',
            top: '-200px',
            right: '-100px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute rounded-full blur-[100px]"
          style={{
            width: '500px',
            height: '500px',
            bottom: '-150px',
            left: '-100px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          }}
        />

        {/* Main content container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Logo area with pulsing rings */}
          <div 
            className="relative mb-8 flex items-center justify-center"
            style={{ animation: 'float 7s ease-in-out infinite' }}
          >
            {/* Pulsing rings */}
            <PulsingRing delay={0} size={300} />
            <PulsingRing delay={1.6} size={300} />
            <PulsingRing delay={3.2} size={300} />
            
            {/* Logo glow backdrop */}
            <div 
              className="absolute rounded-full blur-2xl"
              style={{
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(192, 38, 211, 0.4) 0%, rgba(147, 51, 234, 0.2) 50%, transparent 70%)',
              }}
            />
            
            {/* Actual Logo */}
            <div 
              className="relative z-10"
              style={{ animation: 'logoGlow 4s ease-in-out infinite' }}
            >
              <Image
                src="/images/logo.png"
                alt="יוצאים לטראק"
                width={180}
                height={180}
                className="rounded-full"
              />
            </div>
          </div>

          {/* Main title */}
          <h1 
            className="text-7xl font-black mb-4 text-center tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #c084fc, #e879f9, #f472b6, #c084fc)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 5s linear infinite',
              textShadow: '0 0 60px rgba(192, 38, 211, 0.5)',
            }}
          >
            הרדיו של יוצאים לטראק
          </h1>

          {/* Subtitle */}
          <p className="text-3xl text-gray-400 mb-10 tracking-wide font-medium">
            🎵 טראנס ישראלי 24/7 🎵
          </p>

          {/* Visualizer */}
          <div className="mb-10">
            <Visualizer />
          </div>

          {/* Glowing divider */}
          <div 
            className="w-96 h-[2px] rounded-full mb-10"
            style={{
              background: 'linear-gradient(90deg, transparent, #9333ea, #c026d3, #ec4899, transparent)',
              boxShadow: '0 0 20px rgba(192, 38, 211, 0.5)',
            }}
          />

          {/* Website URL - prominent */}
          <div 
            className="px-10 py-5 rounded-2xl mb-8 border border-purple-500/30"
            style={{
              background: 'rgba(147, 51, 234, 0.08)',
              animation: 'borderGlow 4s ease-in-out infinite',
            }}
          >
            <p className="text-lg text-gray-500 mb-2 text-center">האזינו באתר:</p>
            <p 
              className="text-4xl font-bold text-center"
              style={{
                background: 'linear-gradient(135deg, #c084fc, #e879f9, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              tracktrip.co.il/radio
            </p>
          </div>

          {/* Chat command box */}
          <div 
            className="flex items-center gap-5 px-8 py-5 rounded-2xl border border-fuchsia-500/20"
            style={{
              background: 'rgba(192, 38, 211, 0.06)',
            }}
          >
            <FaComment className="text-3xl text-fuchsia-400" />
            <div className="text-right">
              <p className="text-2xl text-white font-bold">
                כתבו <span className="text-fuchsia-400 font-mono bg-fuchsia-950/50 px-3 py-1 rounded-lg mx-2">!np</span> בצ'אט
              </p>
              <p className="text-lg text-gray-500">לקבלת שם הטראק הנוכחי</p>
            </div>
          </div>

        </div>

        {/* LIVE indicator - top left */}
        <div className="absolute top-8 left-8 flex items-center gap-4">
          <div 
            className="w-5 h-5 rounded-full bg-red-500"
            style={{ 
              animation: 'livePulse 1.5s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
            }}
          />
          <span className="text-red-400 font-bold text-2xl tracking-[0.3em]">LIVE</span>
        </div>

        {/* YouTube handle - top right */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <span className="text-gray-500 text-xl font-medium">@tracktripil</span>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255, 0, 0, 0.15)' }}
          >
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-600 text-lg tracking-wide">
            הבית של הטראנס הישראלי 🏠
          </p>
        </div>

      </div>
    </>
  );
}
