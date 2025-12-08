import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: challenge, error } = await supabase
      .from('daily_pixel_challenge')
      .select('id, day_index, image_url, solution, category') // Added day_index
      .eq('publish_date', today)
      .single();

    if (error || !challenge) {
      // Fallback to most recent if today is missing
      const { data: fallback } = await supabase
        .from('daily_pixel_challenge')
        .select('id, day_index, image_url, solution, category')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();
        
      if (!fallback) return res.status(404).json({ ok: false, error: 'No games found' });
      return res.status(200).json({ ok: true, challenge: fallback });
    }

    return res.status(200).json({ ok: true, challenge });

  } catch (e) {
    return res.status(500).json({ ok: false, error: 'Server Error' });
  }
}
