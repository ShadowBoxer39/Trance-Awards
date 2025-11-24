// pages/api/episodes.ts
import type { NextApiRequest, NextApiResponse } from "next";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 

// 👇 Your FULL EPISODES playlist ID (from the URL you sent)
const PLAYLIST_ID = "PLKCB7UQ2dSpoIw7g9Mys-jw4yK7fOfU3d";

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
  if (!YOUTUBE_API_KEY) {
    return res
      .status(500)
      .json({ error: "Missing YOUTUBE_API_KEY environment variable" });
  }

  try {
    const episodes: Episode[] = [];
    let pageToken: string | undefined = undefined;

    // In case the playlist ever grows beyond 50 videos, we support pagination
    do {
      const params = new URLSearchParams({
        part: "snippet",
        playlistId: PLAYLIST_ID,
        maxResults: "50",
        key: YOUTUBE_API_KEY,
      });

      if (pageToken) {
        params.append("pageToken", pageToken);
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("YouTube API error:", response.status, text);
        throw new Error("Failed to fetch from YouTube API");
      }

      const data = await response.json();

      const batch: Episode[] = (data.items || [])
        .filter((item: any) => item.snippet?.resourceId?.videoId)
        .map((item: any, index: number) => {
          const snippet = item.snippet;

          return {
            id: episodes.length + index + 1,
            videoId: snippet.resourceId.videoId,
            title: snippet.title,
            description: snippet.description ?? "",
            thumbnail:
              snippet.thumbnails?.high?.url ||
              snippet.thumbnails?.medium?.url ||
              snippet.thumbnails?.default?.url ||
              "",
            publishedAt: snippet.publishedAt,
            channelTitle:
              snippet.videoOwnerChannelTitle ||
              snippet.channelTitle ||
              "Unknown channel",
          };
        });

      episodes.push(...batch);
      pageToken = data.nextPageToken;
    } while (pageToken);

    // Oldest first (like you had before)
    episodes.reverse();

    // Cache for 1 hour
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );

    return res.status(200).json(episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return res.status(500).json({ error: "Failed to fetch episodes" });
  }
}
