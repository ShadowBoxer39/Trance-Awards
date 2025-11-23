// pages/api/approve-track.ts

import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key, trackId } = req.body;

  // Validate admin key
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(403).json({ ok: false, error: 'Unauthorized' });
  }

  if (!trackId) {
    return res.status(400).json({ ok: false, error: 'trackId is required' });
  }

  try {
    // First, set all tracks to NOT approved
    const { error: updateAllError } = await supabase
      .from('track_of_the_week_submissions')
      .update({ is_approved: false })
      .neq('id', 0); // Update all rows

    if (updateAllError) {
      console.error('Error updating all tracks:', updateAllError);
      return res.status(500).json({ ok: false, error: updateAllError.message });
    }

    // Then, approve the selected track
    const { error: approveError } = await supabase
      .from('track_of_the_week_submissions')
      .update({ is_approved: true })
      .eq('id', trackId);

    if (approveError) {
      console.error('Error approving track:', approveError);
      return res.status(500).json({ ok: false, error: approveError.message });
    }

    return res.status(200).json({ ok: true, message: 'Track approved successfully' });
  } catch (err: any) {
    console.error('Server error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
