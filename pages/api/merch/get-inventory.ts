// pages/api/merch/get-inventory.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('merch_inventory')
      .select('product, size, quantity')
      .order('product')
      .order('size');

    if (error) {
      console.error('❌ Inventory fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }

    // Transform to a more usable format
    const inventory: Record<string, Record<string, number>> = {};
    
    for (const item of data) {
      if (!inventory[item.product]) {
        inventory[item.product] = {};
      }
      inventory[item.product][item.size] = item.quantity;
    }

    return res.status(200).json({ inventory });
  } catch (error: any) {
    console.error('❌ Inventory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}