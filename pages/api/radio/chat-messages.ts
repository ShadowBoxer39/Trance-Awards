// pages/api/radio/chat-messages.ts
import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
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
        listener:radio_listeners(id, user_id, email, nickname, avatar_url, total_seconds)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });

    const messages: any[] = data?.reverse() || [];

    // Get unique listener emails
    const listenerEmails: string[] = [];
    messages.forEach((m: any) => {
      if (m.listener?.email && !listenerEmails.includes(m.listener.email)) {
        listenerEmails.push(m.listener.email);
      }
    });

    // Check which emails are artists
    let artistEmails: string[] = [];
    if (listenerEmails.length > 0) {
      const { data: artists } = await supabase
        .from('radio_artists')
        .select('email')
        .in('email', listenerEmails);
      
      artistEmails = artists?.map((a: any) => a.email) || [];
    }

    // Add is_artist flag and remove email from response
    const messagesWithArtistFlag = messages.map((m: any) => {
      if (m.listener) {
        const isArtist = artistEmails.includes(m.listener.email);
        return {
          ...m,
          listener: {
            id: m.listener.id,
            user_id: m.listener.user_id,
            nickname: m.listener.nickname,
            avatar_url: m.listener.avatar_url,
            total_seconds: m.listener.total_seconds,
            is_artist: isArtist
          }
        };
      }
      return m;
    });

    // Cache for 60 seconds with stale-while-revalidate
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).json(messagesWithArtistFlag);
  }

  if (req.method === 'POST') {
    const { listener_id, guest_fingerprint, guest_name, message, is_reaction } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }

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
        listener:radio_listeners(id, user_id, email, nickname, avatar_url, total_seconds)
      `)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Check if listener is artist
    let responseData: any = data;
    if (responseData?.listener?.email) {
      const { data: artist } = await supabase
        .from('radio_artists')
        .select('email')
        .eq('email', responseData.listener.email)
        .maybeSingle();

      responseData = {
        ...responseData,
        listener: {
          id: responseData.listener.id,
          user_id: responseData.listener.user_id,
          nickname: responseData.listener.nickname,
          avatar_url: responseData.listener.avatar_url,
          total_seconds: responseData.listener.total_seconds,
          is_artist: !!artist
        }
      };
    }

    return res.status(200).json(responseData);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}