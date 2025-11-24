// pages/api/delete-track.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key, trackId } = req.body;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!trackId) {
    return res.status(400).json({ ok: false, error: 'Missing trackId' });
  }

  try {
    const { error } = await supabase
      .from('track_submissions')
      .delete()
      .eq('id', trackId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Delete track error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
