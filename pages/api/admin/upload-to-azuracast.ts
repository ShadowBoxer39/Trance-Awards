// pages/api/admin/upload-to-azuracast.ts
// Uploads approved tracks from Supabase to Azuracast via REST API
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Azuracast API configuration
const AZURACAST_URL = 'https://a12.asurahosting.com';
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY;
const STATION_ID = '1'; // Station ID (usually 1 for first station)



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

try {
    // 1. Get the adminKey and submissionId from the request
    const { submissionId, adminKey } = req.body;
    const SYSTEM_ADMIN_KEY = process.env.ADMIN_KEY;

    // 2. Validate using your master Admin Key
    if (!adminKey || adminKey !== SYSTEM_ADMIN_KEY) {
      console.error('Invalid admin key attempt');
      return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }

    if (!submissionId) {
      return res.status(400).json({ error: 'Missing submissionId' });
    }

    // 1. Get submission details from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('radio_submissions')
      .select(`
        *,
        radio_artists (
          name
        )
      `)
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      console.error('Fetch error:', fetchError);
      return res.status(404).json({ error: 'Submission not found' });
    }

    // 2. Download MP3 from Supabase URL
    console.log('Downloading from:', submission.mp3_url);
    const mp3Response = await fetch(submission.mp3_url);
    if (!mp3Response.ok) {
      return res.status(500).json({ error: 'Failed to download MP3 from storage' });
    }

    const mp3ArrayBuffer = await mp3Response.arrayBuffer();
    const mp3Buffer = Buffer.from(mp3ArrayBuffer);
    console.log('Downloaded MP3, size:', mp3Buffer.length);

    // 3. Create filename: "Artist - Track Name.mp3"
    const artistName = submission.radio_artists?.name || 'Unknown Artist';
    const trackName = submission.track_name || 'Unknown Track';
    // Clean filename - keep only safe characters
    const safeArtistName = artistName.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
    const safeTrackName = trackName.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
    const filename = `${safeArtistName} - ${safeTrackName}.mp3`;
    console.log('Filename:', filename);

    // 4. Upload to Azuracast via their API
    // First, we need to use multipart/form-data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    
    // Build multipart body manually
    const bodyParts: Buffer[] = [];

  // ADDED: The "path" part (required by Azuracast)
bodyParts.push(Buffer.from(
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="path"\r\n\r\n` +
  `/\r\n` // This tells Azuracast to upload to the root music folder
));
  
    // Add file part
    bodyParts.push(Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n` +
      `Content-Type: audio/mpeg\r\n\r\n`
    ));
    bodyParts.push(mp3Buffer);
    bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
    
    const body = Buffer.concat(bodyParts);

    console.log('Uploading to Azuracast...');
    const uploadResponse = await fetch(
      `${AZURACAST_URL}/api/station/${STATION_ID}/files`,
      {
        method: 'POST',
        headers: {
          'X-API-Key': AZURACAST_API_KEY,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: body,
      }
    );

    const responseText = await uploadResponse.text();
    console.log('Azuracast response:', uploadResponse.status, responseText);

    if (!uploadResponse.ok) {
      return res.status(500).json({ 
        error: 'Failed to upload to Azuracast', 
        status: uploadResponse.status,
        details: responseText 
      });
    }

    // 5. Update submission status in Supabase
    const { error: updateError } = await supabase
      .from('radio_submissions')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return res.status(200).json({ 
      success: true, 
      message: `Track "${filename}" uploaded to Azuracast!`,
      filename 
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload track', 
      details: error.message 
    });
  }
}

// Increase limits for large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
  // Increase timeout for Vercel Pro (won't help on free tier)
  maxDuration: 60,
};
