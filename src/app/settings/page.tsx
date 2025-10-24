'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const [form, setForm] = useState({
    start_date: '',
    cycle_length: '',
    notify: true,
    theme: 'princess',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: existing } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        setForm({
          start_date: existing.start_date ?? '',
          cycle_length: existing.cycle_length ?? '',
          notify: existing.notify ?? true,
          theme: existing.theme ?? 'princess',
        });
      }
    })();
  }, []);

  async function saveSettings() {
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage('Not logged in');
      return;
    }

    const { error } = await supabase.from('settings').upsert({
      user_id: user.id, // ✅ critical line
      start_date: form.start_date,
      cycle_length: parseInt(form.cycle_length || '0', 10),
      notify: form.notify,
      theme: form.theme,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      setMessage('Error saving settings ❌');
    } else {
      setMessage('Settings saved successfully 💖');
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 grid gap-3">
      <h1 className="text-xl font-semibold mb-2">Settings</h1>

      <label>Cycle start date</label>
      <input
        type="date"
        className="border p-2 rounded"
        value={form.start_date}
        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
      />

      <label>Cycle length (days)</label>
      <input
        type="number"
        min={21}
        max={40}
        className="border p-2 rounded"
        value={form.cycle_length}
        onChange={(e) => setForm({ ...form, cycle_length: e.target.value })}
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.notify}
          onChange={(e) => setForm({ ...form, notify: e.target.checked })}
        />
        Enable notifications
      </label>

      <label>Theme</label>
      <select
        className="border p-2 rounded"
        value={form.theme}
        onChange={(e) => setForm({ ...form, theme: e.target.value })}
      >
        <option value="princess">Princess (default)</option>
        <option value="lavender">Lavender</option>
        <option value="rose">Rose</option>
      </select>

      <button onClick={saveSettings} className="bg-princess-peach text-white px-3 py-2 rounded">
        Save Settings
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
