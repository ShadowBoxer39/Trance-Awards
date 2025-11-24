// pages/api/track-submissions.ts - UPDATED VERSION
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify admin key
  const key = req.method === 'GET' ? req.query.key : req.body?.key;
  
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    // GET - Fetch all track submissions
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('track_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ ok: false, error: error.message });
      }

      return res.status(200).json({ ok: true, submissions: data || [] });
    }

    // DELETE - Delete a specific track submission
    if (req.method === 'DELETE' || (req.method === 'POST' && req.body?.action === 'delete')) {
      const trackId = req.body?.trackId;

      if (!trackId) {
        return res.status(400).json({ ok: false, error: 'Missing trackId' });
      }

      const { error } = await supabase
        .from('track_submissions')
        .delete()
        .eq('id', trackId);

      if (error) {
        console.error('Supabase delete error:', error);
        return res.status(500).json({ ok: false, error: error.message });
      }

      return res.status(200).json({ ok: true, message: 'Track deleted successfully' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
