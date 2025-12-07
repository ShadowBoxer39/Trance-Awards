// pages/api/quiz/test-decrypt.ts
// Test endpoint - visit /api/quiz/test-decrypt?id=YOUR_ENCRYPTED_ID
import type { NextApiRequest, NextApiResponse } from "next";

const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  const results: any = {
    step1_input: id,
    step2_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    step3_key_length: SECRET_KEY.length,
  };
  
  if (!id || typeof id !== "string") {
    return res.status(200).json({ ...results, error: "No ID provided" });
  }
  
  try {
    // Decode from base64
    const decoded = Buffer.from(id, 'base64').toString('binary');
    results.step4_decoded_length = decoded.length;
    
    // XOR decrypt
    const chars = decoded.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    
    const result = chars.join('');
    results.step5_decrypted = result;
    results.step6_decrypted_length = result.length;
    results.step7_is_valid_video_id = result.length === 11 && /^[a-zA-Z0-9_-]+$/.test(result);
    
  } catch (e: any) {
    results.error = e.message;
  }
  
  return res.status(200).json(results);
}
