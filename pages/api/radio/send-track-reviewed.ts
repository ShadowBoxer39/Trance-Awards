// pages/api/radio/send-track-reviewed.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { resend, EMAIL_SENDER } from '@/lib/resend';

const createTrackApprovedEmailHTML = (artistName: string, trackName: string) => `
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
          
          <!-- Header with gradient accent - GREEN for approved -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px; text-align: center; border: 1px solid rgba(34, 197, 94, 0.2); border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
             <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">
  מזל טוב, ${artistName}!
</h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                הטראק שלך אושר לשידור 🔥
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="background: rgba(255,255,255,0.03); padding: 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none; border-bottom: none;">
              
              <!-- Track info box - GREEN theme -->
              <div style="background: rgba(34, 197, 94, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(34, 197, 94, 0.2);">
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                  ✅ אושר לשידור
                </p>
                <p style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 600;">
                  ${trackName}
                </p>
              </div>
              
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.8; margin: 0 0 24px; text-align: right;">
                יששש! הטראק שלך נכנס לרוטציה של רדיו יוצאים לטראק. מעכשיו המאזינים שלנו יוכלו ליהנות מהמוזיקה שלך 24/7!
              </p>
              
              <!-- What happens now section -->
              <div style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
                <h3 style="color: #22c55e; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  🎵 מה עכשיו?
                </h3>
                <ul style="color: #cbd5e1; font-size: 14px; line-height: 2; margin: 0; padding: 0 20px 0 0; list-style: none;">
                  <li style="margin-bottom: 8px;">📻 הטראק משודר ברדיו ברוטציה</li>
                   <li style="margin-bottom: 8px;">📺 עם קרדיט מלא וחשיפה לכל הקהל שלנו</li>
                  <li>📤 רוצה להעלות עוד? תמיד אפשר!</li>
                </ul>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 32px; text-align: right;">
                תודה שאתה חלק מהמשפחה. ביחד אנחנו בונים את הסצנה! 💜
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://tracktrip.co.il/radio" 
                       style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 24px rgba(34, 197, 94, 0.4);">
                      להאזנה לרדיו
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

const createTrackDeclinedEmailHTML = (artistName: string, trackName: string, reason?: string) => `
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
          
          <!-- Header - softer, encouraging tone -->
          <tr>
            <td style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(107, 114, 128, 0.15) 100%); border-radius: 24px 24px 0 0; padding: 40px 40px 30px; text-align: center; border: 1px solid rgba(255,255,255,0.1); border-bottom: none;">
              <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px; font-weight: 700;">
                ${artistName}, היי
              </h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0;">
                יש לנו עדכון לגבי הטראק שהגשת
              </p>
            </td>
          </tr>
          
          <!-- Main content -->
          <tr>
            <td style="background: rgba(255,255,255,0.03); padding: 40px; border: 1px solid rgba(255,255,255,0.1); border-top: none; border-bottom: none;">
              
              <!-- Track info box -->
              <div style="background: rgba(107, 114, 128, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(107, 114, 128, 0.2);">
                <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                  שם הטראק
                </p>
                <p style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 600;">
                  ${trackName}
                </p>
              </div>
              
              <p style="color: #e2e8f0; font-size: 16px; line-height: 1.8; margin: 0 0 24px; text-align: right;">
                הקשבנו לטראק, ולצערנו הפעם הוא לא מתאים לסגנון של הרדיו שלנו. אבל אל תתייאש - זה לא אומר שהמוזיקה שלך לא טובה!
              </p>
              
              ${reason ? `
              <!-- Reason box -->
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <h3 style="color: #c084fc; font-size: 14px; margin: 0 0 12px; font-weight: 600;">
                  💭 הערות מהצוות:
                </h3>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0;">
                  ${reason}
                </p>
              </div>
              ` : ''}
              
              <!-- Encouragement section -->
              <div style="background: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
                <h3 style="color: #c084fc; font-size: 16px; margin: 0 0 16px; font-weight: 600;">
                  💪 מה אפשר לעשות?
                </h3>
                <ul style="color: #cbd5e1; font-size: 14px; line-height: 2; margin: 0; padding: 0 20px 0 0; list-style: none;">
                  <li style="margin-bottom: 8px;">🎹 תמשיך ליצור ולהתפתח</li>
                  <li style="margin-bottom: 8px;">📤 אפשר להגיש טראקים נוספים בכל זמן</li>
                  <li>🎧 מוזמן להאזין לרדיו בשביל השראה</li>
                </ul>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin: 0 0 32px; text-align: right;">
                אנחנו פה בשבילך. יש שאלות? תמיד אפשר לפנות אלינו.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://tracktrip.co.il/radio/dashboard" 
                       style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #db2777 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; padding: 16px 40px; border-radius: 50px; box-shadow: 0 4px 24px rgba(147, 51, 234, 0.4);">
                      להגשת טראק נוסף
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

  const { email, artistName, trackName, status, reason } = req.body;

  // Validate inputs
  if (!email || !artistName || !trackName || !status) {
    console.error('❌ Missing required fields:', { email: !!email, artistName: !!artistName, trackName: !!trackName, status: !!status });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['approved', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "approved" or "declined"' });
  }

  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  console.log(`📧 Sending track ${status} email to:`, email);

  try {
    const isApproved = status === 'approved';
    
    const data = await resend.emails.send({
      from: EMAIL_SENDER,
      to: [email],
      subject: isApproved 
        ? `🎉 הטראק "${trackName}" אושר לשידור!`
        : `💬 עדכון לגבי הטראק "${trackName}"`,
      html: isApproved 
        ? createTrackApprovedEmailHTML(artistName, trackName)
        : createTrackDeclinedEmailHTML(artistName, trackName, reason),
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
