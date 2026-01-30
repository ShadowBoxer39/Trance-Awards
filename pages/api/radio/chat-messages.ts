// pages/api/radio/chat-messages.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Get recent messages
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from('radio_chat_messages')
      .select(`
        id,
        message,
        is_reaction,
        created_at,
        guest_name,
        guest_fingerprint,
        listener:radio_listeners(id, user_id, nickname, avatar_url, total_seconds)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    
    // Reverse to show oldest first
    return res.status(200).json(data?.reverse() || []);
  }

  if (req.method === 'POST') {
    // Send a message
    const { listener_id, guest_fingerprint, guest_name, message, is_reaction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }

    // Must have either listener_id or guest info
    if (!listener_id && !guest_fingerprint) {
      return res.status(400).json({ error: 'listener_id or guest_fingerprint required' });
    }

    const { data, error } = await supabase
      .from('radio_chat_messages')
      .insert({
        listener_id: listener_id || null,
        guest_fingerprint: listener_id ? null : guest_fingerprint,
        guest_name: listener_id ? null : guest_name,
        message,
        is_reaction: is_reaction || false
      })
      .select(`
        id,
        message,
        is_reaction,
        created_at,
        guest_name,
        guest_fingerprint,
      listener:radio_listeners(id, user_id, nickname, avatar_url, total_seconds)
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}