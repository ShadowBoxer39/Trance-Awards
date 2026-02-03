// pages/api/admin/azuracast-stats.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const AZURACAST_STATION_URL = 'https://a12.asurahosting.com/api/station/track_trip_radio';
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { key } = req.query;
  if (key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get current station stats (includes current listener count)
    const stationRes = await fetch(AZURACAST_STATION_URL, {
      headers: { 'X-API-Key': AZURACAST_API_KEY },
    });

    if (!stationRes.ok) {
      throw new Error(`AzuraCast API error: ${stationRes.status}`);
    }

    const stationData = await stationRes.json();

    // Get listener history for analytics
    const listenersRes = await fetch(`${AZURACAST_STATION_URL}/listeners`, {
      headers: { 'X-API-Key': AZURACAST_API_KEY },
    });

    let listenerHistory = [];
    if (listenersRes.ok) {
      listenerHistory = await listenersRes.json();
    }

    // Calculate peak and average from recent data points
    // AzuraCast stores listener count snapshots
    const currentListeners = stationData.listeners?.current || 0;
    const uniqueListeners = stationData.listeners?.unique || 0;

    // For peak, we can use the station's built-in metrics
    const peakListeners = stationData.listeners?.unique || currentListeners;

    return res.status(200).json({
      ok: true,
      stats: {
        currentListeners,
        peakListeners,
        uniqueListeners,
        totalListeners: uniqueListeners,
        // Additional station info
        isLive: stationData.is_online || false,
        nowPlaying: stationData.now_playing || null,
      }
    });
  } catch (error: any) {
    console.error('Error fetching AzuraCast stats:', error);
    return res.status(500).json({ error: error.message });
  }
}
