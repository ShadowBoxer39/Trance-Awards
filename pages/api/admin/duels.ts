// pages/api/admin/duels.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query.key ? req.query : req.body;

  // 1. Security Check
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    // --- GET: List all duels ---
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('daily_duels')
        .select('*')
        .order('publish_date', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ ok: true, duels: data });
    }

    // --- POST: Create a new duel ---
    if (req.method === 'POST') {
      const { 
        type, 
        publish_date, 
        title_a, image_a, media_url_a, 
        title_b, image_b, media_url_b 
      } = req.body;

      if (!title_a || !title_b || !image_a || !image_b || !publish_date) {
        return res.status(400).json({ ok: false, error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('daily_duels')
        .insert([{
          type,
          publish_date,
          title_a, image_a, media_url_a: media_url_a || null,
          title_b, image_b, media_url_b: media_url_b || null,
          votes_a: 0,
          votes_b: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ ok: true, duel: data });
    }

    // --- DELETE: Remove a duel ---
    if (req.method === 'DELETE') {
        const { id } = req.body;
        const { error } = await supabase.from('daily_duels').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
