import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).send("Missing ID");
  }

  try {
    // 1. Decrypt the ID
    const videoId = deobfuscateId(id);
    if (!videoId) return res.status(400).send("Invalid ID");

    // 2. Get Video Info
    const info = await ytdl.getInfo(videoId);

    // 3. Find the best compatible format (AAC/MP4 is best for Safari/iOS)
    let format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: (f) => f.container === 'mp4' && f.hasAudio && !f.hasVideo
    });

    // Fallback: If no MP4 audio, take whatever audio is available (WebM/Opus)
    if (!format || !format.url) {
        format = ytdl.chooseFormat(info.formats, { 
            quality: "lowestaudio", 
            filter: "audioonly" 
        });
    }

    if (!format || !format.url) {
      return res.status(404).send("Audio not found");
    }

    // 4. Set the CORRECT Content-Type
    // This tells the browser exactly what format is coming
    res.setHeader("Content-Type", format.mimeType || "audio/mp4");
    
    // 5. Stream the FULL file (Start from 0 to keep headers intact)
    // We do NOT use 'begin' here anymore, to prevent file corruption.
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
