// lib/security.ts - Simple ID obfuscation (no crypto module needed)
// This uses base64 + simple scrambling that works reliably on Vercel

const SECRET = process.env.QUIZ_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "tracktrip-quiz-secret-2025";

/**
 * Obfuscates a YouTube video ID
 * Not cryptographically secure, but hides the ID from casual inspection
 */
export function obfuscateId(videoId: string): string {
  if (!videoId) return "";
  
  try {
    // Add timestamp to make each encryption look different
    const timestamp = Date.now().toString(36);
    const payload = `${timestamp}:${videoId}`;
    
    // XOR with secret key
    const scrambled = payload.split('').map((char, i) => {
      const keyChar = SECRET.charCodeAt(i % SECRET.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    // Base64 encode and make URL-safe
    const base64 = Buffer.from(scrambled, 'binary').toString('base64');
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    console.error('[Security] obfuscateId error:', error);
    return "";
  }
}

/**
 * Deobfuscates back to the original video ID
 */
export function deobfuscateId(obfuscated: string): string | null {
  if (!obfuscated) return null;
  
  try {
    // Restore base64 padding
    let base64 = obfuscated.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // Decode base64
    const scrambled = Buffer.from(base64, 'base64').toString('binary');
    
    // XOR with secret key to unscramble
    const payload = scrambled.split('').map((char, i) => {
      const keyChar = SECRET.charCodeAt(i % SECRET.length);
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    // Extract video ID (after the timestamp)
    const parts = payload.split(':');
    if (parts.length >= 2) {
      const videoId = parts.slice(1).join(':'); // Handle video IDs with colons (shouldn't happen but just in case)
      
      // Validate it looks like a YouTube video ID
      if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
        return videoId;
      }
    }
    
    console.error('[Security] Invalid payload format');
    return null;
  } catch (error) {
    console.error('[Security] deobfuscateId error:', error);
    return null;
  }
}

/**
 * Hash function for additional verification
 */
export function hashId(id: string): string {
  let hash = 0;
  const str = id + SECRET;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
