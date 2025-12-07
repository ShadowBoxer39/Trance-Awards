// lib/security.ts - Secure ID obfuscation for quiz audio streaming
// UPGRADED: From weak XOR to AES-256-CBC encryption
// BACKWARDS COMPATIBLE: Can decrypt both old XOR and new AES formats

import crypto from 'crypto';

// Use a dedicated encryption key (add to .env.local)
// Falls back to Supabase key for backwards compatibility
const ENCRYPTION_KEY = process.env.QUIZ_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key-change-this!";
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a YouTube video ID using AES-256-CBC
 * Example: "dQw4w9WgXcQ" -> "YTJmOGQ5ZTJjMWIw..."
 */
export function obfuscateId(videoId: string): string {
  if (!videoId) return "";
  
  try {
    // Create a consistent 32-byte key from the secret
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(videoId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV + encrypted data with marker
    // Prefix with "v2:" to identify new encryption format
    const combined = 'v2:' + iv.toString('hex') + ':' + encrypted;
    
    // Make it URL-safe base64
    return Buffer.from(combined).toString('base64url');
  } catch (error) {
    console.error('[Security] Obfuscation error:', error);
    return "";
  }
}

/**
 * Decrypts an obfuscated ID - supports both OLD (XOR) and NEW (AES) formats
 * Returns null if decryption fails
 */
export function deobfuscateId(obfuscatedId: string): string | null {
  if (!obfuscatedId) return null;
  
  try {
    // Try to decode from base64
    let decoded: string;
    try {
      // Try URL-safe base64 first (new format)
      decoded = Buffer.from(obfuscatedId, 'base64url').toString('utf8');
    } catch {
      // Try regular base64 (old format)
      decoded = Buffer.from(obfuscatedId, 'base64').toString('utf8');
    }

    // Check if it's the new AES format (starts with "v2:")
    if (decoded.startsWith('v2:')) {
      return decryptAES(decoded.substring(3));
    }
    
    // Otherwise, try the old XOR format
    return decryptXOR(obfuscatedId);
    
  } catch (error) {
    console.error('[Security] Deobfuscation error:', error);
    
    // Last resort: try old XOR method directly
    try {
      return decryptXOR(obfuscatedId);
    } catch {
      return null;
    }
  }
}

/**
 * NEW: AES-256-CBC decryption
 */
function decryptAES(combined: string): string | null {
  try {
    const parts = combined.split(':');
    if (parts.length !== 2) {
      console.error('[Security] Invalid AES format');
      return null;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    if (iv.length !== IV_LENGTH) {
      console.error('[Security] Invalid IV length');
      return null;
    }
    
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Validate YouTube video ID format
    if (decrypted.length === 11 && /^[a-zA-Z0-9_-]+$/.test(decrypted)) {
      return decrypted;
    }
    
    return null;
  } catch (error) {
    console.error('[Security] AES decryption error:', error);
    return null;
  }
}

/**
 * OLD: XOR decryption (for backwards compatibility)
 */
function decryptXOR(encoded: string): string | null {
  if (!encoded) return null;
  
  try {
    // Decode from base64
    let text: string;
    try {
      text = Buffer.from(encoded, 'base64').toString('binary');
    } catch {
      text = Buffer.from(encoded, 'base64url').toString('binary');
    }
    
    // XOR decrypt
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    });
    
    const result = chars.join('');
    
    // Validate YouTube video ID format
    if (result.length === 11 && /^[a-zA-Z0-9_-]+$/.test(result)) {
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('[Security] XOR decryption error:', error);
    return null;
  }
}

/**
 * Simple hash for additional verification (optional utility)
 */
export function hashId(id: string): string {
  return crypto.createHash('md5').update(id + ENCRYPTION_KEY).digest('hex').substring(0, 8);
}
