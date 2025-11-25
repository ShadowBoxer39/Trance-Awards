// pages/api/track-comment-public.ts - Fetch comments (public, no auth required)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { trackId } = req.query;

    if (!trackId) {
      return res.status(400).json({ error: 'trackId is required' });
    }

    console.log('📖 Fetching comments for track:', trackId);

    // Fetch comments from track_of_the_week_comments
    const { data, error } = await supabase
      .from('track_of_the_week_comments')
      .select('*')
      .eq('track_id', parseInt(trackId as string))
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching comments:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch comments',
        details: error.message 
      });
    }

    console.log(`✅ Found ${data.length} comments`);

    // Transform to frontend format
    const comments = data.map(comment => ({
      id: comment.id,
      name: comment.user_name,           // Transform user_name -> name
      text: comment.comment_text,        // Transform comment_text -> text
      timestamp: comment.created_at,
      user_id: comment.user_id,
      user_photo_url: comment.user_photo_url,
    }));

    return res.status(200).json({ comments });

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
