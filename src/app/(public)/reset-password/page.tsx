'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/update-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="grid gap-3">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p>We sent a password reset link to {email}.</p>
        <a href="/login" className="underline">Back to login</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <h1 className="text-xl font-semibold">Reset password</h1>
      <input
        className="border p-2 rounded"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="bg-princess-peach px-3 py-2 rounded">Send reset link</button>
      <a className="underline text-sm" href="/login">Back to login</a>
    </form>
  );
}

