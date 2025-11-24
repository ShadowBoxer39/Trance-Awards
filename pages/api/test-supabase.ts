// pages/api/test-supabase.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try to import Supabase
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ 
        ok: false,
        error: 'Missing credentials',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
    }
    
    // Try to create client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to query
    const { data, error } = await supabase
      .from('artist_signups')
      .select('id')
      .limit(1);
    
    if (error) {
      return res.status(200).json({ 
        ok: false,
        step: 'query_failed',
        error: error.message
      });
    }
    
    return res.status(200).json({ 
      ok: true,
      message: 'Supabase connection works!',
      foundRecords: data?.length || 0
    });
    
  } catch (error: any) {
    return res.status(200).json({ 
      ok: false, 
      step: 'import_or_init_failed',
      error: error.message,
      stack: error.stack 
    });
  }
}
