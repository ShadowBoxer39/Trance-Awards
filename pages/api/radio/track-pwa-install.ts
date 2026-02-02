// pages/api/radio/track-pwa-install.ts
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

  const { user_id, nickname, avatar_url } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id required' });
  }

  try {
    // Check if already tracked
    const { data: existing } = await supabase
      .from('radio_milestones')
      .select('id')
      .eq('user_id', user_id)
      .eq('milestone_type', 'pwa_installed')
      .maybeSingle();

    if (existing) {
      // Already tracked, don't duplicate
      return res.status(200).json({ success: true, already_tracked: true });
    }

    // Create milestone for PWA installation
    const { error } = await supabase
      .from('radio_milestones')
      .insert({
        user_id,
        nickname: nickname || 'משתמש',
        avatar_url: avatar_url || null,
        milestone_type: 'pwa_installed',
        metadata: {}
      });

    if (error) {
      console.error('Error tracking PWA install:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Error tracking PWA install:', error);
    return res.status(500).json({ error: error.message });
  }
}
