'use client'
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/supabase-js'

// Browser client — used in React components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server helper — used in API routes
export function createClientForServer(cookies: Record<string, string> = {}) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Cookie: Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ') } },
    }
  )
}
