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

// Helper to send the "Your track is live!" email
async function sendApprovalEmail(artistId: string, trackName: string) {
  try {
    const { data: artist } = await supabase
      .from('radio_artists')
      .select('name, email')
      .eq('id', artistId)
      .single();
    
    if (!artist?.email) return;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tracktrip.co.il';
    await fetch(`${baseUrl}/api/radio/send-track-reviewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: artist.email,
        artistName: artist.name,
        trackName,
        status: 'approved',
      }),
    });
  } catch (err) {
    console.error('Email error:', err);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submissionId, adminKey } = req.body;
    
    // Security Check
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Fetch submission data (The "Source of Truth")
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select('*, radio_artists(name)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) return res.status(404).json({ error: 'Submission not found' });

    console.log(`Processing upload for: ${submission.track_name} by ${submission.radio_artists?.name}`);

    // 2. Download the original MP3 file
    const mp3Response = await fetch(submission.mp3_url);
    if (!mp3Response.ok) throw new Error('Failed to download MP3 from storage');
    
    const arrayBuffer = await mp3Response.arrayBuffer();
    let fileBuffer = Buffer.from(arrayBuffer);

    // 3. SANITIZE TAGS: Force the MP3 to match the Database
    const artistName = submission.radio_artists?.name || 'Unknown Artist';
    const trackName = submission.track_name || 'Unknown Track';

    const tags = {
      title: trackName,
      artist: artistName,
      album: 'TrackTrip Radio', // Optional branding
      genre: 'Trance',
    };

    // Attempt to inject the new tags
    const taggedBuffer = NodeID3.update(tags, fileBuffer);
    
    // SAFETY CHECK: If tagging failed, taggedBuffer will be 'false'. We fallback to fileBuffer.
    let finalBuffer: Buffer;
    if (taggedBuffer instanceof Buffer) {
        finalBuffer = taggedBuffer;
        console.log('✅ Tags updated successfully');
    } else {
        finalBuffer = fileBuffer;
        console.warn('⚠️ Tag update failed, using original file (Process will continue)');
    }

    const base64File = finalBuffer.toString('base64');

    // 4. Create a clean filename
    // Removes special characters to prevent errors
    const cleanFilename = `${artistName} - ${trackName}.mp3`.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

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

    // 6. Update Database Status & Send Email
    await supabase
      .from('radio_submissions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', submissionId);

    // Non-blocking email sending (so the admin doesn't wait for it)
    sendApprovalEmail(submission.artist_id, trackName);

    return res.status(200).json({ success: true, message: `Uploaded & Tagged: ${cleanFilename}` });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Allows large requests if needed
    },
  },
  // maxDuration: 60, // Uncomment this line if you are on Vercel Pro to allow longer uploads
};
