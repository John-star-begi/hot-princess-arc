'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-3">
        <h1 className="text-xl font-semibold">Password updated</h1>
        <p>You can now sign in with your new password.</p>
        <a className="underline" href="/login">Go to login</a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="bg-princess-peach px-3 py-2 rounded">Update password</button>
    </form>
  );
}
