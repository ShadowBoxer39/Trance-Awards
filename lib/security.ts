// lib/security.ts
// XOR-based obfuscation using Supabase key
// IMPORTANT: This file must be used by BOTH current.ts and stream.ts

const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";

/**
 * Encrypts a YouTube video ID for secure transmission
 * Used by: /api/quiz/current.ts
 */
export function obfuscateId(text: string): string {
  if (!text) return "";
  try {
    const chars = text.split('').map((c, i) => {
      return c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    });
    return Buffer.from(String.fromCharCode(...chars)).toString('base64');
  } catch (e) {
    console.error('[Security] obfuscateId error:', e);
    return "";
  }
}

/**
 * Decrypts an obfuscated video ID
 * Used by: /api/quiz/stream.ts
 */
export function deobfuscateId(encoded: string): string | null {
  if (!encoded) return null;
  try {
    // Handle URL encoding (+ becomes space, etc)
    const cleanEncoded = decodeURIComponent(encoded);
    
    const text = Buffer.from(cleanEncoded, 'base64').toString('binary');
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    const result = chars.join('');
    
    // Validate: YouTube video IDs are exactly 11 characters
    if (result.length === 11 && /^[a-zA-Z0-9_-]+$/.test(result)) {
      return result;
    }
    
    console.error('[Security] Invalid video ID after decryption:', result.length, 'chars');
    return null;
  } catch (e) {
    console.error('[Security] deobfuscateId error:', e);
    return null;
  }
}
