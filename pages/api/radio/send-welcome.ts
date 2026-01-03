// pages/api/radio/send-welcome.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { resend, EMAIL_SENDER } from '@/lib/resend';

// Beautiful HTML email template
const createWelcomeEmailHTML = (artistName: string) => `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a12; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a12; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header with gradient accent -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎧</div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">
  ${artistName}, ברוך הבא למשפחה!
</h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                המשפחה של יוצאים לטראק גדלה 💜
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="background: rgba(255,255,255,0.03); padding: 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none; border-bottom: none;">
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.8; margin: 0 0 24px; text-align: right;">
                אנחנו שמחים שהצטרפת אלינו! הפרופיל שלך הוקם בהצלחה ועובר עכשיו סקירה קצרה של הצוות.
              </p>
              
              <!-- What's next section -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <h3 style="color: #c084fc; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  ✨ מה עכשיו?
                </h3>
                <ul style="color: #cbd5e1; font-size: 14px; line-height: 2; margin: 0; padding: 0 20px 0 0; list-style: none;">
                  <li style="margin-bottom: 8px;">📤 העלה את הטראק הראשון שלך</li>
                  <li style="margin-bottom: 8px;">⏳ נאזין ונחליט אם הוא מתאים לרדיו</li>
                  <li>🎵 במידה ויתאים הטראק שלך יכנס לרוטציה ברדיו!</li>
                </ul>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 32px; text-align: right;">
                יש לך שאלות? פשוט תגיב למייל הזה או שלח לנו הודעה באינסטגרם.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://tracktrip.co.il/radio/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #db2777 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 24px rgba(147, 51, 234, 0.4);">
                      כניסה לסטודיו שלי
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: rgba(0,0,0,0.3); border-radius: 0 0 24px 24px; padding: 30px 40px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-top: none;">
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0 0 12px;">
                יוצאים לטראק 🎧 הבית של הטראנס הישראלי
              </p>
              <div>
                <a href="https://www.instagram.com/track_trip.trance/" style="color: #c084fc; text-decoration: none; font-size: 12px; margin: 0 8px;">Instagram</a>
                <span style="color: rgba(255,255,255,0.2);">•</span>
                <a href="https://tracktrip.co.il/radio" style="color: #c084fc; text-decoration: none; font-size: 12px; margin: 0 8px;">Radio</a>
                <span style="color: rgba(255,255,255,0.2);">•</span>
                <a href="https://tracktrip.co.il" style="color: #c084fc; text-decoration: none; font-size: 12px; margin: 0 8px;">Website</a>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body;

  // Validate inputs
  if (!email || !name) {
    console.error('❌ Missing email or name:', { email: !!email, name: !!name });
    return res.status(400).json({ error: 'Missing email or name' });
  }

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  console.log('📧 Attempting to send welcome email to:', email);

  try {
    const data = await resend.emails.send({
      from: EMAIL_SENDER,
      to: [email],
      subject: '🎧 ברוך הבא למשפחת יוצאים לטראק!',
      html: createWelcomeEmailHTML(name),
    });

    console.log('✅ Email sent successfully:', data);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Resend error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error?.message || 'Unknown error',
      statusCode: error?.statusCode
    });
  }
}
