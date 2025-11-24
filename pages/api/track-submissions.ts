// pages/api/track-submissions.ts (REWRITTEN: GET Only)
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key } = req.query;

  // Validate admin key
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('track_of_the_week_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({
      ok: true,
      submissions: data || [],
    });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
