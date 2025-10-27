// src/lib/supabaseClient.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// ✅ Function that returns a fresh Supabase client instance
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
