// pages/api/admin/radio.ts - Admin API for radio management
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to send review email notification
async function sendReviewEmail(
  artistId: string, 
  trackName: string, 
  status: 'approved' | 'declined', 
  reason?: string
) {
  try {
    // Fetch artist details
    const { data: artist, error: artistError } = await supabase
      .from('radio_artists')
      .select('name, email')
      .eq('id', artistId)
      .single();
    
    if (artistError || !artist?.email) {
      console.error('Could not fetch artist for email:', artistError);
      return;
    }

    // Send the email via our API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracktrip.co.il';
    
    await fetch(`${baseUrl}/api/radio/send-track-reviewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: artist.email,
        artistName: artist.name,
        trackName,
        status,
        reason: reason || undefined,
      }),
    });
    
    console.log(`✅ Review email sent to ${artist.email} for track "${trackName}" (${status})`);
  } catch (err) {
    console.error('Failed to send review email:', err);
    // Don't throw - email failure shouldn't break the admin action
  }
}

// Helper to check if key is valid for radio admin access
function isValidRadioAdminKey(key: string | string[] | undefined): boolean {
  if (!key || Array.isArray(key)) return false;
  const ADMIN_KEY = process.env.ADMIN_KEY;
  const RADIO_ADMIN_KEY = process.env.RADIO_ADMIN_KEY;
  return key === ADMIN_KEY || key === RADIO_ADMIN_KEY;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get key from query (GET) or body (POST)
  const key = req.method === 'GET' ? req.query.key : req.body?.key;

  if (!isValidRadioAdminKey(key)) {
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
      const { action, submissionId, artistId, status, adminNotes, approved, newName } = req.body;

      // --- ACTION: DELETE SUBMISSION (With Storage Cleanup) ---
      if (action === 'deleteSubmission' && submissionId) {
        // 1. Fetch the file path first so we can clean up storage
        const { data: subToDelete } = await supabase
          .from('radio_submissions')
          .select('mp3_url')
          .eq('id', submissionId)
          .single();

        // 2. Delete from Storage (Bucket: 'Radio')
        if (subToDelete?.mp3_url) {
          const fileName = subToDelete.mp3_url.split('/').pop();
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('Radio')
              .remove([fileName]);
              
            if (storageError) console.error('Admin delete storage warning:', storageError);
          }
        }

        // 3. Delete from DB
        const { error: deleteError } = await supabase
          .from('radio_submissions')
          .delete()
          .eq('id', submissionId);

        if (deleteError) throw deleteError;
        return res.status(200).json({ ok: true });
      }

      // --- ACTION: RENAME SUBMISSION ---
      if (action === 'renameSubmission' && submissionId && newName) {
         const { error } = await supabase
           .from('radio_submissions')
           .update({ track_name: newName })
           .eq('id', submissionId);
         
         if (error) throw error;
         return res.status(200).json({ ok: true });
      }

      // --- ACTION: UPDATE SUBMISSION STATUS ---
      if (action === 'updateSubmission' && submissionId) {
        // First, fetch the submission to get track name and artist_id
        const { data: submission, error: fetchError } = await supabase
          .from('radio_submissions')
          .select('track_name, artist_id, status')
          .eq('id', submissionId)
          .single();
        
        if (fetchError) throw fetchError;
        
        const previousStatus = submission?.status;
        
        // Update the submission
        const { error } = await supabase
          .from('radio_submissions')
          .update({
            status,
            admin_notes: adminNotes || null,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', submissionId);

        if (error) throw error;
        
        // Send email notification if status changed to approved or declined
        if (submission && (status === 'approved' || status === 'declined') && previousStatus !== status) {
          await sendReviewEmail(
            submission.artist_id,
            submission.track_name,
            status,
            status === 'declined' ? adminNotes : undefined
          );
        }
        
        return res.status(200).json({ ok: true });
      }

      // --- ACTION: UPDATE ARTIST APPROVAL ---
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
