// lib/supabaseServer.ts (FIXED: Uses a robust, lazy-loading singleton pattern)
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 1. Declare the client variable outside, initialized to null
let supabaseClient: SupabaseClient | null = null;

// 2. Function to safely get or create the client instance
function getSupabaseClient(): SupabaseClient {
    // If client exists, return the cached instance immediately
    if (supabaseClient) {
        return supabaseClient;
    }

    // Critically, ensure environment variables are present before creation
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        // This throw should now be theoretically impossible given the successful test, 
        // but it protects against future misconfiguration.
        throw new Error("SUPABASE_CONFIG_ERROR: Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables.");
    }

    // 3. Create and cache the client
    supabaseClient = createClient(
        supabaseUrl,
        supabaseServiceKey,
        { auth: { persistSession: false } }
    );
    
    return supabaseClient;
}

// 4. Export a simple wrapper object that calls the function inside its methods
// This ensures that 'getSupabaseClient()' runs every time an API tries to call 'from()'.
export default { 
    from: (table: string) => getSupabaseClient().from(table) 
};
