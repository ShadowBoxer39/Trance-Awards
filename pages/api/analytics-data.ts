import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set headers first
  res.setHeader('Content-Type', 'application/json');
  
  try {
    // Get admin key
    const key = req.method === 'GET' ? req.query.key : req.body?.key;
    const ADMIN_KEY = process.env.ADMIN_KEY;
    
    // Verify key exists
    if (!ADMIN_KEY) {
      return res.status(500).json({ ok: false, error: 'ADMIN_KEY not configured' });
    }
    
    if (!key || key !== ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Verify credentials exist
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        ok: false, 
        error: 'Supabase not configured',
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey
        }
      });
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle GET request
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }
      
      return res.status(200).json({ ok: true, visits: data || [] });
    }

    // Handle RESET request
    if (req.method === 'POST' && req.body?.action === 'reset') {
      const { error } = await supabase
        .from('page_visits')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (error) {
        return res.status(500).json({ ok: false, error: error.message });
      }
      
      return res.status(200).json({ ok: true, message: 'Reset complete' });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
    
  } catch (error: any) {
    return res.status(500).json({ 
      ok: false, 
      error: error?.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
}
