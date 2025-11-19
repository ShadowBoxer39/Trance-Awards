// pages/api/episodes.ts
import type { NextApiRequest, NextApiResponse } from "next";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = "UCxM8hl6T5cVHc8x8RqYqH5w"; // Your channel ID or playlist ID

interface Episode {
  id: number;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if we have API key
    if (!YOUTUBE_API_KEY) {
      console.error("Missing YOUTUBE_API_KEY environment variable");
      return res.status(500).json({ error: "YouTube API key not configured" });
    }

    // Fetch videos from YouTube
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&type=video`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform YouTube data to our format
    const episodes: Episode[] = data.items
      .map((item: any, index: number) => ({
        id: data.items.length - index, // Reverse numbering (newest = highest)
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      }))
      .reverse(); // Oldest first

    // Cache for 1 hour
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    
    return res.status(200).json(episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return res.status(500).json({ error: "Failed to fetch episodes" });
  }
}
