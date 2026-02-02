// pages/api/radio/playlist-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const AZURACAST_API_URL = 'https://a12.asurahosting.com/api/station/track_trip_radio/playlists';
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY || '';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(AZURACAST_API_URL, {
      headers: {
        'X-API-Key': AZURACAST_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`AzuraCast API error: ${response.status}`);
    }

    const playlists = await response.json();

    // Find "Radio Pilot 1" playlist
    const radioPilot1 = playlists.find((p: any) => p.name === 'Radio Pilot 1');

    if (!radioPilot1) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

    return res.status(200).json({
      playlist_name: radioPilot1.name,
      num_songs: radioPilot1.num_songs,
      total_length: radioPilot1.total_length,
      total_hours: Math.floor(radioPilot1.total_length / 3600),
      total_minutes: Math.floor((radioPilot1.total_length % 3600) / 60),
    });
  } catch (error: any) {
    console.error('Error fetching playlist stats:', error);
    return res.status(500).json({ error: 'Failed to fetch playlist stats' });
  }
}
