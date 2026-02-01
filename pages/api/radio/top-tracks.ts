// pages/api/radio/top-tracks.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const limit = parseInt(req.query.limit as string) || 5;

  try {
    const { data, error } = await supabase.rpc('get_top_tracks', { lim: limit });

    if (error) {
      console.error('Top tracks RPC error:', error);
      return res.status(200).json([]);
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data || []);
  } catch (err: any) {
    console.error('Top tracks error:', err);
    return res.status(200).json([]);
  }
}