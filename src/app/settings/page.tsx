'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SettingsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    start_date: '',
    cycle_length: '',
    notify: true,
  });

  const [message, setMessage] = useState('');

  // 🌷 Load existing settings
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
        });
      }
    })();
  }, []);

  // 💫 Save settings
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
      user_id: user.id,
      start_date: form.start_date,
      cycle_length: parseInt(form.cycle_length || '0', 10),
      notify: form.notify,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      setMessage('Error saving settings ❌');
    } else {
      setMessage('Settings saved successfully 💖');
      setTimeout(() => router.push('/dashboard'), 1500);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F3] to-[#FFEAE3] overflow-y-auto pb-24 px-5 pt-8">
      {/* 🌸 Header */}
      <h1 className="text-center font-playfair italic text-2xl text-rose-900 mb-1">
        Settings
      </h1>
      <p className="text-center text-sm text-rose-700/70 mb-8">
        Tune your flow and comfort preferences.
      </p>

      {/* 🌷 Input Card */}
      <div className="max-w-md mx-auto rounded-3xl bg-white/40 backdrop-blur-xl p-6 space-y-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)]">
        {/* Cycle Start Date */}
        <div>
          <label className="block text-sm font-medium text-rose-800 mb-1">
            Cycle start date
          </label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
            className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] 
                       px-4 py-3 text-rose-900 shadow-inner focus:ring-2 
                       focus:ring-rose-200 focus:outline-none placeholder:text-rose-300"
          />
        </div>

        {/* Cycle Length */}
        <div>
          <label className="block text-sm font-medium text-rose-800 mb-1">
            Cycle length (days)
          </label>
          <input
            type="number"
            min={21}
            max={40}
            value={form.cycle_length}
            onChange={(e) => setForm({ ...form, cycle_length: e.target.value })}
            className="w-full rounded-full bg-gradient-to-r from-[#FFF9F3] to-[#FFEAE3] 
                       px-4 py-3 text-rose-900 shadow-inner focus:ring-2 
                       focus:ring-rose-200 focus:outline-none placeholder:text-rose-300"
          />
        </div>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-rose-800">
            Enable notifications
          </label>
          <button
            onClick={() => setForm({ ...form, notify: !form.notify })}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
              form.notify ? 'bg-rose-300/70' : 'bg-rose-100'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                form.notify ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* 💖 Save Button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#FFF9F3] to-transparent p-5">
        <button
          onClick={saveSettings}
          className="w-full rounded-full bg-gradient-to-r from-[#FFD7C8] to-[#F7A7A7] 
                     text-white py-3 font-medium shadow-[0_8px_25px_rgba(255,180,170,0.4)]
                     active:scale-[.98] transition-all"
        >
          Save Settings
        </button>
      </div>

      {/* ✨ Message */}
      {message && (
        <p className="text-center text-sm text-rose-700 mt-3">{message}</p>
      )}

      {/* 🌙 Footer */}
      <p className="text-center text-rose-700/60 italic mt-6 mb-10">
        ✨ Your rhythm, your rules. ✨
      </p>
    </div>
  );
}
