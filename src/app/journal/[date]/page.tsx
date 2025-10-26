'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay } from '@/lib/phase';

export default function JournalByDate() {
  const { date } = useParams<{ date: string }>();
  const [form, setForm] = useState({
    mood: 5,
    energy: 5,
    stress: 5,
    warmth: 5,
    bloating: '',
    notes: '',
    photo_url: '',
  });
  const [message, setMessage] = useState('');
  const [userSettings, setUserSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);

  // Load user settings and existing journal entry
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = user?.id;
      if (!uid) {
        window.location.href = '/login';
        return;
      }

      // Load cycle settings (start date + cycle length)
      const { data: s } = await supabase
        .from('settings')
        .select('start_date, cycle_length')
        .eq('user_id', uid)
        .maybeSingle();
      if (s) setUserSettings(s);

      // Load existing journal entry if present
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
          warmth: j.warmth ?? 5,
          bloating: j.bloating ?? '',
          notes: j.notes ?? '',
          photo_url: j.photo_url ?? '',
        });
      }
    })();
  }, [date]);

  // Save or update entry
  async function save() {
    const { data: { user } } = await supabase.auth.getUser();
    const uid = user?.id;
    if (!uid) return;

    // Calculate phase automatically if settings exist
    let phase = 'unknown';
    if (userSettings) {
      const startD = new Date(userSettings.start_date);
      const cd = cycleDay(new Date(date), startD, userSettings.cycle_length);
      phase = phaseForDay(cd);
    }

    const entry = {
      user_id: uid,
      date,
      phase,
      mood: form.mood,
      energy: form.energy,
      stress: form.stress,
      warmth: form.warmth,
      bloating: form.bloating || null,
      notes: form.notes || null,
      photo_url: form.photo_url || null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('journals')
      .upsert(entry, { onConflict: 'user_id,date' });

    if (error) {
      console.error('Supabase error:', error);
      setMessage('Error saving entry ❌');
    } else {
      setMessage(`Saved ✅ (Phase: ${phase})`);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 grid gap-4">
      <h1 className="text-xl font-semibold text-center mb-2">
        Journal — {date}
      </h1>

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

      <label>Warmth (1–10)</label>
      <input
        type="number"
        min={1}
        max={10}
        className="border p-2 rounded"
        value={form.warmth}
        onChange={(e) =>
          setForm({ ...form, warmth: parseInt(e.target.value || '5', 10) })
        }
      />

      <label>Bloating</label>
      <textarea
        className="border p-2 rounded"
        placeholder="Describe any bloating, cramps, or changes"
        value={form.bloating}
        onChange={(e) => setForm({ ...form, bloating: e.target.value })}
      />

      <label>Notes</label>
      <textarea
        className="border p-2 rounded"
        placeholder="Anything you'd like to reflect on today?"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      <label>Photo URL (optional)</label>
      <input
        type="text"
        className="border p-2 rounded"
        placeholder="https://..."
        value={form.photo_url}
        onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
      />

      <button
        onClick={save}
        className="bg-princess-peach text-white px-3 py-2 rounded hover:bg-pink-400 transition"
      >
        Save
      </button>

      {message && <p className="text-center">{message}</p>}

      <a className="underline text-sm mt-4 text-center" href="/dashboard">
        ← Back to Dashboard
      </a>
    </div>
  );
}
