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

    // Filter for audio/mp4 (AAC) which is most compatible with browsers (Safari/iOS)
    let format = ytdl.chooseFormat(info.formats, {
      quality: "lowestaudio",
      filter: (f) => f.container === 'mp4' && f.hasAudio && !f.hasVideo
    });

    // Fallback if no MP4 found
    if (!format || !format.url) {
        format = ytdl.chooseFormat(info.formats, { 
            quality: "lowestaudio", 
            filter: "audioonly" 
        });
    }

    if (!format || !format.url) {
      return res.status(404).send("Audio not found");
    }

    // Set correct Content-Type (Essential for playback)
    res.setHeader("Content-Type", format.mimeType || "audio/mp4");
    
    // Download the FULL file (No 'begin' param) to prevent corruption
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
