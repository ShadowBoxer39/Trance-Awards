// pages/api/quiz/test-youtube.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const results: any = { steps: [] };
  
  try {
    // Step 1: Get the encrypted ID
    const encryptedId = (req.query.id as string) || "VSguAwMdMCtiBX4=";
    results.steps.push({ step: 1, action: "Got encrypted ID", value: encryptedId });
    
    // Step 2: Decrypt
    const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";
    const cleanEncoded = decodeURIComponent(encryptedId);
    const text = Buffer.from(cleanEncoded, 'base64').toString('binary');
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    const videoId = chars.join('');
    results.steps.push({ step: 2, action: "Decrypted", videoId, valid: videoId.length === 11 });
    
    if (videoId.length !== 11) {
      results.error = "Invalid video ID length";
      return res.status(200).json(results);
    }
    
    // Step 3: Try to import ytdl
    results.steps.push({ step: 3, action: "Importing ytdl..." });
    let ytdl;
    try {
      ytdl = require("@distube/ytdl-core");
      results.steps.push({ step: 3.1, action: "ytdl imported successfully" });
    } catch (e: any) {
      results.steps.push({ step: 3.1, action: "ytdl import FAILED", error: e.message });
      results.error = "Could not import ytdl-core";
      return res.status(200).json(results);
    }
    
    // Step 4: Try to get video info
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    results.steps.push({ step: 4, action: "Fetching YouTube info", url: videoUrl });
    
    let info;
    try {
      info = await ytdl.getInfo(videoUrl);
      results.steps.push({ 
        step: 4.1, 
        action: "YouTube info received",
        title: info.videoDetails?.title?.substring(0, 50) + "...",
        formats_count: info.formats?.length
      });
    } catch (e: any) {
      results.steps.push({ step: 4.1, action: "YouTube fetch FAILED", error: e.message });
      results.error = "YouTube fetch failed: " + e.message;
      return res.status(200).json(results);
    }
    
    // Step 5: Find audio format
    const audioFormats = info.formats.filter((f: any) => f.hasAudio);
    results.steps.push({ step: 5, action: "Found audio formats", count: audioFormats.length });
    
    const format = audioFormats.find((f: any) => !f.hasVideo && f.container === 'mp4')
                || audioFormats.find((f: any) => !f.hasVideo && f.container === 'webm')
                || audioFormats.find((f: any) => !f.hasVideo)
                || audioFormats[0];
    
    if (format) {
      results.steps.push({ 
        step: 5.1, 
        action: "Selected format",
        container: format.container,
        hasVideo: format.hasVideo,
        hasAudio: format.hasAudio,
        audioBitrate: format.audioBitrate,
        contentLength: format.contentLength
      });
      results.success = true;
      results.ready_to_stream = true;
    } else {
      results.steps.push({ step: 5.1, action: "No suitable format found" });
      results.error = "No audio format available";
    }
    
  } catch (e: any) {
    results.error = e.message;
    results.stack = e.stack;
  }
  
  return res.status(200).json(results);
}
