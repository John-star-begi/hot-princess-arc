'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Settings() {
  const [startDate, setStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id; if (!uid) { window.location.href = '/login'; return; }
      const { data: s } = await supabase.from('settings').select('*').eq('user_id', uid).maybeSingle();
      if (s) { setStartDate(s.start_date); setCycleLength(s.cycle_length); }
    });
  }, []);

  async function save() {
    const { data } = await supabase.auth.getUser(); const uid = data.user!.id;
    await supabase.from('settings').upsert({ user_id: uid, start_date: startDate, cycle_length: cycleLength });
    alert('Saved');
  }

  return (
    <div className="grid gap-3">
      <h1 className="text-xl font-semibold">Settings</h1>
      <label>Last period start</label>
      <input type="date" className="border p-2 rounded" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
      <label>Cycle length</label>
      <input type="number" min={21} max={40} className="border p-2 rounded" value={cycleLength} onChange={(e)=>setCycleLength(parseInt(e.target.value||'28'))} />
      <button onClick={save} className="bg-princess-peach px-3 py-2 rounded">Save</button>
    </div>
  );
}
