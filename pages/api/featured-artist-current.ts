// pages/api/featured-artist-current.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle GET - Fetch current featured artist
  if (req.method === 'GET') {
    try {
      const { key } = req.query;

      console.log('📋 Fetching current featured artist');

      // Validate admin key
      if (!key || key !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
        console.error('❌ Unauthorized: Invalid admin key');
        return res.status(401).json({ 
          ok: false,
          error: 'Unauthorized' 
        });
      }

      // Get the most recent featured artist
      const { data, error } = await supabase
        .from('featured_artists')
        .select('*')
        .order('featured_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Supabase error:', error);
        return res.status(500).json({ 
          ok: false,
          error: 'Failed to fetch artist',
          details: error.message 
        });
      }

      console.log('✅ Current artist fetched:', data?.artist_id || 'none');

      return res.status(200).json({ 
        ok: true, 
        artist: data || null 
      });

    } catch (error: any) {
      console.error('💥 Unexpected error in GET:', error);
      return res.status(500).json({ 
        ok: false,
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Method not allowed
  else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      ok: false,
      error: `Method ${req.method} Not Allowed` 
    });
  }
}
