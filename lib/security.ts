// lib/security.ts - Secure ID obfuscation for quiz audio streaming
// UPGRADED: From weak XOR to AES-256-CBC encryption

import crypto from 'crypto';

// Use a dedicated encryption key (add to .env.local)
// Falls back to Supabase key but RECOMMENDED to use a separate key
const ENCRYPTION_KEY = process.env.QUIZ_ENCRYPTION_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "default-mask-key-change-this!";
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a YouTube video ID so it can't be read in the URL
 * Example: "dQw4w9WgXcQ" -> "YTJmOGQ5ZTJjMWIw..."
 * 
 * Uses AES-256-CBC with random IV for each encryption
 * Same input produces different output each time (more secure)
 */
export function obfuscateId(videoId: string): string {
  if (!videoId) return "";
  
  try {
    // Create a consistent 32-byte key from the secret (AES-256 requires 32 bytes)
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Generate random IV for each encryption
    // This makes the same video ID look different each time
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Encrypt
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(videoId, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine IV + encrypted data (IV is needed for decryption)
    const combined = iv.toString('hex') + ':' + encrypted;
    
    // Make it URL-safe base64
    return Buffer.from(combined).toString('base64url');
  } catch (error) {
    console.error('[Security] Obfuscation error:', error);
    return "";
  }
}

/**
 * Decrypts an obfuscated ID back to the original YouTube video ID
 * Returns null if decryption fails (invalid/tampered data)
 */
export function deobfuscateId(obfuscatedId: string): string | null {
  if (!obfuscatedId) return null;
  
  try {
    // Decode from URL-safe base64
    const combined = Buffer.from(obfuscatedId, 'base64url').toString('utf8');
    
    // Split IV and encrypted data
    const parts = combined.split(':');
    if (parts.length !== 2) {
      console.error('[Security] Invalid obfuscated ID format');
      return null;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    // Validate IV length
    if (iv.length !== IV_LENGTH) {
      console.error('[Security] Invalid IV length');
      return null;
    }
    
    // Create key (must match obfuscateId)
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // Decrypt
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    // Validate it looks like a YouTube video ID (11 characters, alphanumeric + _-)
    if (decrypted.length === 11 && /^[a-zA-Z0-9_-]+$/.test(decrypted)) {
      return decrypted;
    }
    
    console.error('[Security] Decrypted value is not a valid video ID');
    return null;
  } catch (error) {
    console.error('[Security] Deobfuscation error:', error);
    return null;
  }
}

/**
 * Simple hash for additional verification (optional utility)
 */
export function hashId(id: string): string {
  return crypto.createHash('md5').update(id + ENCRYPTION_KEY).digest('hex').substring(0, 8);
}
