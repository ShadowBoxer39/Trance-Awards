// pages/api/track-comment.ts - SIMPLE VERSION matching new table structure
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
  // Handle POST - Create new comment
  if (req.method === 'POST') {
    try {
      const { track_id, name, text, user_id, user_photo_url } = req.body;

      console.log('📝 Received comment request:', { 
        track_id, 
        name, 
        text_length: text?.length, 
        user_id: user_id ? 'present' : 'missing',
        user_photo_url: user_photo_url ? 'present' : 'missing'
      });

      // Validate required fields
      if (!track_id || !text || !name) {
        console.error('❌ Missing required fields');
        return res.status(400).json({ 
          error: 'Missing required fields',
          received: { track_id: !!track_id, text: !!text, name: !!name }
        });
      }

      // Validate text length
      if (text.length > 500) {
        console.error('❌ Comment too long:', text.length);
        return res.status(400).json({ 
          error: 'Comment text too long (max 500 characters)' 
        });
      }

      // Create comment object - SIMPLE column names
      const commentData = {
        track_id: parseInt(track_id),
        name: name.trim(),
        text: text.trim(),
        user_id: user_id || null,
        user_photo_url: user_photo_url || null,
        timestamp: new Date().toISOString(),
      };

      console.log('💾 Inserting comment:', commentData);

      // Insert into track_of_the_week_comments table
      const { data, error } = await supabase
        .from('track_of_the_week_comments')
        .insert([commentData])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        return res.status(500).json({ 
          error: 'Failed to save comment to database',
          details: error.message,
          code: error.code,
          hint: error.hint
        });
      }

      console.log('✅ Comment saved successfully:', data.id);

      return res.status(200).json({ 
        success: true, 
        comment: data 
      });

    } catch (error: any) {
      console.error('💥 Unexpected error in POST:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Handle DELETE - Delete comment (admin only)
  else if (req.method === 'DELETE') {
    try {
      const { commentId, adminKey } = req.body;

      // Validate admin key
      if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        console.error('❌ Unauthorized delete attempt');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      console.log('🗑️ Deleting comment:', commentId);

      // Delete from track_of_the_week_comments
      const { error } = await supabase
        .from('track_of_the_week_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('❌ Delete error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete comment',
          details: error.message 
        });
      }

      console.log('✅ Comment deleted successfully');
      return res.status(200).json({ success: true });

    } catch (error: any) {
      console.error('💥 Unexpected error in DELETE:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Method not allowed
  else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
