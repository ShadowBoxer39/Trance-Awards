// pages/api/quiz/stream.ts - Secure audio streaming proxy
// This endpoint streams audio from YouTube without exposing the video ID to the client

import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

// Disable body parsing for streaming
export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const { id } = req.query;

  // Validate encrypted ID parameter
  if (!id || typeof id !== "string") {
    console.error("[Stream] Missing or invalid ID parameter");
    return res.status(400).send("Missing ID");
  }

  try {
    // 1. DECRYPT the video ID (this is the security layer!)
    const videoId = deobfuscateId(id);
    
    if (!videoId) {
      console.error("[Stream] Failed to decrypt video ID");
      return res.status(400).send("Invalid ID");
    }

    console.log(`[Stream] Processing request for video (ID hidden for security)`);

    // 2. Get video info from YouTube
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    let info;
    try {
      info = await ytdl.getInfo(videoUrl);
    } catch (ytError: any) {
      console.error("[Stream] ytdl.getInfo failed:", ytError.message);
      return res.status(500).send("Failed to get video info");
    }

    // 3. Choose the best audio format
    // Priority: MP4 (best Safari/iOS support) -> WebM -> Any audio
    let format = null;

    // Try MP4 first (best cross-browser support, includes m4a audio)
    format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: (f) => 
        f.hasAudio && 
        !f.hasVideo && 
        f.container === 'mp4'
    });

    // Fallback to WebM audio
    if (!format || !format.url) {
      format = ytdl.chooseFormat(info.formats, {
        quality: "lowestaudio",
        filter: (f) => 
          f.hasAudio && 
          !f.hasVideo && 
          f.container === 'webm'
      });
    }

    // Last resort: any audio-only format
    if (!format || !format.url) {
      format = ytdl.chooseFormat(info.formats, {
        quality: "lowestaudio",
        filter: "audioonly",
      });
    }

    if (!format || !format.url) {
      console.error("[Stream] No suitable audio format found");
      return res.status(404).send("Audio format not found");
    }

    console.log(`[Stream] Using format: ${format.container}, ${format.mimeType}`);

    // 4. Set response headers
    // CRITICAL: Use the actual mime type from YouTube
    const contentType = format.mimeType?.split(';')[0] || 'audio/mp4';
    
    res.setHeader("Content-Type", contentType);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    
    // Prevent caching of the URL
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Set content length if available
    if (format.contentLength) {
      res.setHeader("Content-Length", format.contentLength);
    }

    // 5. Stream the audio
    const stream = ytdl.downloadFromInfo(info, {
      format: format,
      highWaterMark: 1 << 25, // 32MB buffer for smoother streaming
    });

    // Handle stream errors
    stream.on("error", (err) => {
      console.error("[Stream] Stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).end();
      }
    });

    // Handle client disconnect
    req.on("close", () => {
      stream.destroy();
    });

    // Pipe to response
    stream.pipe(res);

  } catch (error: any) {
    console.error("[Stream] Handler error:", error.message);
    
    if (!res.headersSent) {
      res.status(500).send("Stream failed");
    }
  }
}
