// pages/api/submit-artist.ts (FIXED: Public POST endpoint for Young Artists)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method from the form
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  
  // No ADMIN_KEY check here, as this is a PUBLIC submission endpoint.

  const { fullName, stageName, age, phone, experienceYears, inspirations, trackLink } = req.body;

  // Basic validation
  if (!fullName || !stageName || !age || !phone || !experienceYears || !trackLink) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  try {
    // Get Supabase credentials (Service Key is required for server-side insert)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing for submit-artist.");
      return res.status(500).json({ ok: false, error: 'Server configuration error' });
    }

    // Create a new Supabase client instance
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert data into the young_artists table
    const { error } = await supabase
      .from('young_artists') 
      .insert([
        {
          full_name: fullName,
          stage_name: stageName,
          age: age,
          phone: phone,
          experience_years: experienceYears,
          inspirations: inspirations,
          track_link: trackLink,
          submitted_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Supabase insert error in submit-artist:', error);
      return res.status(500).json({ ok: false, error: error.message || 'Database insert failed' });
    }

    return res.status(200).json({ ok: true, message: 'Artist submission successful' });

  } catch (error: any) {
    console.error('submit-artist server error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: error.message || 'Unknown server error'
    });
  }
}
