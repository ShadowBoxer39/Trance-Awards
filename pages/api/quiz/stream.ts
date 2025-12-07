// pages/api/quiz/stream.ts - Secure audio streaming proxy
import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing ID" });
  }

  try {
    // 1. Decrypt video ID
    const videoId = deobfuscateId(id);
    
    if (!videoId) {
      console.error("[Stream] Decryption failed for ID:", id.substring(0, 20) + "...");
      return res.status(400).json({ error: "Invalid ID" });
    }

    console.log("[Stream] Processing video (ID hidden)");

    // 2. Get video info
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(videoUrl);

    // 3. Find best audio format
    const audioFormats = info.formats.filter(f => f.hasAudio);
    
    // Prefer audio-only, then any with audio
    let format = audioFormats.find(f => !f.hasVideo && f.container === 'mp4')
               || audioFormats.find(f => !f.hasVideo && f.container === 'webm')
               || audioFormats.find(f => !f.hasVideo)
               || audioFormats[0];

    if (!format) {
      return res.status(404).json({ error: "No audio found" });
    }

    console.log("[Stream] Format:", format.container, format.mimeType?.split(';')[0]);

    // 4. Set headers
    res.setHeader("Content-Type", format.mimeType?.split(';')[0] || "audio/mp4");
    res.setHeader("Cache-Control", "no-store");
    
    if (format.contentLength) {
      res.setHeader("Content-Length", format.contentLength);
    }

    // 5. Stream
    const stream = ytdl.downloadFromInfo(info, { format });

    stream.on("error", (err) => {
      console.error("[Stream] Error:", err.message);
      if (!res.headersSent) res.status(500).end();
    });

    req.on("close", () => stream.destroy());

    stream.pipe(res);

  } catch (error: any) {
    console.error("[Stream] Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}
