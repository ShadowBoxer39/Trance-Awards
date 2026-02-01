// pages/api/radio/leaderboard.ts
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

  const limit = parseInt(req.query.limit as string) || 10;

  const { data, error } = await supabase
    .from('radio_listeners')
    .select('id, nickname, avatar_url, total_seconds')
    .order('total_seconds', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  return res.status(200).json(data);
}