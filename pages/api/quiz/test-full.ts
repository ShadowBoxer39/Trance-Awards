// pages/api/quiz/test-full.ts
// Full diagnostic - visit /api/quiz/test-full
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  // Get the keys
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  // Test video ID
  const testVideoId = "dQw4w9WgXcQ";
  
  // Method 1: Buffer-based (what we want to use)
  function encrypt_buffer(text: string, key: string): string {
    const chars = text.split('').map((c, i) => {
      return c.charCodeAt(0) ^ key.charCodeAt(i % key.length);
    });
    return Buffer.from(String.fromCharCode(...chars)).toString('base64');
  }
  
  function decrypt_buffer(encoded: string, key: string): string {
    const text = Buffer.from(encoded, 'base64').toString('binary');
    const chars = text.split('').map((c, i) => {
      return String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length));
    });
    return chars.join('');
  }
  
  // Method 2: btoa/atob style (browser compatible)
  function encrypt_btoa(text: string, key: string): string {
    const chars = text.split('').map((c, i) => {
      return c.charCodeAt(0) ^ key.charCodeAt(i % key.length);
    });
    return Buffer.from(chars).toString('base64');
  }
  
  function decrypt_btoa(encoded: string, key: string): string {
    const bytes = Buffer.from(encoded, 'base64');
    const chars = Array.from(bytes).map((b, i) => {
      return String.fromCharCode(b ^ key.charCodeAt(i % key.length));
    });
    return chars.join('');
  }

  // Test both methods
  const results = {
    test_video_id: testVideoId,
    key_info: {
      exists: !!SUPABASE_KEY,
      length: SUPABASE_KEY.length,
      first_10_chars: SUPABASE_KEY.substring(0, 10) + "..."
    },
    method1_buffer: {
      encrypted: encrypt_buffer(testVideoId, SUPABASE_KEY),
      decrypted: decrypt_buffer(encrypt_buffer(testVideoId, SUPABASE_KEY), SUPABASE_KEY),
      roundtrip_ok: testVideoId === decrypt_buffer(encrypt_buffer(testVideoId, SUPABASE_KEY), SUPABASE_KEY)
    },
    method2_btoa: {
      encrypted: encrypt_btoa(testVideoId, SUPABASE_KEY),
      decrypted: decrypt_btoa(encrypt_btoa(testVideoId, SUPABASE_KEY), SUPABASE_KEY),
      roundtrip_ok: testVideoId === decrypt_btoa(encrypt_btoa(testVideoId, SUPABASE_KEY), SUPABASE_KEY)
    },
    cross_test: {
      buffer_encrypted_btoa_decrypted: decrypt_btoa(encrypt_buffer(testVideoId, SUPABASE_KEY), SUPABASE_KEY),
      btoa_encrypted_buffer_decrypted: decrypt_buffer(encrypt_btoa(testVideoId, SUPABASE_KEY), SUPABASE_KEY)
    },
    // Try decrypting the actual ID from quiz
    actual_id_test: {
      id: "VSguAw9KTi0X4X30",
      method1_result: decrypt_buffer("VSguAw9KTi0X4X30", SUPABASE_KEY),
      method2_result: decrypt_btoa("VSguAw9KTi0X4X30", SUPABASE_KEY)
    }
  };

  return res.status(200).json(results);
}
