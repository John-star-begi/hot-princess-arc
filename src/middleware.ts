import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  // Prepare a response
  const res = NextResponse.next();

  // Create a Supabase client for the server
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl;
  const isLoggedIn = !!user;

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Allow request if authenticated
  return res;
}

// Protect these paths
export const config = {
  matcher: ['/dashboard', '/settings', '/journal/:path*'],
};
