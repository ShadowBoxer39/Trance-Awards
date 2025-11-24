// pages/api/reset-analytics.ts - FINAL FIX FOR 405 ERROR
import type { NextApiRequest, NextApiResponse } from 'next'; 
import { createClient } from '@supabase/supabase-js';

const ADMIN_KEY = process.env.ADMIN_KEY!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Handle CORS Preflight (OPTIONS)
  // This is required when making POST requests from a client-side environment (like your browser console)
  // that involve custom headers (like Content-Type).
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Ensure ADMIN_KEY is present
  if (!ADMIN_KEY) {
      return res.status(500).json({ ok: false, error: 'Server config missing' });
  }

  try {
    const { key } = req.body;

    if (!key || key !== ADMIN_KEY) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    // Initialize client inside the handler after key validation
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ ok: false, error: 'Supabase credentials missing' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    // Delete all analytics records (deletes all non-null IDs)
    const { error, count } = await supabase
      .from('site_visits')
      .delete()
      .not('id', 'is', null); 

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ 
      ok: true, 
      message: 'Analytics data reset successfully',
      deletedCount: count 
    });
  } catch (error: any) {
    console.error('Reset analytics error:', error);
    return res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
}
