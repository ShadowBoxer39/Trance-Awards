// pages/api/admin/upload-to-azuracast.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// 1. Supabase client with service role
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
    // 2. Auth Check: Use adminKey from the dashboard
    const { submissionId, adminKey } = req.body;
    const SYSTEM_ADMIN_KEY = process.env.ADMIN_KEY;

    if (!adminKey || adminKey !== SYSTEM_ADMIN_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId' });
    }

    // 3. Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select('*, radio_artists(name)')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // 4. Download MP3 from storage
    const mp3Response = await fetch(submission.mp3_url);
    if (!mp3Response.ok) throw new Error('Failed to download MP3 from storage');
    const mp3Buffer = Buffer.from(await mp3Response.arrayBuffer());

    // 5. Create a safe filename
    const artistName = submission.radio_artists?.name || 'Artist';
    const trackName = submission.track_name || 'Track';
    const filename = `${artistName} - ${trackName}.mp3`.replace(/[^a-zA-Z0-9\s\-_.]/g, '');

    // 6. Build Multipart Body (Adding the MISSING 'path' field)
    const boundary = '----TranceAwardsBoundary' + Math.random().toString(36).substring(2);
    const bodyParts: Buffer[] = [];

    // Part 1: The 'path' (This tells Azuracast the destination name)
    bodyParts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="path"\r\n\r\n` +
      `${filename}\r\n`
    ));

    // Part 2: The 'file'
    bodyParts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: audio/mpeg\r\n\r\n`
    ));
    bodyParts.push(mp3Buffer);
    bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

    const body = Buffer.concat(bodyParts);

    // 7. Upload to Azuracast
    const uploadResponse = await fetch(
      `${AZURACAST_URL}/api/station/${STATION_ID}/files`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': process.env.AZURACAST_API_KEY!,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return res.status(500).json({ error: 'Azuracast Upload Failed', details: errorText });
    }

    // 8. Update Supabase status
    await supabase
      .from('radio_submissions')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    return res.status(200).json({ success: true, message: `Uploaded: ${filename}` });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
  maxDuration: 60,
};
