// pages/api/radio/get-artist-details.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // We use the service key to ensure we can search everything
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Missing name' });
  }

  const cleanName = name.trim();

  // 1. Try Exact Match (Case Insensitive) - The most accurate
  let { data } = await supabase
    .from('radio_artists')
    .select('name, bio, image_url, instagram, soundcloud, slug')
    .ilike('name', cleanName)
    .maybeSingle();

  // 2. Fallback: Try cleaning up the name (e.g. remove "feat. X", " & Y")
  if (!data) {
    // Split by common separators to get the main artist name
    const mainArtistName = cleanName.split(/ feat| ft| &|,/i)[0].trim();
    
    if (mainArtistName !== cleanName && mainArtistName.length > 2) {
        const { data: retryData } = await supabase
            .from('radio_artists')
            .select('name, bio, image_url, instagram, soundcloud, slug')
            .ilike('name', mainArtistName)
            .maybeSingle();
            
        data = retryData;
    }
  }

  // 3. Fallback: Fuzzy Text Search (Last resort)
  if (!data) {
     const { data: fuzzyData } = await supabase
        .from('radio_artists')
        .select('name, bio, image_url, instagram, soundcloud, slug')
        .textSearch('name', cleanName, { type: 'websearch', config: 'english' })
        .maybeSingle();
        
     data = fuzzyData;
  }

  if (!data) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  return res.status(200).json(data);
}
