import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Fetch list of artist names for Autocomplete + Silhouette (Hidden)
  if (req.method === 'GET') {
    // 1. Get all names for autocomplete
    const { data: allArtists } = await supabase.from('psy_dle_artists').select('name');
    
    // 2. Get today's silhouette (we send the image URL but NO name)
    const today = new Date().toISOString().split('T')[0];
    const { data: challenge } = await supabase
      .from('daily_psydle_challenge')
      .select('artist_id, psy_dle_artists(image_url)')
      .eq('publish_date', today)
      .single();

    // Fallback if no game today
    let silhouette = null;
    if (challenge?.psy_dle_artists) {
        silhouette = (challenge.psy_dle_artists as any).image_url;
    } else {
        // Fallback logic
        const { data: fallback } = await supabase.from('psy_dle_artists').select('image_url').limit(1).single();
        silhouette = fallback?.image_url;
    }

    return res.status(200).json({ 
        ok: true, 
        names: allArtists?.map(a => a.name) || [],
        silhouetteUrl: silhouette // Client gets image but not name
    });
  }

  // POST: Validate a Guess
  if (req.method === 'POST') {
    const { guessName } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // 1. Get Solution
    let { data: challenge } = await supabase
      .from('daily_psydle_challenge')
      .select('artist_id, psy_dle_artists(*)')
      .eq('publish_date', today)
      .single();

    if (!challenge) {
       const { data: fallback } = await supabase.from('psy_dle_artists').select('*').limit(1).single();
       challenge = { psy_dle_artists: fallback };
    }
    const solution = challenge.psy_dle_artists;

    // 2. Get Guess
    const { data: guess } = await supabase
      .from('psy_dle_artists')
      .select('*')
      .ilike('name', guessName)
      .single();

    if (!guess) return res.status(404).json({ ok: false, error: 'Artist not found' });

    // 3. Logic: Compare
    const getDir = (g: any, s: any) => (g === s ? 'equal' : g < s ? 'higher' : 'lower');
    
    // First Letter Logic (A=65, Z=90)
    const gLet = guess.name.charAt(0).toUpperCase();
    const sLet = solution.name.charAt(0).toUpperCase();
    const letterDir = getDir(gLet.charCodeAt(0), sLet.charCodeAt(0));

    const feedback = {
        name: { value: guess.name, match: guess.name.toLowerCase() === solution.name.toLowerCase() },
        genre: { value: guess.genre, match: guess.genre === solution.genre },
        country: { value: guess.country, match: guess.country === solution.country },
        year: { value: guess.year_started, match: guess.year_started === solution.year_started, direction: getDir(guess.year_started, solution.year_started) },
        group: { value: guess.group_size, match: guess.group_size === solution.group_size },
        albums: { value: guess.albums_count, match: guess.albums_count === solution.albums_count, direction: getDir(guess.albums_count, solution.albums_count) },
        letter: { value: gLet, match: gLet === sLet, direction: letterDir }
    };

    return res.status(200).json({ 
        ok: true, 
        feedback, 
        isCorrect: feedback.name.match,
        solution: feedback.name.match ? solution : null
    });
  }
}
