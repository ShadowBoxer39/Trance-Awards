import type { NextApiRequest, NextApiResponse } from "next";
import ytdl from "@distube/ytdl-core";
import { deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).send("Missing ID");
  }

  try {
    // 1. Decrypt the ID (so even the API URL is safe)
    const videoId = deobfuscateId(id);
    if (!videoId) return res.status(400).send("Invalid ID");

    // 2. Get Video Info
    const info = await ytdl.getInfo(videoId);

    // 3. Find the best audio-only format
    const format = ytdl.chooseFormat(info.formats, { 
      quality: "lowestaudio", // Lower quality loads faster for snippets
      filter: "audioonly" 
    });

    if (!format || !format.url) {
      return res.status(404).send("Audio not found");
    }

    // 4. Redirect the browser to the raw audio stream
    // This hides the YouTube Video ID because the GoogleVideo URL uses internal hashes.
    return res.redirect(302, format.url);

  } catch (error) {
    console.error("Stream Error:", error);
    return res.status(500).send("Stream failed");
  }
}
