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

  // Call the increment function
  const { error } = await supabase.rpc('increment_listening_time', {
    listener_user_id: user_id,
    seconds_to_add: seconds
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}