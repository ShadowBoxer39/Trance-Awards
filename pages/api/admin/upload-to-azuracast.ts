// pages/api/admin/upload-to-azuracast.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AZURACAST_URL = 'https://a12.asurahosting.com';
const STATION_ID = '1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authenticate using the adminKey from your dashboard
    const { submissionId, adminKey } = req.body;
    const SYSTEM_ADMIN_KEY = process.env.ADMIN_KEY;

    if (!adminKey || adminKey !== SYSTEM_ADMIN_KEY) {
      console.error('Auth failed: adminKey mismatch');
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId' });
    }

    // 2. Fetch track details from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select('*, radio_artists(name)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // 3. Download the MP3 file into a Buffer
    const mp3Response = await fetch(submission.mp3_url);
    if (!mp3Response.ok) throw new Error('Failed to download MP3 from storage');
    const mp3ArrayBuffer = await mp3Response.arrayBuffer();

    // 4. Create a clean filename
    const artistName = submission.radio_artists?.name || 'Artist';
    const trackName = submission.track_name || 'Track';
    const filename = `${artistName} - ${trackName}.mp3`.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

    // 5. Use FormData (Modern & Reliable)
    const formData = new FormData();
    // 'path' is the directory in Azuracast (empty string or "/" for root)
    formData.append('path', ''); 
    // 'file' is the actual audio data as a Blob
    formData.append('file', new Blob([mp3ArrayBuffer], { type: 'audio/mpeg' }), filename);

    // 6. Upload to Azuracast
    const uploadResponse = await fetch(
      `${AZURACAST_URL}/api/station/${STATION_ID}/files`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.AZURACAST_API_KEY!,
          // IMPORTANT: Do NOT set 'Content-Type' header here. 
          // Fetch will set it automatically with the correct boundary.
        },
        body: formData as any,
      }
    );

    const responseText = await uploadResponse.text();

    if (!uploadResponse.ok) {
      console.error('Azuracast Error:', responseText);
      return res.status(uploadResponse.status).json({ 
        error: 'Azuracast Upload Failed', 
        details: responseText 
      });
    }

    // 7. Update Supabase status on success
    await supabase
      .from('radio_submissions')
      .update({ 
        status: 'approved',
        reviewed_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    return res.status(200).json({ 
      success: true, 
      message: `Successfully uploaded: ${filename}` 
    });

  } catch (error: any) {
    console.error('Final Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '50mb' },
    responseLimit: false,
  },
  maxDuration: 60,
};
