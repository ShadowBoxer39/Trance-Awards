import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, start } = req.query; // Added 'start'

  if (!id || typeof id !== "string") {
    return res.status(400).send("Missing ID");
  }

  try {
    const videoId = deobfuscateId(id);
    if (!videoId) return res.status(400).send("Invalid ID");

    // Set headers so browser knows it's audio
    res.setHeader("Content-Type", "audio/mpeg");
    
    // Calculate start time string (e.g., "30s")
    const beginTime = start ? `${start}s` : "0s";

    // PIPE the stream (Server downloads -> Server sends to Client)
    // This bypasses the IP restriction because YouTube only talks to your Server.
    const stream = ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
      filter: "audioonly",
      quality: "lowestaudio", // Faster for snippets
      begin: beginTime,       // Start downloading from the correct second!
      highWaterMark: 1 << 25, // Large buffer
    });

    stream.on("error", (err) => {
        console.error("YTDL Error:", err);
        res.status(500).end();
    });

    stream.pipe(res);

  } catch (error) {
    console.error("Stream Error:", error);
    return res.status(500).send("Stream failed");
  }
}
