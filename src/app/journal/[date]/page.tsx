'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function JournalByDate() {
  const { date } = useParams<{ date: string }>();
  const [form, setForm] = useState({ mood: 5, energy: 5, stress: 5, notes: '' });
  const [message, setMessage] = useState('');

  // Load journal entry for this date
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) {
        window.location.href = '/login';
        return;
      }

      const { data: j } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', uid)
        .eq('date', date)
        .maybeSingle();

      if (j) {
        setForm({
          mood: j.mood ?? 5,
          energy: j.energy ?? 5,
          stress: j.stress ?? 5,
          notes: j.notes ?? '',
        });
      }
    })();
  }, [date]);

  // Save journal entry
  async function save() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const uid = user?.id;
    if (!uid) return;

    const { error } = await supabase.from('journals').upsert({
      user_id: uid,
      date,
      mood: form.mood,
      energy: form.energy,
      stress: form.stress,
      notes: form.notes,
    });

    if (error) setMessage('Error saving entry ❌');
    else setMessage('Saved ✅');
  }

  return (
    <div className="max-w-md mx-auto p-4 grid gap-3">
      <h1 className="text-xl font-semibold">Journal — {date}</h1>

      <label>Mood (1–10)</label>
      <input
        type="number"
        min={1}
        max={10}
        className="border p-2 rounded"
        value={form.mood}
        onChange={(e) =>
          setForm({ ...form, mood: parseInt(e.target.value || '5', 10) })
        }
      />

      <label>Energy (1–10)</label>
      <input
        type="number"
        min={1}
        max={10}
        className="border p-2 rounded"
        value={form.energy}
        onChange={(e) =>
          setForm({ ...form, energy: parseInt(e.target.value || '5', 10) })
        }
      />

      <label>Stress (1–10)</label>
      <input
        type="number"
        min={1}
        max={10}
        className="border p-2 rounded"
        value={form.stress}
        onChange={(e) =>
          setForm({ ...form, stress: parseInt(e.target.value || '5', 10) })
        }
      />

      <label>Notes</label>
      <textarea
        className="border p-2 rounded"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <button
        onClick={save}
        className="bg-princess-peach text-white px-3 py-2 rounded"
      >
        Save
      </button>

      {message && <p>{message}</p>}

      <a className="underline text-sm mt-4" href="/dashboard">
        ← Back to Dashboard
      </a>
    </div>
  );
}
