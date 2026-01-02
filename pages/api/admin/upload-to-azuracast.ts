// pages/api/admin/upload-to-azuracast.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const AZURACAST_URL = 'https://a12.asurahosting.com';
const STATION_ID = '383'; // UPDATED: Matches your URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { submissionId, adminKey } = req.body;
    const SYSTEM_ADMIN_KEY = process.env.ADMIN_KEY;

    // 1. Authenticate
    if (!adminKey || adminKey !== SYSTEM_ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    // 2. Fetch submission
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select('*, radio_artists(name)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) return res.status(404).json({ error: 'Submission not found' });

    // 3. Download and convert to Base64
    const mp3Response = await fetch(submission.mp3_url);
    const arrayBuffer = await mp3Response.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');

    // 4. Create destination path
    const artistName = submission.radio_artists?.name || 'Artist';
    const trackName = submission.track_name || 'Track';
    const filename = `${artistName} - ${trackName}.mp3`.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

    // 5. Upload to the correct station ID (383)
    const azuraResponse = await fetch(
      `${AZURACAST_URL}/api/station/${STATION_ID}/files`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.AZURACAST_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: filename, 
          file: base64File,
        }),
      }
    );

    const resultText = await azuraResponse.text();

    if (!azuraResponse.ok) {
      return res.status(azuraResponse.status).json({ 
        error: 'Azuracast Upload Failed', 
        details: resultText 
      });
    }

    // 6. Update status
    await supabase
      .from('radio_submissions')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', submissionId);

    return res.status(200).json({ success: true, message: `Uploaded to station 383: ${filename}` });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
  maxDuration: 60,
};
