// pages/api/test-env.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = {
      ok: true,
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAdminKey: !!process.env.ADMIN_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      }
    };
    
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}
