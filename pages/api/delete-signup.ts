// pages/api/delete-signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_KEY = process.env.ADMIN_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { key, signupId } = req.body;

  if (!key || key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  if (!signupId) {
    return res.status(400).json({ ok: false, error: 'Missing signupId' });
  }

  try {
    const { error } = await supabase
      .from('artist_signups')
      .delete()
      .eq('id', signupId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Delete signup error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}
