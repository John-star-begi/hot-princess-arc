import { createMiddlewareClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // create Supabase middleware client to read auth cookies
  const supabase = createMiddlewareClient({ req, res })

  // refresh the session if needed (prevents "Not authenticated")
  await supabase.auth.getSession()

  return res
}
