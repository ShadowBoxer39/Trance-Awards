import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).send("Missing ID");
  }

  try {
    const videoId = deobfuscateId(id);
    if (!videoId) return res.status(400).send("Invalid ID");

    const info = await ytdl.getInfo(videoId);

    // 1. Prioritize MP4/M4A (Best for Safari/iOS)
    let format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: (f) => f.container === 'mp4' && f.hasAudio && !f.hasVideo
    });

    // 2. Fallback to WebM (Best for Chrome/Android) if MP4 unavailable
    if (!format || !format.url) {
        format = ytdl.chooseFormat(info.formats, { 
            quality: "lowestaudio", 
            filter: "audioonly" 
        });
    }

    if (!format || !format.url) {
      return res.status(404).send("Audio not found");
    }

    // 3. CRITICAL FIX: Send the ACTUAL mime type from YouTube
    // This fixes the "No Sound" / Silence bug
    res.setHeader("Content-Type", format.mimeType || "audio/mp4");
    
    // 4. Stream the FULL file (Start from 0 to avoid corruption)
    const stream = ytdl.downloadFromInfo(info, {
      format: format,
      highWaterMark: 1 << 25, 
    });

    stream.on("error", (err) => {
        console.error("YTDL Stream Error:", err);
        if (!res.headersSent) res.status(500).end();
    });

    stream.pipe(res);

  } catch (error) {
    console.error("Stream Handler Error:", error);
    return res.status(500).send("Stream failed");
  }
}
