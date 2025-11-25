import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { track_id, name, text, user_id, user_photo_url } = req.body;

    // Validate required fields
    if (!track_id || !text || !user_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate text length
    if (text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ error: 'Comment is too long (max 1000 characters)' });
    }

    // Insert comment into database
    const { data, error } = await supabase
      .from('track_comments')
      .insert([
        {
          track_id,
          name: name || 'משתמש',
          text: text.trim(),
          user_id,
          user_photo_url,
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save comment' });
    }

    return res.status(200).json({ success: true, comment: data[0] });
  } catch (error) {
    console.error('Error saving comment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
