// pages/youtube-background.tsx - Animated YouTube Live Stream Background (1920x1080)
import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import { FaHeadphones, FaComment } from 'react-icons/fa';

// Visualizer component
const Visualizer = () => {
  const [heights, setHeights] = useState<number[]>(Array(40).fill(20));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(Array(40).fill(0).map((_, i) => {
        // Create wave-like pattern
        const base = Math.sin(Date.now() / 500 + i * 0.3) * 30 + 50;
        const random = Math.random() * 20;
        return base + random;
      }));
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-end justify-center gap-1 h-24">
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-2 rounded-full transition-all duration-75"
          style={{
            height: `${height}px`,
            background: `linear-gradient(to top, #9333ea, #06b6d4)`,
            boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)',
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
};

// Particle system
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
    const particleCount = 100;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        hue: Math.random() > 0.5 ? 280 : 190,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.pulse += 0.03;

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        const pulseAmount = Math.sin(particle.pulse) * 0.5 + 0.5;
        const size = particle.size * (1 + pulseAmount * 0.5);
        const opacity = 0.3 + pulseAmount * 0.4;

        // Draw glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 4
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${opacity})`);
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 100%, 50%, ${opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 50%, 0)`);
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        particles.forEach((other, otherIndex) => {
          if (index === otherIndex) return;
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${particle.hue}, 100%, 60%, ${(1 - distance / 150) * 0.15})`;
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
      style={{ opacity: 0.8 }}
    />
  );
};

// Pulsing ring component
const PulsingRing = ({ delay = 0 }: { delay?: number }) => {
  return (
    <div 
      className="absolute rounded-full border-2 border-purple-500/30"
      style={{
        width: '400px',
        height: '400px',
        animation: `pulseRing 4s ease-out infinite`,
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

  // Animated gradient position
  const gradientX1 = 20 + Math.sin(time / 100) * 10;
  const gradientY1 = 30 + Math.cos(time / 80) * 10;
  const gradientX2 = 80 + Math.cos(time / 100) * 10;
  const gradientY2 = 70 + Math.sin(time / 80) * 10;

  return (
    <>
      <Head>
        <title>YouTube Background - יוצאים לטראק</title>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            overflow: hidden;
          }

          @keyframes pulseRing {
            0% {
              transform: scale(0.8);
              opacity: 0.8;
            }
            100% {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }

          @keyframes glow {
            0%, 100% { 
              box-shadow: 0 0 40px rgba(147, 51, 234, 0.6), 0 0 80px rgba(147, 51, 234, 0.4);
            }
            50% { 
              box-shadow: 0 0 60px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.4);
            }
          }

          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }

          @keyframes livePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
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
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `
              radial-gradient(ellipse at ${gradientX1}% ${gradientY1}%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse at ${gradientX2}% ${gradientY2}%, rgba(6, 182, 212, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.2) 0%, transparent 40%),
              linear-gradient(to bottom, #050814, #0a0a1f, #050814)
            `,
          }}
        />

        {/* Particles canvas */}
        <Particles />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Large decorative circles */}
        <div 
          className="absolute rounded-full border border-purple-500/10"
          style={{
            width: '800px',
            height: '800px',
            top: '-300px',
            right: '-200px',
            animation: 'pulse 8s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute rounded-full border border-cyan-500/10"
          style={{
            width: '600px',
            height: '600px',
            bottom: '-200px',
            left: '-150px',
            animation: 'pulse 10s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />

        {/* Main content container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          
          {/* Logo area with pulsing rings */}
          <div 
            className="relative mb-6 flex items-center justify-center"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          >
            {/* Pulsing rings */}
            <PulsingRing delay={0} />
            <PulsingRing delay={1.3} />
            <PulsingRing delay={2.6} />
            
            {/* Outer glow */}
            <div 
              className="absolute rounded-full blur-3xl"
              style={{
                width: '300px',
                height: '300px',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.5), rgba(6, 182, 212, 0.5))',
                animation: 'pulse 3s ease-in-out infinite',
              }}
            />
            
            {/* Logo circle */}
            <div 
              className="relative w-44 h-44 rounded-full flex items-center justify-center z-10"
              style={{
                background: 'linear-gradient(135deg, #9333ea, #06b6d4)',
                animation: 'glow 3s ease-in-out infinite',
              }}
            >
              <FaHeadphones className="text-7xl text-white" />
            </div>
          </div>

          {/* Main title */}
          <h1 
            className="text-7xl font-black mb-3 text-center"
            style={{
              background: 'linear-gradient(90deg, #c084fc, #22d3ee, #f472b6, #c084fc)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            הרדיו של יוצאים לטראק
          </h1>

          {/* Subtitle */}
          <p className="text-3xl text-gray-400 mb-8 tracking-wide">
            🎵 טראנס ישראלי 24/7 🎵
          </p>

          {/* Visualizer */}
          <div className="mb-8">
            <Visualizer />
          </div>

          {/* Divider line */}
          <div 
            className="w-80 h-0.5 rounded-full mb-8"
            style={{
              background: 'linear-gradient(90deg, transparent, #9333ea, #06b6d4, transparent)',
            }}
          />

          {/* QR Code + Website row */}
          <div className="flex items-center gap-10 mb-8">
            {/* QR Code box */}
            <div 
              className="w-32 h-32 rounded-xl flex items-center justify-center border-2 border-purple-500/50"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 0 30px rgba(147, 51, 234, 0.4)',
              }}
            >
              <div className="text-center text-gray-800">
                <div className="text-3xl mb-1">📱</div>
                <div className="text-xs font-bold">QR CODE</div>
              </div>
            </div>

            {/* Website URL */}
            <div className="text-center">
              <p className="text-lg text-gray-500 mb-1">האזינו באתר:</p>
              <p 
                className="text-3xl font-bold"
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
            className="flex items-center gap-4 px-6 py-4 rounded-xl border border-cyan-500/30"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.2)',
            }}
          >
            <FaComment className="text-2xl text-cyan-400" />
            <div className="text-right">
              <p className="text-xl text-white font-bold">
                כתבו <span className="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded">!np</span> בצ'אט
              </p>
              <p className="text-base text-gray-400">לקבלת שם הטראק הנוכחי</p>
            </div>
          </div>

        </div>

        {/* Bottom artist showcase */}
        <div className="absolute bottom-0 left-0 right-0 py-6 px-12">
          <div className="flex items-center justify-center gap-3 flex-wrap opacity-60">
            <span className="text-gray-500 text-base ml-4">אמנים ברדיו:</span>
            {['Skizologic', 'Detune', 'Kobi & Shayman', 'Bigitam', 'Laughing Skull', 'Artmis', 'Chaos604'].map((artist, i) => (
              <span 
                key={i}
                className="px-3 py-1.5 rounded-full text-sm border border-gray-700/50 text-gray-400"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {artist}
              </span>
            ))}
          </div>
        </div>

        {/* LIVE indicator - top left */}
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full bg-red-500"
            style={{ animation: 'livePulse 1.5s ease-in-out infinite' }}
          />
          <span className="text-red-400 font-bold text-2xl tracking-widest">LIVE</span>
        </div>

        {/* YouTube handle - top right */}
        <div className="absolute top-6 right-6 text-gray-500 text-lg">
          youtube.com/@YotzimLaTrack
        </div>

      </div>
    </>
  );
}
