import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Optional: redirect unknown routes or enforce /login for private paths client-friendly
export function middleware(req: NextRequest) {
  // We keep it permissive; auth is handled in pages.
  return NextResponse.next();
}
