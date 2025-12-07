// lib/security.ts - EXACT MATCH to your original implementation
// Using XOR encryption with Supabase key

const SECRET_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key";

export const obfuscateId = (text: string): string => {
  if (!text) return "";
  try {
    const chars = text.split('').map((c, i) => {
      return c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    });
    // Use Buffer for server-side (Node.js)
    return Buffer.from(String.fromCharCode(...chars)).toString('base64');
  } catch (e) {
    console.error('[Security] obfuscateId error:', e);
    return text;
  }
};

export const deobfuscateId = (encoded: string): string | null => {
  if (!encoded) return null;
  try {
    // Decode from base64
    const text = Buffer.from(encoded, 'base64').toString('binary');
    
    // XOR decrypt
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    });
    
    const result = chars.join('');
    
    // Validate YouTube video ID (11 chars, alphanumeric + - _)
    if (result.length === 11 && /^[a-zA-Z0-9_-]+$/.test(result)) {
      return result;
    }
    
    console.error('[Security] Decrypted value is not a valid video ID:', result.length, 'chars');
    return null;
  } catch (e) {
    console.error('[Security] deobfuscateId error:', e);
    return null;
  }
};
