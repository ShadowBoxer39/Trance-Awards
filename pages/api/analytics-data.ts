// pages/api/analytics-data.ts - NO LIMITS VERSION
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
  const { key } = req.query;

  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  try {
    console.log('📊 Loading ALL visits (no limit)...');
    
    // Get ALL visits - NO LIMIT!
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ ok: false, error: error.message });
    }

    console.log(`✅ Loaded ${data?.length || 0} visits (unlimited)`);

    return res.status(200).json({ 
      ok: true, 
      visits: data || []
    });

  } catch (error: any) {
    console.error('💥 Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
