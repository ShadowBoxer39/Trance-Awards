// lib/supabaseServer.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (supabaseClient) {
        return supabaseClient;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("SUPABASE_CONFIG_ERROR: Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables.");
    }

    supabaseClient = createClient(
        supabaseUrl,
        supabaseServiceKey,
        { auth: { persistSession: false } }
    );
    
    return supabaseClient;
}

const supabase = {
    from: (table: string) => getSupabaseClient().from(table)
};

export default supabase;