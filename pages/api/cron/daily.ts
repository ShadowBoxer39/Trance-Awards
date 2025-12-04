import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel Cron logic
  // Note: We use the internal URL or call the logic directly. 
  // For simplicity, we'll call the schedule API endpoint with the admin key.
  
  const adminKey = process.env.ADMIN_KEY;
  const host = process.env.NEXT_PUBLIC_URL || `https://${process.env.VERCEL_URL}` || 'http://localhost:3000';

  if (!adminKey) {
    return res.status(500).json({ error: 'Server misconfiguration: No ADMIN_KEY' });
  }

  try {
    // 1. Run Auto-Fill (Ensure we have future questions)
    await fetch(`${host}/api/quiz/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey, action: 'auto-fill' })
    });

    // 2. Run Activate-Today (Flip the switch if it's Monday or Thursday)
    const response = await fetch(`${host}/api/quiz/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: adminKey, action: 'activate-today' })
    });

    const data = await response.json();
    return res.status(200).json({ success: true, data });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
