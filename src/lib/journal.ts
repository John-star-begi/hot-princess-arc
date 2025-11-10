// src/lib/journal.ts
import { supabase } from '@/lib/supabaseClient';
import { cycleDay, phaseForDay } from '@/lib/phase';

export type JournalForm = {
  // 🔥 Warmth & Temperature
  warm_after_eating?: 'no_cold' | 'somewhat' | 'comfortably_warm';
  hands_feet_warmth?: number; // 1-5
  temp_morning_c?: number | null;
  temp_evening_c?: number | null;

  // ⚡ Energy & Mood
  energy_level?: number; // 1-5
  mood_stability?: number; // 1-5
  mid_afternoon_slump?: boolean | null;
  anxiety?: 'none' | 'mild' | 'moderate' | 'high';

  // 🍽️ Digestion & Appetite
  appetite?: 'low' | 'normal' | 'strong';
  bloating2?: 'none' | 'mild' | 'severe';
  post_meal?: 'sleepy' | 'stable' | 'energized';
  bowel?: 'normal' | 'loose' | 'hard' | 'greasy';

  // 💗 Hormonal Signals
  breast_tenderness?: 'none' | 'mild' | 'noticeable';
  discharge?: 'dry' | 'sticky' | 'creamy' | 'watery_eggwhite';
  libido?: 'low' | 'normal' | 'high';

  // 🦴 Hair / Skin / Nails
  hair_shedding?: 'none' | 'slight' | 'noticeable';
  skin?: 'glowing' | 'dry' | 'oily' | 'breaking_out';
  nails?: 'strong' | 'peeling' | 'brittle';

  // 💪 Training & Recovery
  activity?: 'rest' | 'walk' | 'pilates' | 'weights';
  effort?: number; // 1-5
  felt_energized?: boolean | null;

  // 🧂 Electrolytes & Hydration
  salt_craving?: 'none' | 'mild' | 'strong';
  oj_salt_honey?: boolean | null;
  cramps_twitches?: boolean | null;

  // 🌙 Sleep
  bedtime?: string | null; // '21:30'
  woke?: string | null;     // '06:45'
  fell_asleep_easily?: boolean | null;
  night_wakings?: number | null; // 0..3

  // ✍️ One-Line Reflection
  one_line_reflection?: string;

  // 🌕 Cycle-aware reflections
  // Menstrual
  m_flow?: 'light' | 'normal' | 'heavy';
  m_clotting?: 'none' | 'mild' | 'frequent';
  m_cramps_pain?: number; // 1-5
  m_energy_recovery_by_day3?: boolean | null;
  m_mood_calmness?: number; // 1-5
  m_warmth_returning?: boolean | null;
  m_digestion_improving?: boolean | null;

  // Follicular
  f_energy_rising?: boolean | null;
  f_motivation_focus_better?: boolean | null;
  f_water_retention?: boolean | null;
  f_skin_clarity?: 'improving' | 'same' | 'worse';
  f_anxiety_or_restlessness?: boolean | null;
  f_basal_temp_stable?: boolean | null;

  // Ovulation
  o_sign_mucus_clear?: boolean | null;
  o_sign_midcycle_pain?: boolean | null;
  o_sign_high_libido?: boolean | null;
  o_sign_breast_tenderness?: boolean | null;
  o_felt_strong?: boolean | null;
  o_inflammation?: boolean | null;
  o_sleep_quality?: 'good' | 'poor';
  o_appetite_change?: 'increase' | 'decrease';

  // Luteal
  l_temperature_stable?: boolean | null;
  l_mood_stability?: 'good' | 'irritable' | 'low';
  l_sleep_quality?: 'good' | 'interrupted';
  l_cravings?: string[] | null; // ['sugar', 'fat', 'salt']
  l_pms_signs?: 'none' | 'mild' | 'strong';
  l_pre_spotting?: boolean | null;
  l_energy?: number; // 1-5

  // Legacy kept for read pages if present
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
  return data as { start_date: string; cycle_length: number } | null;
}

export async function loadJournal(userId: string, date: string) {
  const { data, error } = await supabase
    .from('journals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  if (error) console.error('Error loading journal:', error);
  return data as any;
}

export async function saveJournal(
  userId: string,
  date: string,
  form: JournalForm,
  userSettings?: { start_date: string; cycle_length: number }
) {
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

