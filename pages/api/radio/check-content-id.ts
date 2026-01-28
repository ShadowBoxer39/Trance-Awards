// pages/api/radio/check-content-id.ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Major labels - HARD BLOCK (will always claim)
const BLOCKED_LABELS = [
  'universal', 'umg', 'sony', 'sme', 'warner', 'wmg', 
  'merlin', 'believe', 'the orchard', 'adrev', 'haawk',
  'identifyy', 'audiam', 'repost network'
];

// Distributors that have whitelist options - require proof
const WHITELIST_DISTRIBUTORS = [
  { id: 'distrokid', name: 'DistroKid', path: 'Goodies > Special Access > YouTube Allowlist' },
  { id: 'tunecore', name: 'TuneCore', path: 'YouTube Monetization > Set Channel Preferences' },
  { id: 'landr', name: 'LANDR', path: 'Distribution dashboard > Whitelist requests' },
  { id: 'songtrust', name: 'Songtrust', path: 'YouTube Channel Settings' },
  { id: 'deep sounds', name: 'Deep Sounds', path: 'Subscription page > Paste Channel ID' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'Missing audioUrl' });
  }

  const AUDD_API_KEY = process.env.AUDD_API_KEY;
  
  if (!AUDD_API_KEY) {
    console.error('AUDD_API_KEY not configured');
    return res.status(200).json({ 
      status: 'safe',
      message: 'Content ID check skipped',
      match: null
    });
  }

  try {
    console.log('🔍 Checking Content ID for:', audioUrl);

    const formData = new URLSearchParams();
    formData.append('api_token', AUDD_API_KEY);
    formData.append('url', audioUrl);
    formData.append('return', 'spotify,apple_music');

    const response = await fetch('https://api.audd.io/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    if (!response.ok) {
      console.error('AudD API error:', response.status);
      return res.status(200).json({ 
        status: 'safe',
        message: 'Content ID check failed, proceeding anyway',
        match: null
      });
    }

    const data = await response.json();
    console.log('AudD response:', JSON.stringify(data, null, 2));

    // No match found - safe
    if (data.status === 'success' && !data.result) {
      return res.status(200).json({
        status: 'safe',
        message: 'No Content ID match found',
        match: null
      });
    }

    // Match found - analyze
    if (data.status === 'success' && data.result) {
      const result = data.result;
      const label = (result.label || '').toLowerCase();
      const artist = (result.artist || '').toLowerCase();
      
      // 1. Check if BLOCKED (major labels)
      const isBlocked = BLOCKED_LABELS.some(blocked => label.includes(blocked));
      
      if (isBlocked) {
        return res.status(200).json({
          status: 'blocked',
          message: 'הטראק רשום תחת לייבל גדול שאוכף Content ID על שידורים חיים. לא ניתן לשדר אותו ברדיו.',
          match: {
            title: result.title,
            artist: result.artist,
            label: result.label,
            album: result.album
          }
        });
      }

      // 2. Check if self-released (label ≈ artist name)
      const isSelfReleased = label.includes(artist) || artist.includes(label) || label === '' || label === artist;
      
      if (isSelfReleased) {
        return res.status(200).json({
          status: 'safe',
          message: 'Track appears to be self-released',
          match: {
            title: result.title,
            artist: result.artist,
            label: result.label
          }
        });
      }

      // 3. Check if distributor has whitelist option
      const whitelistDistributor = WHITELIST_DISTRIBUTORS.find(d => label.includes(d.id));
      
      if (whitelistDistributor) {
        return res.status(200).json({
          status: 'needs_whitelist',
          message: `הטראק מופץ דרך ${whitelistDistributor.name}. יש להוסיף את הערוץ שלנו ל-Whitelist כדי למנוע Content ID claims.`,
          match: {
            title: result.title,
            artist: result.artist,
            label: result.label,
            album: result.album
          },
          distributor: whitelistDistributor,
          youtubeChannelId: 'UCkxngqv_ts0zMCk-pwlc0ig'
        });
      }

      // 4. Other distributors/labels - auto-approve (can't whitelist anyway)
      return res.status(200).json({
        status: 'safe',
        message: 'Track cleared for broadcast',
        match: {
          title: result.title,
          artist: result.artist,
          label: result.label
        }
      });
    }

    // API error - fail open
    if (data.status === 'error') {
      console.error('AudD error:', data.error);
      return res.status(200).json({
        status: 'safe',
        message: 'Content ID check inconclusive',
        match: null
      });
    }

    return res.status(200).json({
      status: 'safe',
      message: 'Content ID check completed',
      match: null
    });

  } catch (error: any) {
    console.error('Content ID check error:', error);
    return res.status(200).json({
      status: 'safe',
      message: 'Content ID check failed, proceeding anyway',
      match: null
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};