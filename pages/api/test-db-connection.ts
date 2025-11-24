// pages/api/test-db-connection.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
  const supabaseUrl = process.env.SUPABASE_URL; // Use SUPABASE_URL (the server key name)
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
          ok: false,
          error: "CRITICAL_ENV_MISSING",
          details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseServiceKey }
      });
  }

  try {
      // 1. Create client *INSIDE* the request handler
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // 2. Try the simplest possible query to the database
      const { data, error } = await supabase
          .from('votes') 
          .select('id')
          .limit(1);

      if (error) {
          // If the table name is wrong or RLS is blocking the service key
          return res.status(500).json({ 
              ok: false,
              error: 'DB_QUERY_FAILED',
              details: error.message
          });
      }
      
      return res.status(200).json({ 
          ok: true,
          message: 'Connection successful. Query returned data.',
          record_count: data?.length || 0
      });

  } catch (err: any) {
      // Catch initialization errors
      return res.status(500).json({ 
          ok: false,
          error: 'CLIENT_INIT_FAILED',
          details: err.message
      });
  }
}
