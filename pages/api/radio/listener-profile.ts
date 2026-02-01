// pages/api/radio/listener-profile.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get listener profile by user_id
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id required' });
    }

    const { data, error } = await supabase
      .from('radio_listeners')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });

    // Cache for 5 minutes - profile data changes infrequently
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Create or update listener profile
    const { user_id, email, nickname, avatar_url } = req.body;

    if (!user_id || !email || !nickname) {
      return res.status(400).json({ error: 'user_id, email, and nickname required' });
    }

    // Check if nickname is taken by another user
    const { data: existing } = await supabase
      .from('radio_listeners')
      .select('id, user_id')
      .eq('nickname', nickname)
      .maybeSingle();

    if (existing && existing.user_id !== user_id) {
      return res.status(400).json({ error: 'nickname_taken' });
    }

    // Upsert the profile
    const { data, error } = await supabase
      .from('radio_listeners')
      .upsert({
        user_id,
        email,
        nickname,
        avatar_url,
        last_seen: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}