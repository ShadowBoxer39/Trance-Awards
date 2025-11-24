// pages/api/artist-signups.ts (REWRITE: Supports GET and POST/DELETE)
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = req.method === 'GET' ? req.query.key : req.body?.key;
  const ADMIN_KEY = process.env.ADMIN_KEY;
  
  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ ok: false, error: 'Supabase config missing' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
  try {
    if (req.method === 'GET') {
      // Fetch all artist signups
      const { data, error } = await supabase
        .from('young_artists') // Reads from the table used by the submission form
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ ok: true, signups: data || [] });
    }

    if (req.method === 'POST' && req.body?.action === 'delete') {
      // Delete a specific artist signup
      const { signupId } = req.body;
      if (!signupId) {
        return res.status(400).json({ ok: false, error: 'Missing signupId' });
      }

      const { error } = await supabase
        .from('young_artists') // Deletes from the table used by the submission form
        .delete()
        .eq('id', signupId);

      if (error) throw error;
      return res.status(200).json({ ok: true, message: 'Deleted' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Error' });
  }
}
