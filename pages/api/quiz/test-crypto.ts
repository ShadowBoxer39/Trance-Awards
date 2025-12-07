// pages/api/quiz/test-crypto.ts
// Test endpoint - visit /api/quiz/test-crypto
import type { NextApiRequest, NextApiResponse } from "next";

const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";

// Encryption function (what current.ts should use)
function obfuscateId(text: string): string {
  if (!text) return "";
  const chars = text.split('').map((c, i) => {
    return c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
  });
  return Buffer.from(String.fromCharCode(...chars)).toString('base64');
}

// Decryption function (what stream.ts uses)
function deobfuscateId(encoded: string): string | null {
  if (!encoded) return null;
  try {
    const text = Buffer.from(encoded, 'base64').toString('binary');
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    return chars.join('');
  } catch (e) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Test with a sample video ID
  const testVideoId = "dQw4w9WgXcQ"; // Rick Astley - 11 chars
  
  const encrypted = obfuscateId(testVideoId);
  const decrypted = deobfuscateId(encrypted);
  
  // Also try decrypting the actual ID from your quiz
  const actualEncryptedId = "CDA8Dg5_CQx1WRstPhsTYgxEJUc";
  const actualDecrypted = deobfuscateId(actualEncryptedId);
  
  return res.status(200).json({
    test: {
      original: testVideoId,
      encrypted: encrypted,
      decrypted: decrypted,
      roundtrip_success: testVideoId === decrypted
    },
    actual_quiz: {
      encrypted_id: actualEncryptedId,
      decrypted: actualDecrypted,
      is_valid_video_id: actualDecrypted ? (actualDecrypted.length === 11 && /^[a-zA-Z0-9_-]+$/.test(actualDecrypted)) : false
    },
    key_info: {
      key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      key_length: SECRET_KEY.length
    }
  });
}
