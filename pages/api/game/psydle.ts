import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: Fetch context (names for autocomplete + silhouette hint)
  if (req.method === 'GET') {
    const { data: allArtists } = await supabase.from('psy_dle_artists').select('name');
    
    // Get today's challenge
    const today = new Date().toISOString().split('T')[0];
    let { data: challenge } = await supabase
      .from('daily_psydle_challenge')
      .select('artist_id, psy_dle_artists(image_url)')
      .eq('publish_date', today)
      .single();

    // Fallback if missing
    if (!challenge) {
       const { data: fallback } = await supabase.from('psy_dle_artists').select('*').limit(1).single();
       challenge = { 
           artist_id: fallback?.id || 0, 
           psy_dle_artists: fallback 
       } as any;
    }

    // Extract image for silhouette (hidden name)
    const artistData = Array.isArray(challenge?.psy_dle_artists) 
        ? challenge?.psy_dle_artists[0] 
        : challenge?.psy_dle_artists;

    return res.status(200).json({ 
        ok: true, 
        names: allArtists?.map(a => a.name) || [],
        silhouetteUrl: artistData?.image_url || null
    });
  }

  // POST: Check Guess
  if (req.method === 'POST') {
    const { guessName } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let { data: challenge } = await supabase
      .from('daily_psydle_challenge')
      .select('artist_id, psy_dle_artists(*)')
      .eq('publish_date', today)
      .single();

    if (!challenge) {
       const { data: fallback } = await supabase.from('psy_dle_artists').select('*').limit(1).single();
       challenge = { artist_id: fallback?.id, psy_dle_artists: fallback } as any;
    }

    const solution = Array.isArray(challenge.psy_dle_artists) ? challenge.psy_dle_artists[0] : challenge.psy_dle_artists;
    
    const { data: guess } = await supabase
      .from('psy_dle_artists')
      .select('*')
      .ilike('name', guessName)
      .single();

    if (!guess) return res.status(404).json({ ok: false, error: 'Artist not found' });

    const getDir = (g: any, s: any) => (g === s ? 'equal' : g < s ? 'higher' : 'lower');
    const gLet = guess.name.charAt(0).toUpperCase();
    const sLet = solution.name.charAt(0).toUpperCase();

    const feedback = {
        name: { value: guess.name, match: guess.name.toLowerCase() === solution.name.toLowerCase() },
        genre: { value: guess.genre, match: guess.genre === solution.genre },
        country: { value: guess.country, match: guess.country === solution.country },
        year: { value: guess.year_started, match: guess.year_started === solution.year_started, direction: getDir(guess.year_started, solution.year_started) },
        group: { value: guess.group_size, match: guess.group_size === solution.group_size },
        albums: { value: guess.albums_count, match: guess.albums_count === solution.albums_count, direction: getDir(guess.albums_count, solution.albums_count) },
        letter: { value: gLet, match: gLet === sLet, direction: getDir(gLet.charCodeAt(0), sLet.charCodeAt(0)) }
    };

    return res.status(200).json({ 
        ok: true, 
        feedback, 
        isCorrect: feedback.name.match,
        solution: feedback.name.match ? solution : null
    });
  }
}
