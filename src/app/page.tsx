'use client';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function Home() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then((res) => setAuthed(!!res.data.session));
  }, []);

  if (authed) {
    if (typeof window !== 'undefined') window.location.href = '/dashboard';
    return null;
  }

  return (
    <main className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">Hot Princess Arc</h1>
      <p className="text-sm opacity-80">Invite-only cycle wellness app</p>
      <div className="flex gap-3">
        <Link className="underline" href="/signup">Sign up</Link>
        <Link className="underline" href="/login">Log in</Link>
      </div>
    </main>
  );
}
