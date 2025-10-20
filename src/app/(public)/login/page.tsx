'use client';
import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); else window.location.href = '/dashboard';
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <h1 className="text-xl font-semibold">Log in</h1>
      <input className="border p-2 rounded" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
      <input className="border p-2 rounded" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="bg-princess-peach px-3 py-2 rounded">Log in</button>
    </form>
  );
}
