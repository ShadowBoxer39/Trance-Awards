// lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create client with empty strings if env vars missing (for build time)
// The actual API calls will fail, but the build will succeed
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  { auth: { persistSession: false } }
);

export default supabase;
