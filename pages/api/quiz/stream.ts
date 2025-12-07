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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  // Validate encrypted ID parameter
  if (!id || typeof id !== "string") {
    console.error("[Stream] Missing or invalid ID parameter");
    return res.status(400).json({ error: "Missing ID parameter" });
  }

  console.log("[Stream] Received request with encrypted ID length:", id.length);

  try {
    // 1. DECRYPT the video ID
    let videoId: string | null = null;
    
    try {
      videoId = deobfuscateId(id);
      console.log("[Stream] Decryption result:", videoId ? "Success (11 chars)" : "Failed");
    } catch (decryptError: any) {
      console.error("[Stream] Decryption threw error:", decryptError.message);
      return res.status(400).json({ error: "Decryption failed", details: decryptError.message });
    }
    
    if (!videoId) {
      console.error("[Stream] Failed to decrypt video ID - got null/empty");
      return res.status(400).json({ error: "Invalid or corrupted ID" });
    }

    // Validate video ID format (11 alphanumeric chars with - and _)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      console.error("[Stream] Decrypted value is not a valid YouTube ID:", videoId.length, "chars");
      return res.status(400).json({ error: "Invalid video ID format" });
    }

    console.log("[Stream] Valid video ID decrypted, fetching info...");

    // 2. Get video info from YouTube
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    let info;
    try {
      info = await ytdl.getInfo(videoUrl);
      console.log("[Stream] Got video info, formats available:", info.formats.length);
    } catch (ytError: any) {
      console.error("[Stream] ytdl.getInfo failed:", ytError.message);
      return res.status(500).json({ 
        error: "Failed to get video info from YouTube",
        details: ytError.message 
      });
    }

    // 3. Choose the best audio format
    let format = null;

    // Try MP4 audio first (best cross-browser support)
    try {
      format = ytdl.chooseFormat(info.formats, {
        quality: "lowestaudio",
        filter: (f) => f.hasAudio && !f.hasVideo && f.container === 'mp4'
      });
    } catch (e) {
      console.log("[Stream] No MP4 audio format found");
    }

    // Fallback to WebM audio
    if (!format || !format.url) {
      try {
        format = ytdl.chooseFormat(info.formats, {
          quality: "lowestaudio",
          filter: (f) => f.hasAudio && !f.hasVideo && f.container === 'webm'
        });
      } catch (e) {
        console.log("[Stream] No WebM audio format found");
      }
    }

    // Last resort: any audio-only format
    if (!format || !format.url) {
      try {
        format = ytdl.chooseFormat(info.formats, {
          quality: "lowestaudio",
          filter: "audioonly",
        });
      } catch (e) {
        console.log("[Stream] No audio-only format found");
      }
    }

    // Ultimate fallback: any format with audio
    if (!format || !format.url) {
      try {
        format = ytdl.chooseFormat(info.formats, {
          quality: "lowest",
          filter: (f) => f.hasAudio
        });
      } catch (e) {
        console.log("[Stream] No format with audio found");
      }
    }

    if (!format || !format.url) {
      console.error("[Stream] No suitable audio format found in", info.formats.length, "formats");
      return res.status(404).json({ error: "No audio format available for this video" });
    }

    console.log("[Stream] Selected format:", format.container, format.mimeType);

    // 4. Set response headers
    const contentType = format.mimeType?.split(';')[0] || 'audio/mp4';
    
    res.setHeader("Content-Type", contentType);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    if (format.contentLength) {
      res.setHeader("Content-Length", format.contentLength);
    }

    // 5. Stream the audio
    console.log("[Stream] Starting audio stream...");
    
    const stream = ytdl.downloadFromInfo(info, {
      format: format,
      highWaterMark: 1 << 25, // 32MB buffer
    });

    // Handle stream errors
    stream.on("error", (err) => {
      console.error("[Stream] Stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error", details: err.message });
      }
    });

    // Log when stream starts sending data
    stream.once("data", () => {
      console.log("[Stream] First chunk sent");
    });

    // Handle client disconnect
    req.on("close", () => {
      console.log("[Stream] Client disconnected");
      stream.destroy();
    });

    // Pipe to response
    stream.pipe(res);

  } catch (error: any) {
    console.error("[Stream] Unexpected handler error:", error.message, error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Stream failed", 
        details: error.message 
      });
    }
  }
}
