// pages/api/quiz/stream-debug.ts - Debug endpoint to test encryption/decryption
// Visit: /api/quiz/stream-debug?test=1 to test

import type { NextApiRequest, NextApiResponse } from "next";
import { obfuscateId, deobfuscateId } from "../../../lib/security";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { test, id } = req.query;

  // Test mode: test encryption/decryption roundtrip
  if (test === "1") {
    const testVideoId = "dQw4w9WgXcQ"; // Example YouTube video ID
    
    try {
      // Test encryption
      const encrypted = obfuscateId(testVideoId);
      console.log("[Debug] Encrypted:", encrypted);
      
      // Test decryption
      const decrypted = deobfuscateId(encrypted);
      console.log("[Debug] Decrypted:", decrypted);
      
      const success = decrypted === testVideoId;
      
      return res.status(200).json({
        ok: true,
        test: "encryption_roundtrip",
        originalId: testVideoId,
        encryptedId: encrypted,
        decryptedId: decrypted,
        success: success,
        encryptedLength: encrypted?.length || 0,
        hasEncryptionKey: !!process.env.QUIZ_ENCRYPTION_KEY,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
    } catch (error: any) {
      return res.status(500).json({
        ok: false,
        error: "Encryption test failed",
        details: error.message,
        stack: error.stack,
      });
    }
  }

  // Decrypt a specific ID
  if (id && typeof id === "string") {
    try {
      const decrypted = deobfuscateId(id);
      
      return res.status(200).json({
        ok: true,
        test: "decrypt_provided_id",
        encryptedId: id.substring(0, 20) + "...",
        decryptedId: decrypted,
        isValidVideoId: decrypted ? /^[a-zA-Z0-9_-]{11}$/.test(decrypted) : false,
      });
    } catch (error: any) {
      return res.status(500).json({
        ok: false,
        error: "Decryption failed",
        details: error.message,
      });
    }
  }

  // No params - show usage
  return res.status(200).json({
    usage: {
      test_encryption: "/api/quiz/stream-debug?test=1",
      decrypt_id: "/api/quiz/stream-debug?id=YOUR_ENCRYPTED_ID",
    },
    environment: {
      hasEncryptionKey: !!process.env.QUIZ_ENCRYPTION_KEY,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeVersion: process.version,
    }
  });
}
