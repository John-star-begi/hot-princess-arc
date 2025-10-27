'use client'
import { createBrowserClient } from '@supabase/ssr'

// Browser-side Supabase client for use inside React components
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
