'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [startDate, setStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState<number | ''>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setStartDate(data.start_date);
        setCycleLength(data.cycle_length);
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('Saving...');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('settings').upsert({
      user_id: user.id,
      start_date: startDate,
      cycle_length: cycleLength,
    });

    if (error) setMessage('Error saving settings');
    else setMessage('Settings saved successfully 💖');
  }

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 max-w-sm mx-auto p-4">
      <h1 className="text-xl font-semibold">Your Cycle Settings</h1>

      <label>
        <span>Cycle Start Date</span>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label>
        <span>Cycle Length (days)</span>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={cycleLength}
          onChange={(e) => setCycleLength(Number(e.target.value))}
        />
      </label>

      <button className="bg-princess-peach px-3 py-2 rounded">
        Save Settings
      </button>

      {message && <p>{message}</p>}

      <a className="underline text-sm" href="/dashboard">
        ← Back to Dashboard
      </a>
    </form>
  );
}
