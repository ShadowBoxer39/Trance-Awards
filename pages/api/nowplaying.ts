import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(
      'https://a12.asurahosting.com/api/nowplaying/track_trip_radio'
    );
    const data = await response.json();
    
    const artist = data.now_playing?.song?.artist || 'Unknown';
    const title = data.now_playing?.song?.title || 'Unknown';
    
    // Return plain text for StreamElements/Nightbot
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(`${artist} - ${title}`);
  } catch (error) {
    res.status(500).send('Stream offline');
  }
}
