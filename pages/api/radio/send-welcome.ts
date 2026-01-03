// pages/api/radio/send-welcome.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { resend, EMAIL_SENDER } from '@/lib/resend';
import { WelcomeEmail } from '@/emails/WelcomeEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, name } = req.body;

  try {
    const data = await resend.emails.send({
      from: EMAIL_SENDER,
      to: [email],
      subject: 'ברוך הבא לסטודיו של יוצאים לטראק! 🎧',
      react: WelcomeEmail({ artistName: name }),
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
