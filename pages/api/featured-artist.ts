// pages/api/featured-artist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST - Create new featured artist
  if (req.method === 'POST') {
    try {
      const { key, artist_id, name, stage_name, bio, profile_photo_url, soundcloud_track_url, instagram_url, soundcloud_profile_url, spotify_url } = req.body;

      console.log('🌟 Received featured artist request:', { 
        artist_id, 
        stage_name,
        has_bio: !!bio,
        has_photo: !!profile_photo_url,
        has_track: !!soundcloud_track_url
      });

      // Validate admin key
      if (!key || key !== process.env.NEXT_PUBLIC_ADMIN_KEY) {
        console.error('❌ Unauthorized: Invalid admin key');
        return res.status(401).json({ 
          ok: false,
          error: 'Unauthorized' 
        });
      }

      // Validate required fields
      if (!artist_id || !name || !stage_name || !bio || !profile_photo_url || !soundcloud_track_url) {
        console.error('❌ Missing required fields');
        return res.status(400).json({ 
          ok: false,
          error: 'Missing required fields',
          received: { 
            artist_id: !!artist_id, 
            name: !!name, 
            stage_name: !!stage_name,
            bio: !!bio,
            profile_photo_url: !!profile_photo_url,
            soundcloud_track_url: !!soundcloud_track_url
          }
        });
      }

      // Validate bio length
      if (bio.length < 50 || bio.length > 1000) {
        console.error('❌ Invalid bio length:', bio.length);
        return res.status(400).json({ 
          ok: false,
          error: 'Bio must be between 50 and 1000 characters' 
        });
      }

      // Create artist object
      const artistData = {
        artist_id: artist_id.toLowerCase().trim(),
        name: name.trim(),
        stage_name: stage_name.trim(),
        bio: bio.trim(),
        profile_photo_url: profile_photo_url.trim(),
        soundcloud_track_url: soundcloud_track_url.trim(),
        instagram_url: instagram_url?.trim() || null,
        soundcloud_profile_url: soundcloud_profile_url?.trim() || null,
        spotify_url: spotify_url?.trim() || null,
        featured_at: new Date().toISOString()
      };

      console.log('💾 Inserting featured artist:', artistData.artist_id);

      // Insert into featured_artists table
      const { data, error } = await supabase
        .from('featured_artists')
        .insert([artistData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Check for unique constraint violation
        if (error.code === '23505') {
          return res.status(409).json({ 
            ok: false,
            error: 'Artist ID already exists',
            details: error.message
          });
        }
        
        return res.status(500).json({ 
          ok: false,
          error: 'Failed to save artist to database',
          details: error.message,
          code: error.code,
          hint: error.hint
        });
      }

      console.log('✅ Featured artist saved successfully:', data.id);

      return res.status(200).json({ 
        ok: true,
        artist: data 
      });

    } catch (error: any) {
      console.error('💥 Unexpected error in POST:', error);
      return res.status(500).json({ 
        ok: false,
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Method not allowed
  else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      ok: false,
      error: `Method ${req.method} Not Allowed` 
    });
  }
}
