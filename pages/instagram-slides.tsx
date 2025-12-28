// pages/instagram-slides.tsx
import React, { useRef, useState } from 'react';
import Head from 'next/head';
import html2canvas from 'html2canvas';

// Slide data
const slides = [
  { id: 1, title: 'Cover', component: Slide1Cover },
  { id: 2, title: 'אמנית השנה - Artmis', component: Slide2FemaleArtist },
  { id: 3, title: 'אמן השנה - Laughing Skull', component: Slide3Artist },
  { id: 4, title: 'הרכב השנה - Absolute Hypnotic', component: Slide4Group },
  { id: 5, title: 'אלבום השנה - Astral Projection', component: Slide5Album },
  { id: 6, title: 'טראק השנה - Extraterrestrial Lover', component: Slide6Track },
  { id: 7, title: 'פריצת השנה - Chaos604', component: Slide7Breakthrough },
  { id: 8, title: 'תודה!', component: Slide8ThankYou },
];

// Shared styles
const cornerStyle = (position: string): React.CSSProperties => {
  const base: React.CSSProperties = {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#D4AF37',
    borderStyle: 'solid',
    opacity: 0.3,
  };
  switch (position) {
    case 'tl': return { ...base, top: 40, left: 40, borderWidth: '2px 0 0 2px' };
    case 'tr': return { ...base, top: 40, right: 40, borderWidth: '2px 2px 0 0' };
    case 'bl': return { ...base, bottom: 40, left: 40, borderWidth: '0 0 2px 2px' };
    case 'br': return { ...base, bottom: 40, right: 40, borderWidth: '0 2px 2px 0' };
    default: return base;
  }
};

const Corners = () => (
  <>
    <div style={cornerStyle('tl')} />
    <div style={cornerStyle('tr')} />
    <div style={cornerStyle('bl')} />
    <div style={cornerStyle('br')} />
  </>
);

const PhotoGlow = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -60%)',
    width: 500,
    height: 500,
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  }} />
);

const Branding = () => (
  <div style={{
    position: 'absolute',
    bottom: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    zIndex: 10,
  }}>
    <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>
      נבחרי השנה בטראנס
    </div>
    <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3 }}>
      TRACKTRIP.CO.IL
    </div>
  </div>
);

const WinnerBadge = () => (
  <div style={{
    background: '#D4AF37',
    color: '#0a0a0a',
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: 8,
    padding: '18px 60px',
    borderRadius: 100,
    zIndex: 10,
  }}>
    WINNER
  </div>
);

// Slide 1 - Cover
function Slide1Cover() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(212, 175, 55, 0.05) 0%, transparent 50%)',
      }} />
      
      {/* Gold lines */}
      <div style={{ position: 'absolute', top: 80, left: 440, width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      <div style={{ position: 'absolute', bottom: 80, left: 440, width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '3px 0 0 3px', opacity: 0.4 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '3px 3px 0 0', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 3px 3px', opacity: 0.4 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 3px 3px 0', opacity: 0.4 }} />
      
      {/* Logos */}
      <div style={{ position: 'absolute', top: 180, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
        <img src="/images/logo.png" alt="Track Trip" style={{ width: 90, height: 90, borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: 300 }}>×</span>
        <img src="/images/musikroom.png" alt="Musikroom" style={{ width: 90, height: 90, borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover', background: 'white', padding: 10 }} />
      </div>
      
      {/* Trophy */}
      <div style={{ position: 'absolute', top: 320, left: 0, right: 0, textAlign: 'center', fontSize: 180 }}>🏆</div>
      
      {/* Title */}
      <div style={{ position: 'absolute', top: 540, left: 0, right: 0, textAlign: 'center', fontSize: 90, fontWeight: 900, color: '#D4AF37', lineHeight: 1.1 }}>
        נבחרי השנה<br />בטראנס
      </div>
      
      {/* Year */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontSize: 140, fontWeight: 900, color: 'white', letterSpacing: 20 }}>2025</div>
      
      {/* Vote count box */}
      <div style={{
        position: 'absolute',
        top: 980,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
        border: '2px solid rgba(212, 175, 55, 0.4)',
        borderRadius: 100,
        padding: '25px 60px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>
        <span style={{ fontSize: 40 }}>🗳️</span>
        <span style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>
          <span style={{ color: '#D4AF37' }}>22,105</span> הצבעות
        </span>
      </div>
      
      {/* Thank you text */}
      <div style={{ position: 'absolute', top: 1120, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.6)', fontWeight: 300, letterSpacing: 8 }}>
        תודה לכל מי שהשתתף
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', fontSize: 22, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
        TRACKTRIP.CO.IL
      </div>
    </div>
  );
}

// Slide 2 - Female Artist
function Slide2FemaleArtist() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 350,
        left: 290,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אמנית השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>FEMALE ARTIST OF THE YEAR</div>
      </div>
      
      {/* Photo ring */}
      <div style={{ position: 'absolute', top: 345, left: 335, width: 410, height: 410, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Photo */}
      <img src="/images/artmis.jpg" alt="Artmis" style={{ position: 'absolute', top: 360, left: 350, width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Name */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontSize: 100, fontWeight: 900, color: '#D4AF37', letterSpacing: 4 }}>Artmis</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 920,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1030, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>21.9%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 3 - Artist
function Slide3Artist() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 350,
        left: 290,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אמן השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>ARTIST OF THE YEAR</div>
      </div>
      
      {/* Photo ring */}
      <div style={{ position: 'absolute', top: 345, left: 335, width: 410, height: 410, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Photo */}
      <img src="/images/skull.jpeg" alt="Laughing Skull" style={{ position: 'absolute', top: 360, left: 350, width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Name */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontSize: 80, fontWeight: 900, color: '#D4AF37', letterSpacing: 2 }}>Laughing Skull</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 900,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1010, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>11.3%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 4 - Group
function Slide4Group() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 350,
        left: 290,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>הרכב השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>GROUP OF THE YEAR</div>
      </div>
      
      {/* Photo ring */}
      <div style={{ position: 'absolute', top: 345, left: 335, width: 410, height: 410, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Photo */}
      <img src="/images/absolute.jpg" alt="Absolute Hypnotic" style={{ position: 'absolute', top: 360, left: 350, width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Name */}
      <div style={{ position: 'absolute', top: 770, left: 0, right: 0, textAlign: 'center', fontSize: 68, fontWeight: 900, color: '#D4AF37', letterSpacing: 2, lineHeight: 1.1 }}>Absolute<br />Hypnotic</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 960,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1070, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>21.6%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 5 - Album
function Slide5Album() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 320,
        left: 265,
        width: 550,
        height: 550,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אלבום השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>ALBUM OF THE YEAR</div>
      </div>
      
      {/* Artwork ring */}
      <div style={{ position: 'absolute', top: 328, left: 328, width: 424, height: 424, borderRadius: 32, background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Artwork */}
      <img src="/images/astralforall.jpg" alt="For All Mankind" style={{ position: 'absolute', top: 340, left: 340, width: 400, height: 400, borderRadius: 24, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Album title */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontSize: 52, fontWeight: 900, color: '#D4AF37', letterSpacing: 2 }}>For All Mankind</div>
      
      {/* Artist name */}
      <div style={{ position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', fontSize: 36, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Astral Projection</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 950,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>17.2%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 6 - Track
function Slide6Track() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 320,
        left: 265,
        width: 550,
        height: 550,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>טראק השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>TRACK OF THE YEAR</div>
      </div>
      
      {/* Artwork ring */}
      <div style={{ position: 'absolute', top: 338, left: 338, width: 404, height: 404, borderRadius: 32, background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Artwork */}
      <img src="/images/highway.jpg" alt="Extraterrestrial Lover" style={{ position: 'absolute', top: 350, left: 350, width: 380, height: 380, borderRadius: 24, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Track title */}
      <div style={{ position: 'absolute', top: 770, left: 0, right: 0, textAlign: 'center', fontSize: 50, fontWeight: 900, color: '#D4AF37', letterSpacing: 1, lineHeight: 1.15 }}>Extraterrestrial<br />Lover</div>
      
      {/* Artist name */}
      <div style={{ position: 'absolute', top: 910, left: 0, right: 0, textAlign: 'center', fontSize: 34, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Laughing Skull</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 990,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1100, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>18.8%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 7 - Breakthrough
function Slide7Breakthrough() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 350,
        left: 290,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 50, height: 50, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Category */}
      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>פריצת השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>BREAKTHROUGH OF THE YEAR</div>
      </div>
      
      {/* Photo ring */}
      <div style={{ position: 'absolute', top: 345, left: 335, width: 410, height: 410, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
      
      {/* Photo */}
      <img src="/images/chaos.jpg" alt="Chaos604" style={{ position: 'absolute', top: 360, left: 350, width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)' }} />
      
      {/* Name */}
      <div style={{ position: 'absolute', top: 780, left: 0, right: 0, textAlign: 'center', fontSize: 100, fontWeight: 900, color: '#D4AF37', letterSpacing: 4 }}>Chaos604</div>
      
      {/* Winner badge */}
      <div style={{
        position: 'absolute',
        top: 920,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#D4AF37',
        color: '#0a0a0a',
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 8,
        padding: '18px 60px',
        borderRadius: 100,
      }}>WINNER</div>
      
      {/* Percentage */}
      <div style={{ position: 'absolute', top: 1030, left: 0, right: 0, textAlign: 'center', fontSize: 32, color: 'rgba(255,255,255,0.5)' }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>17.0%</span> מהקולות
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>נבחרי השנה בטראנס</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginTop: 10 }}>TRACKTRIP.CO.IL</div>
      </div>
    </div>
  );
}

// Slide 8 - Thank You
function Slide8ThankYou() {
  return (
    <div style={{
      width: 1080,
      height: 1440,
      background: '#0a0a0a',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(212, 175, 55, 0.04) 0%, transparent 50%)',
      }} />
      
      {/* Corners */}
      <div style={{ position: 'absolute', top: 40, left: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 0 0 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', top: 40, right: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '2px 2px 0 0', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 0 2px 2px', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: 40, right: 40, width: 60, height: 60, borderColor: '#D4AF37', borderStyle: 'solid', borderWidth: '0 2px 2px 0', opacity: 0.3 }} />
      
      {/* Gold line */}
      <div style={{ position: 'absolute', top: 120, left: 480, width: 120, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      
      {/* Heart */}
      <div style={{ position: 'absolute', top: 170, left: 0, right: 0, textAlign: 'center', fontSize: 100 }}>💛</div>
      
      {/* Title */}
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', fontSize: 80, fontWeight: 900, color: '#D4AF37' }}>תודה!</div>
      
      {/* Main message */}
      <div style={{ position: 'absolute', top: 420, left: 90, right: 90, textAlign: 'center', fontSize: 32, fontWeight: 400, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>
        אנחנו רוצים לומר תודה לכל מי שהצביע.<br />
        זה לא מובן מאליו בכלל <span style={{ color: '#D4AF37', fontWeight: 700 }}>כמה שהקהילה שלנו גדלה</span><br />
        ואנחנו שמחים לקחת חלק בזה.
      </div>
      
      {/* Divider */}
      <div style={{ position: 'absolute', top: 660, left: 440, width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)' }} />
      
      {/* Promise text */}
      <div style={{ position: 'absolute', top: 710, left: 140, right: 140, textAlign: 'center', fontSize: 28, fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
        הפרויקט הזה היה חלום שלנו<br />
        ולא האמנו שזה יתפוצץ ככה.<br /><br />
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>שנה הבאה זה יהיה הרבה יותר טוב</span> —<br />
        גם לא נפספס מועמדים (סליחה 🙏)<br />
        וגם נכריז על הזוכים בצורה הרבה יותר מגניבה
      </div>
      
      {/* Logos */}
      <div style={{ position: 'absolute', top: 1080, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 25 }}>
        <img src="/images/logo.png" alt="Track Trip" style={{ width: 70, height: 70, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)', objectFit: 'cover' }} />
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 24, fontWeight: 300 }}>×</span>
        <img src="/images/musikroom.png" alt="Musikroom" style={{ width: 70, height: 70, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)', objectFit: 'cover', background: 'white', padding: 8 }} />
      </div>
      
      {/* Branding */}
      <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>נתראה בשנה הבאה</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37', letterSpacing: 6, marginTop: 8 }}>2026</div>
      </div>
    </div>
  );
}

// Main Page Component
export default function InstagramSlidesPage() {
  const [downloading, setDownloading] = useState<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const downloadSlide = async (index: number) => {
    const slideElement = slideRefs.current[index];
    if (!slideElement) return;

    setDownloading(index);

    try {
      const canvas = await html2canvas(slideElement, {
        width: 1080,
        height: 1440,
        scale: 1,
        useCORS: true,
        backgroundColor: '#0a0a0a',
      });

      const link = document.createElement('a');
      link.download = `trance-awards-2025-slide-${index + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading slide:', error);
      alert('שגיאה בהורדה. נסה שוב.');
    }

    setDownloading(null);
  };

  const downloadAll = async () => {
    for (let i = 0; i < slides.length; i++) {
      await downloadSlide(i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <>
      <Head>
        <title>Instagram Slides - נבחרי השנה בטראנס 2025</title>
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        background: '#111', 
        padding: '40px 20px',
        fontFamily: 'Heebo, sans-serif',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ color: '#D4AF37', textAlign: 'center', fontSize: 36, marginBottom: 10 }}>
            Instagram Slides
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 30 }}>
            נבחרי השנה בטראנס 2025 • 1080×1440px
          </p>

          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <button
              onClick={downloadAll}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8960C)',
                color: '#0a0a0a',
                border: 'none',
                padding: '15px 40px',
                borderRadius: 50,
                fontSize: 18,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Heebo, sans-serif',
              }}
            >
              📥 הורד את כל הסליידים
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30 }}>
            {slides.map((slide, index) => (
              <div key={slide.id} style={{ background: '#1a1a1a', borderRadius: 16, padding: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ color: 'white', marginBottom: 15, fontWeight: 600 }}>
                  {slide.id}. {slide.title}
                </div>
                
                <div 
                  ref={el => { slideRefs.current[index] = el; }}
                  style={{ 
                    transform: 'scale(0.25)', 
                    transformOrigin: 'top left',
                    width: 1080,
                    height: 1440,
                    marginBottom: -1080,
                  }}
                >
                  <slide.component />
                </div>
                
                <div style={{ height: 360, marginBottom: 15 }} />
                
                <button
                  onClick={() => downloadSlide(index)}
                  disabled={downloading === index}
                  style={{
                    width: '100%',
                    background: downloading === index ? '#666' : '#D4AF37',
                    color: '#0a0a0a',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: downloading === index ? 'wait' : 'pointer',
                    fontFamily: 'Heebo, sans-serif',
                  }}
                >
                  {downloading === index ? '⏳ מוריד...' : '📥 הורד PNG'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
