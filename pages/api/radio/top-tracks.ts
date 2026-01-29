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
    const { data, error } = await supabase
      .from('radio_track_likes')
      .select('track_name, artist_name');

    if (error) {
      console.error('Top tracks query error:', error);
      return res.status(200).json([]);
    }

    if (!data || data.length === 0) {
      return res.status(200).json([]);
    }

    // Count likes per track
    const likeCounts: Record<string, { track: string; artist: string; likes: number }> = {};
    
    data.forEach((row) => {
      const key = `${row.track_name}|||${row.artist_name}`;
      if (!likeCounts[key]) {
        likeCounts[key] = { track: row.track_name, artist: row.artist_name, likes: 0 };
      }
      likeCounts[key].likes++;
    });

    // Sort by likes and take top N
    const topTracks = Object.values(likeCounts)
      .sort((a, b) => b.likes - a.likes)
      .slice(0, limit);

    return res.status(200).json(topTracks);
  } catch (err: any) {
    console.error('Top tracks error:', err);
    return res.status(200).json([]);
  }
}