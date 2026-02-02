// pages/api/radio/listening-time.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, seconds } = req.body;

  if (!user_id || !seconds) {
    return res.status(400).json({ error: 'user_id and seconds required' });
  }

  // Get user's current listening time before incrementing
  const { data: listenerBefore } = await supabase
    .from('radio_listeners')
    .select('total_seconds, nickname, avatar_url')
    .eq('user_id', user_id)
    .single();

  // Call the increment function
  const { error } = await supabase.rpc('increment_listening_time', {
    listener_user_id: user_id,
    seconds_to_add: seconds
  });

  if (error) return res.status(500).json({ error: error.message });

  // Check if user crossed any milestone thresholds
  if (listenerBefore) {
    const oldHours = Math.floor(listenerBefore.total_seconds / 3600);
    const newHours = Math.floor((listenerBefore.total_seconds + seconds) / 3600);

    // Milestone thresholds: 1, 5, 10, 25, 50, 100, 250, 500 hours
    const milestones = [1, 5, 10, 25, 50, 100, 250, 500];

    for (const milestone of milestones) {
      if (oldHours < milestone && newHours >= milestone) {
        // User just crossed this milestone!
        await supabase
          .from('radio_milestones')
          .insert({
            user_id,
            nickname: listenerBefore.nickname,
            avatar_url: listenerBefore.avatar_url,
            milestone_type: 'listening_hours',
            metadata: { hours: milestone }
          });
        break; // Only log one milestone per update
      }
    }
  }

  return res.status(200).json({ success: true });
}