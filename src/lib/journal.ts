// src/lib/journal.ts
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay } from '@/lib/phase';

export type JournalForm = {
  mood: number;
  energy: number;
  stress: number;
  warmth: number;
  bloating?: string;
  notes?: string;
  photo_url?: string;
};

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not logged in');
  return user;
}

export async function loadUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('settings')
    .select('start_date, cycle_length')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) console.error('Error loading settings:', error);
  return data;
}

export async function loadJournal(userId: string, date: string) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) console.error('Error loading journal:', error);
  return data;
}

export async function saveJournal(userId: string, date: string, form: JournalForm, userSettings?: { start_date: string; cycle_length: number }) {
  let phase = 'unknown';
  if (userSettings) {
    const startD = new Date(userSettings.start_date);
    const cd = cycleDay(new Date(date), startD, userSettings.cycle_length);
    phase = phaseForDay(cd);
  }

  const entry = {
    user_id: userId,
    date,
    phase,
    ...form,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('journals')
    .upsert(entry, { onConflict: 'user_id,date' });

  if (error) {
    console.error('Error saving journal:', error);
    return { success: false, message: 'Error saving ❌' };
  }

  return { success: true, message: `Saved ✅ (Phase: ${phase})` };
}
