// pages/api/admin/radio.ts - Admin API for radio management
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get key from query (GET) or body (POST)
  const key = req.method === 'GET' ? req.query.key : req.body?.key;
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    // GET - Fetch all data
    if (req.method === 'GET') {
      const { data: artists, error: artistsError } = await supabase
        .from('radio_artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (artistsError) throw artistsError;

      const { data: submissions, error: submissionsError } = await supabase
        .from('radio_submissions')
        .select(`
          *,
          radio_artists (
            id,
            name,
            slug,
            email,
            instagram,
            image_url,
            approved
          )
        `)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      return res.status(200).json({
        ok: true,
        artists: artists || [],
        submissions: submissions || [],
      });
    }

    // POST - Update actions
    if (req.method === 'POST') {
      const { action, submissionId, artistId, status, adminNotes, approved } = req.body;

      // Update submission status
      if (action === 'updateSubmission' && submissionId) {
        const { error } = await supabase
          .from('radio_submissions')
          .update({
            status,
            admin_notes: adminNotes || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', submissionId);

        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      // Update artist approval
      if (action === 'updateArtist' && artistId) {
        const { error } = await supabase
          .from('radio_artists')
          .update({
            approved,
            updated_at: new Date().toISOString(),
          })
          .eq('id', artistId);

        if (error) throw error;
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ ok: false, error: 'Invalid action' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });

  } catch (error: any) {
    console.error('Admin radio API error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
