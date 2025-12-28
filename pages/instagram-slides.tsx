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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(212, 175, 55, 0.05) 0%, transparent 50%)',
      }} />
      
      <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', width: 200, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
      
      <div style={{ ...cornerStyle('tl'), width: 60, height: 60, borderWidth: '3px 0 0 3px', opacity: 0.4 }} />
      <div style={{ ...cornerStyle('tr'), width: 60, height: 60, borderWidth: '3px 3px 0 0', opacity: 0.4 }} />
      <div style={{ ...cornerStyle('bl'), width: 60, height: 60, borderWidth: '0 0 3px 3px', opacity: 0.4 }} />
      <div style={{ ...cornerStyle('br'), width: 60, height: 60, borderWidth: '0 3px 3px 0', opacity: 0.4 }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 60, zIndex: 10 }}>
        <img src="/images/logo.png" alt="Track Trip" style={{ width: 90, height: 90, borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover' }} />
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 32, fontWeight: 300 }}>×</span>
        <img src="/images/musikroom.png" alt="Musikroom" style={{ width: 90, height: 90, borderRadius: 20, border: '2px solid rgba(255,255,255,0.2)', objectFit: 'cover', background: 'white', padding: 10 }} />
      </div>
      
      <div style={{ fontSize: 180, marginBottom: 40, filter: 'drop-shadow(0 0 60px rgba(212, 175, 55, 0.5))', zIndex: 10 }}>🏆</div>
      
      <div style={{ fontSize: 90, fontWeight: 900, color: '#D4AF37', textAlign: 'center', lineHeight: 1.1, marginBottom: 20, zIndex: 10, textShadow: '0 0 80px rgba(212, 175, 55, 0.4)' }}>
        נבחרי השנה<br />בטראנס
      </div>
      
      <div style={{ fontSize: 140, fontWeight: 900, color: 'white', letterSpacing: 20, marginBottom: 60, zIndex: 10 }}>2025</div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05))',
        border: '2px solid rgba(212, 175, 55, 0.4)',
        borderRadius: 100,
        padding: '25px 60px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        zIndex: 10,
      }}>
        <span style={{ fontSize: 40 }}>🗳️</span>
        <span style={{ fontSize: 36, fontWeight: 700, color: 'white' }}>
          <span style={{ color: '#D4AF37' }}>22,105</span> הצבעות
        </span>
      </div>
      
      <div style={{ marginTop: 50, fontSize: 32, color: 'rgba(255,255,255,0.6)', fontWeight: 300, letterSpacing: 8, zIndex: 10 }}>
        תודה לכל מי שהשתתף
      </div>
      
      <div style={{ position: 'absolute', bottom: 100, fontSize: 22, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, zIndex: 10 }}>
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <PhotoGlow />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אמנית השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>FEMALE ARTIST OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/artmis.jpg" alt="Artmis" style={{ width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }} />
      </div>
      
      <div style={{ fontSize: 100, fontWeight: 900, color: '#D4AF37', margin: '30px 0 20px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 4 }}>Artmis</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 40, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>21.9%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <PhotoGlow />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אמן השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>ARTIST OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/skull.jpeg" alt="Laughing Skull" style={{ width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }} />
      </div>
      
      <div style={{ fontSize: 80, fontWeight: 900, color: '#D4AF37', margin: '30px 0 20px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 2, textAlign: 'center' }}>Laughing Skull</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 40, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>11.3%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <PhotoGlow />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>הרכב השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>GROUP OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/absolute.jpg" alt="Absolute Hypnotic" style={{ width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }} />
      </div>
      
      <div style={{ fontSize: 68, fontWeight: 900, color: '#D4AF37', margin: '30px 0 20px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 2, textAlign: 'center', lineHeight: 1.1 }}>Absolute<br />Hypnotic</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 40, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>21.6%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -55%)',
        width: 550,
        height: 550,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>אלבום השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>ALBUM OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -12, borderRadius: 32, background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/astralforall.jpg" alt="For All Mankind" style={{ width: 400, height: 400, borderRadius: 24, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
      </div>
      
      <div style={{ fontSize: 52, fontWeight: 900, color: '#D4AF37', margin: '25px 0 10px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 2, textAlign: 'center' }}>For All Mankind</div>
      <div style={{ fontSize: 36, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 25, zIndex: 10 }}>Astral Projection</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 35, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>17.2%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -55%)',
        width: 550,
        height: 550,
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>טראק השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>TRACK OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -12, borderRadius: 32, background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/highway.jpg" alt="Extraterrestrial Lover" style={{ width: 380, height: 380, borderRadius: 24, objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }} />
      </div>
      
      <div style={{ fontSize: 50, fontWeight: 900, color: '#D4AF37', margin: '25px 0 10px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 1, textAlign: 'center', lineHeight: 1.15 }}>Extraterrestrial<br />Lover</div>
      <div style={{ fontSize: 34, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: 25, zIndex: 10 }}>Laughing Skull</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 35, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>18.8%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 60,
    }}>
      <PhotoGlow />
      <Corners />
      
      <div style={{ marginBottom: 30, zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 28, color: '#D4AF37', letterSpacing: 12, fontWeight: 500, marginBottom: 15 }}>2025</div>
        <div style={{ fontSize: 56, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 4 }}>פריצת השנה</div>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', letterSpacing: 6, marginTop: 10, fontWeight: 300 }}>BREAKTHROUGH OF THE YEAR</div>
      </div>
      
      <div style={{ position: 'relative', margin: '40px 0', zIndex: 10 }}>
        <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.6), transparent 50%, rgba(212, 175, 55, 0.4))', opacity: 0.6 }} />
        <img src="/images/chaos.jpg" alt="Chaos604" style={{ width: 380, height: 380, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.2)', position: 'relative' }} />
      </div>
      
      <div style={{ fontSize: 100, fontWeight: 900, color: '#D4AF37', margin: '30px 0 20px', zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.4)', letterSpacing: 4, textAlign: 'center' }}>Chaos604</div>
      
      <WinnerBadge />
      
      <div style={{ marginTop: 40, fontSize: 32, color: 'rgba(255,255,255,0.5)', zIndex: 10 }}>
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>17.0%</span> מהקולות
      </div>
      
      <Branding />
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: 'Heebo, sans-serif',
      padding: 80,
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.06) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(212, 175, 55, 0.04) 0%, transparent 50%)',
      }} />
      <Corners />
      
      <div style={{ width: 120, height: 2, background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginBottom: 50, zIndex: 10 }} />
      
      <div style={{ fontSize: 100, marginBottom: 40, zIndex: 10, filter: 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.4))' }}>💛</div>
      
      <div style={{ fontSize: 80, fontWeight: 900, color: '#D4AF37', textAlign: 'center', marginBottom: 50, zIndex: 10, textShadow: '0 0 60px rgba(212, 175, 55, 0.3)' }}>תודה!</div>
      
      <div style={{ fontSize: 32, fontWeight: 400, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.7, maxWidth: 900, marginBottom: 50, zIndex: 10 }}>
        אנחנו רוצים לומר תודה לכל מי שהצביע.<br />
        זה לא מובן מאליו בכלל <span style={{ color: '#D4AF37', fontWeight: 700 }}>כמה שהקהילה שלנו גדלה</span><br />
        ואנחנו שמחים לקחת חלק בזה.
      </div>
      
      <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent)', margin: '40px 0', zIndex: 10 }} />
      
      <div style={{ fontSize: 28, fontWeight: 300, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.6, maxWidth: 800, zIndex: 10 }}>
        הפרויקט הזה היה חלום שלנו<br />
        ולא האמנו שזה יתפוצץ ככה.<br /><br />
        <span style={{ color: '#D4AF37', fontWeight: 700 }}>שנה הבאה זה יהיה הרבה יותר טוב</span> —<br />
        גם לא נפספס מועמדים (סליחה 🙏)<br />
        וגם נכריז על הזוכים בצורה הרבה יותר מגניבה
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 25, marginTop: 60, zIndex: 10 }}>
        <img src="/images/logo.png" alt="Track Trip" style={{ width: 70, height: 70, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)', objectFit: 'cover' }} />
        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 24, fontWeight: 300 }}>×</span>
        <img src="/images/musikroom.png" alt="Musikroom" style={{ width: 70, height: 70, borderRadius: 16, border: '2px solid rgba(255,255,255,0.15)', objectFit: 'cover', background: 'white', padding: 8 }} />
      </div>
      
      <div style={{ position: 'absolute', bottom: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10 }}>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>נתראה בשנה הבאה</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#D4AF37', letterSpacing: 6 }}>2026</div>
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
