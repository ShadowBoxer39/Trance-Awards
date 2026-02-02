// pages/api/radio/track-likes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // GET - Fetch like count for a track
  if (req.method === 'GET') {
    const { track, artist, fingerprint } = req.query;
    
    if (!track || !artist) {
      return res.status(400).json({ error: 'Missing track or artist' });
    }

    try {
      // Get total like count
      const { count } = await supabase
        .from('radio_track_likes')
        .select('*', { count: 'exact', head: true })
        .eq('track_name', track)
        .eq('artist_name', artist);

      // Check if this user already liked
      let userLiked = false;
      if (fingerprint) {
        const { data: existingLike } = await supabase
          .from('radio_track_likes')
          .select('id')
          .eq('track_name', track)
          .eq('artist_name', artist)
          .eq('user_fingerprint', fingerprint)
          .maybeSingle();
        
        userLiked = !!existingLike;
      }

      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=10');
      return res.status(200).json({
        likes: count || 0,
        userLiked
      });
    } catch (error: any) {
      console.error('Error fetching likes:', error);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }
  }

  // POST - Add a like
  if (req.method === 'POST') {
    const { track, artist, fingerprint } = req.body;

    if (!track || !artist || !fingerprint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Try to insert (will fail if duplicate due to unique constraint)
      const { error } = await supabase
        .from('radio_track_likes')
        .insert({
          track_name: track,
          artist_name: artist,
          user_fingerprint: fingerprint
        });

      if (error) {
        // Duplicate like - user already liked this track
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Already liked', alreadyLiked: true });
        }
        throw error;
      }

      // Get updated count
      const { count } = await supabase
        .from('radio_track_likes')
        .select('*', { count: 'exact', head: true })
        .eq('track_name', track)
        .eq('artist_name', artist);

      const likeCount = count || 0;

      // Get user info for the milestone (if logged in)
      const { data: listener, error: listenerError } = await supabase
        .from('radio_listeners')
        .select('user_id, nickname, avatar_url')
        .eq('user_id', fingerprint)
        .maybeSingle();

      if (listenerError) {
        console.error('Error fetching listener for milestone:', listenerError);
      }

      // Track "user liked a track" milestone
      if (listener) {
        const { error: milestoneError } = await supabase
          .from('radio_milestones')
          .insert({
            user_id: listener.user_id,
            nickname: listener.nickname,
            avatar_url: listener.avatar_url,
            milestone_type: 'track_liked',
            metadata: { track_name: track, artist_name: artist }
          });

        if (milestoneError) {
          console.error('Error creating track_liked milestone:', milestoneError);
        }
      }

      // Check if this is the track's first like
      if (likeCount === 1 && listener) {
        const { error: firstLikeError } = await supabase
          .from('radio_milestones')
          .insert({
            user_id: listener.user_id,
            nickname: listener.nickname,
            avatar_url: listener.avatar_url,
            milestone_type: 'track_first_like',
            metadata: { track_name: track, artist_name: artist }
          });

        if (firstLikeError) {
          console.error('Error creating track_first_like milestone:', firstLikeError);
        }
      }

      // Check if track reached milestone like counts: 5, 10, 25, 50
      const likeMilestones = [5, 10, 25, 50];
      for (const milestone of likeMilestones) {
        if (likeCount === milestone) {
          // Track hit a like milestone!
          await supabase
            .from('radio_milestones')
            .insert({
              user_id: null, // System event
              nickname: null,
              avatar_url: null,
              milestone_type: 'track_milestone_likes',
              metadata: { track_name: track, artist_name: artist, like_count: milestone }
            });
          break;
        }
      }

      return res.status(200).json({
        success: true,
        likes: likeCount
      });
    } catch (error: any) {
      console.error('Error adding like:', error);
      return res.status(500).json({ error: 'Failed to add like' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}