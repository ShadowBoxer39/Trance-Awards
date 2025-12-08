// pages/api/admin/duels.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: Get YouTube Thumbnail
const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  const videoId = match ? match[1] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { key } = req.query.key ? req.query : req.body;

  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    // --- GET ---
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('daily_duels')
        .select('*')
        .order('publish_date', { ascending: false }); // Show newest first

      if (error) throw error;
      return res.status(200).json({ ok: true, duels: data });
    }

    // --- POST ---
    if (req.method === 'POST') {
      let { 
        type, 
        title_a, image_a, media_url_a, 
        title_b, image_b, media_url_b 
      } = req.body;

      if (!title_a || !title_b) {
        return res.status(400).json({ ok: false, error: 'Missing titles' });
      }

      // 1. Auto-generate Images from YouTube if missing
      if (type === 'track') {
        if (!image_a && media_url_a) image_a = getYouTubeThumbnail(media_url_a);
        if (!image_b && media_url_b) image_b = getYouTubeThumbnail(media_url_b);
      }

      // 2. Auto-calculate Date (Queue Logic)
      // Fetch the LATEST publish date currently in DB
      const { data: lastDuel } = await supabase
        .from('daily_duels')
        .select('publish_date')
        .order('publish_date', { ascending: false })
        .limit(1)
        .single();

      let newDate = new Date();
      
      if (lastDuel && lastDuel.publish_date) {
        const lastDate = new Date(lastDuel.publish_date);
        const today = new Date();
        
        // If the queue is empty or old (last duel was in the past), start NOW.
        // If the queue has future items, add 3 days to the LAST item.
        if (lastDate > today) {
           newDate = new Date(lastDate);
           newDate.setDate(newDate.getDate() + 3); // Add 3 days gap
        } else {
           // If the last duel is already active (or passed), we set the NEW one
           // to start 3 days from NOW (or whenever the current one ends).
           // Simpler logic: If queue is empty/old, start Today.
           // You might want to adjust this if you want to strict queue.
           // Let's do: Start Today if empty, otherwise Last + 3.
           newDate = new Date(lastDate);
           newDate.setDate(newDate.getDate() + 3);
        }
      }

      const { data, error } = await supabase
        .from('daily_duels')
        .insert([{
          type,
          publish_date: newDate.toISOString(),
          title_a, image_a: image_a || null, media_url_a: media_url_a || null,
          title_b, image_b: image_b || null, media_url_b: media_url_b || null,
          votes_a: 0,
          votes_b: 0
        }])
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ ok: true, duel: data });
    }

    // --- DELETE ---
    if (req.method === 'DELETE') {
        const { id } = req.body;
        const { error } = await supabase.from('daily_duels').delete().eq('id', id);
        if (error) throw error;
        return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
