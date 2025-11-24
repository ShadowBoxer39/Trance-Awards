// pages/api/submit-artist.ts (FINAL STABLE FIX)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method from the form
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  
  const { fullName, stageName, age, phone, experienceYears, inspirations, trackLink } = req.body;

  // Basic validation (required fields)
  if (!fullName || !stageName || !age || !phone || !experienceYears || !trackLink) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  try {
    // FIX: Using SUPABASE_URL which is correctly set in Vercel
    const supabaseUrl = process.env.SUPABASE_URL; 
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase credentials missing for submit-artist.");
      return res.status(500).json({ 
        ok: false, 
        error: 'Server configuration error: Supabase credentials missing.' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
