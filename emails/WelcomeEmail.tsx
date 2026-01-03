import * as React from 'react';

export const WelcomeEmail = ({ artistName }: { artistName: string }) => (
  <div dir="rtl" style={{
    backgroundColor: '#0a0a12',
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '40px',
    textAlign: 'right',
  }}>
    <h1 style={{ color: '#c084fc' }}>ברוך הבא לסטודיו, {artistName}! 🎧</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
      אנחנו שמחים שהצטרפת למשפחת "יוצאים לטראק". הפרופיל שלך הוקם בהצלחה ועובר עכשיו סקירה של הצוות שלנו.
    </p>
    <div style={{ marginTop: '30px' }}>
      <a href="https://tracktrip.co.il/radio/dashboard" style={{
        backgroundColor: '#9333ea',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '12px',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'inline-block'
      }}>
        כניסה ללוח הבקרה
      </a>
    </div>
  </div>
);
