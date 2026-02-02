// pages/api/radio/milestones.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Milestone {
  id: number;
  user_id: string | null;
  nickname: string | null;
  avatar_url: string | null;
  milestone_type: string;
  metadata: any;
  created_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit as string) || 30;
      const since = req.query.since as string; // ISO timestamp for polling

      let query = supabase
        .from('radio_milestones')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      // If 'since' is provided, only get milestones after that timestamp
      if (since) {
        query = query.gt('created_at', since);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching milestones:', error);
        return res.status(500).json({ error: error.message });
      }

      // Cache for 20 seconds with stale-while-revalidate for reduced server load
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=30');
      return res.status(200).json({ milestones: data || [] });
    } catch (error: any) {
      console.error('Unexpected error in milestones:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Create a new milestone
    try {
      const { user_id, nickname, avatar_url, milestone_type, metadata } = req.body;

      if (!milestone_type) {
        return res.status(400).json({ error: 'milestone_type is required' });
      }

      const { data, error } = await supabase
        .from('radio_milestones')
        .insert({
          user_id,
          nickname,
          avatar_url,
          milestone_type,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating milestone:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ milestone: data });
    } catch (error: any) {
      console.error('Unexpected error creating milestone:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
