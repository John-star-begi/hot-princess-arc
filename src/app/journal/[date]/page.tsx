'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, loadUserSettings, loadJournal, saveJournal, JournalForm } from '@/lib/journal';

export default function JournalByDate() {
  const { date } = useParams<{ date: string }>();
  const [form, setForm] = useState<JournalForm>({
    mood: 5, energy: 5, stress: 5, warmth: 5, bloating: '', notes: '', photo_url: '',
  });
  const [message, setMessage] = useState('');
  const [userSettings, setUserSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        const settings = await loadUserSettings(user.id);
        if (settings) setUserSettings(settings);

        const existing = await loadJournal(user.id, date);
        if (existing) setForm({
          mood: existing.mood ?? 5,
          energy: existing.energy ?? 5,
          stress: existing.stress ?? 5,
          warmth: existing.warmth ?? 5,
          bloating: existing.bloating ?? '',
          notes: existing.notes ?? '',
          photo_url: existing.photo_url ?? '',
        });
      } catch {
        window.location.href = '/login';
      }
    })();
  }, [date]);

  async function save() {
    try {
      const user = await getUser();
    const { message } = await saveJournal(user.id, date, form, userSettings ?? undefined);
      setMessage(message);
    } catch {
      setMessage('Error saving entry ❌');
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 grid gap-4">
      <h1 className="text-xl font-semibold text-center mb-2">Journal — {date}</h1>
      {/* ...your form JSX stays identical... */}
      <button onClick={save} className="bg-princess-peach text-white px-3 py-2 rounded hover:bg-pink-400 transition">Save</button>
      {message && <p className="text-center">{message}</p>}
      <a className="underline text-sm mt-4 text-center" href="/dashboard">← Back to Dashboard</a>
    </div>
  );
}

