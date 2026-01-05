// pages/api/admin/upload-to-azuracast.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import NodeID3 from 'node-id3';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AZURACAST_URL = 'https://a12.asurahosting.com';
const STATION_ID = '383';

// --- Helper: Send Email via API ---
async function sendApprovalEmail(artistId: string, trackName: string) {
  try {
    // 1. Get Artist Data
    const { data: artist } = await supabase
      .from('radio_artists')
      .select('name, email')
      .eq('id', artistId)
      .single();
    
    if (!artist?.email) return;

    // 2. Determine the correct URL (Crucial for Production)
    // Falls back to tracktrip.co.il if env var is missing
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracktrip.co.il';
    
    console.log(`📧 Calling Email API at: ${baseUrl}/api/radio/send-track-reviewed`);
    
    // 3. Call the Email API
    const response = await fetch(`${baseUrl}/api/radio/send-track-reviewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: artist.email,
        artistName: artist.name,
        trackName,
        status: 'approved',
      }),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('❌ Email API failed:', errText);
    } else {
        console.log('✅ Email API triggered successfully');
    }
  } catch (err) {
    console.error('❌ Email Helper Error:', err);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submissionId, adminKey } = req.body;
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select('*, radio_artists(name)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) return res.status(404).json({ error: 'Submission not found' });

    console.log(`Processing upload for: ${submission.track_name}`);

    // 2. Download MP3
    const mp3Response = await fetch(submission.mp3_url);
    if (!mp3Response.ok) throw new Error('Failed to download MP3 from storage');
    
    const arrayBuffer = await mp3Response.arrayBuffer();
    let fileBuffer = Buffer.from(arrayBuffer);

    // 3. Tagging
    const tags = {
      title: submission.track_name || 'Unknown Track',
      artist: submission.radio_artists?.name || 'Unknown Artist',
      album: 'TrackTrip Radio',
      genre: 'Trance',
    };

    const taggedBuffer = NodeID3.update(tags, fileBuffer);
    const finalBuffer = (taggedBuffer instanceof Buffer) ? taggedBuffer : fileBuffer;
    const base64File = finalBuffer.toString('base64');

    // 4. Clean Filename (Reverted to the Logic that WORKED)
    const artistName = submission.radio_artists?.name || 'Unknown';
    // Only allows English letters, numbers, spaces, and hyphens.
    const cleanFilename = `${artistName} - ${submission.track_name}.mp3`.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

    console.log(`Uploading to AzuraCast as: ${cleanFilename}`);

    // 5. Upload to AzuraCast
    const azuraResponse = await fetch(
      `${AZURACAST_URL}/api/station/${STATION_ID}/files`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.AZURACAST_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: cleanFilename,
          file: base64File,
        }),
      }
    );

    if (!azuraResponse.ok) {
      const resultText = await azuraResponse.text();
      console.error('AzuraCast Error:', resultText);
      return res.status(azuraResponse.status).json({ error: 'Azuracast Upload Failed', details: resultText });
    }

    // 6. Update Database
    await supabase
      .from('radio_submissions')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString(),
        is_file_deleted: true 
      })
      .eq('id', submissionId);

    // 7. Storage Cleanup
    if (submission.mp3_url) {
      const fileNameToDelete = submission.mp3_url.split('/').pop();
      if (fileNameToDelete) {
        await supabase.storage.from('Radio').remove([fileNameToDelete]);
        console.log(`✅ Cleaned up file from Supabase: ${fileNameToDelete}`);
      }
    }

    // 8. Trigger Email
    // CRITICAL: We MUST await this. In Vercel production, if we return before this finishes,
    // the server kills the request and the email never sends.
    await sendApprovalEmail(submission.artist_id, submission.track_name);

    return res.status(200).json({ success: true, message: `Uploaded: ${cleanFilename}` });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  maxDuration: 60,
};
