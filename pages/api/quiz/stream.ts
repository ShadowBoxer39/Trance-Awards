import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, start } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).send("Missing ID");
  }

  try {
    // 1. Decrypt ID
    const videoId = deobfuscateId(id);
    if (!videoId) return res.status(400).send("Invalid ID");

    // 2. Get Video Info first
    const info = await ytdl.getInfo(videoId);

    // 3. Find the best compatible format (AAC/MP4 is best for browsers)
    let format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: (f) => f.container === 'mp4' && f.hasAudio && !f.hasVideo
    });

    // Fallback: If no MP4 audio, take whatever audio is available (usually WebM)
    if (!format || !format.url) {
        format = ytdl.chooseFormat(info.formats, { 
            quality: "lowestaudio", 
            filter: "audioonly" 
        });
    }

    if (!format || !format.url) {
      return res.status(404).send("Audio not found");
    }

    // 4. Set the CORRECT Content-Type (Important for "No Sound" fix)
    // This tells the browser exactly what format is coming (e.g. 'audio/mp4' or 'audio/webm')
    res.setHeader("Content-Type", format.mimeType || "audio/mp4");
    
    // 5. Calculate start time
    const beginTime = start ? `${start}s` : "0s";

    // 6. Pipe the stream
    const stream = ytdl.downloadFromInfo(info, {
      format: format,
      begin: beginTime,       
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
