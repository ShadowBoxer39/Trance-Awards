// pages/api/results.ts - Admin voting results endpoint

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key } = req.query;

  // Validate admin key
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ ok: false, error: 'Unauthorized - Invalid admin key' });
  }

  try {
    // Return empty tally for now - you can add your voting logic here
    const tally = {};

    return res.status(200).json({
      ok: true,
      tally: tally,
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
