// src/lib/data/phasePlans.ts

import { createClient } from '@/lib/supabaseClient'

// ✅ TYPES
export type PhaseSlug = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export interface Macros {
  protein_g: number
  sugar_g: number
  starches_g: number
  fat_g: number
}

export interface TodayPlan {
  phase: PhaseSlug
  overview: string
  macros: Macros
  meals: { time: string; title: string; notes?: string }[]
  workouts: { focus: string; intensity: string; examples: string[] }[]
  supplements: string[]
}

// ✅ 1. Determine the user’s current phase
export async function getUserCurrentPhase(userId: string): Promise<PhaseSlug | null> {
  const supabase = createClient()

  const { data: settings, error } = await supabase
    .from('settings')
    .select('start_date, cycle_length')
    .eq('user_id', userId)
    .single()

  if (error || !settings) return null

  const { start_date, cycle_length } = settings
  const now = new Date()
  const start = new Date(start_date)
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const dayInCycle = ((diffDays % cycle_length) + cycle_length) % cycle_length

  // Phase logic (already configured to your needs)
  if (dayInCycle < 5) return 'menstrual'
  if (dayInCycle < 13) return 'follicular'
  if (dayInCycle < 16) return 'ovulation'
  return 'luteal'
}

// ✅ 2. Fetch today’s plan based on user phase
export async function getTodayPlan(userId: string): Promise<TodayPlan | null> {
  const supabase = createClient()
  const phase = await getUserCurrentPhase(userId)
  if (!phase) return null

  // Fetch the phase overview and macros
  const { data: phaseData } = await supabase
    .from('phase_plans')
    .select('overview, protein_g, sugar_g, starches_g, fat_g')
    .eq('phase_slug', phase)
    .single()

  // Fetch meals
  const { data: mealsData } = await supabase
    .from('meal_options')
    .select('time, title, notes')
    .eq('phase_slug', phase)
    .order('time', { ascending: true })

  // Fetch workouts
  const { data: workoutsData } = await supabase
    .from('workout_plans')
    .select('focus, intensity, examples')
    .eq('phase_slug', phase)

  // Fetch supplements
  const { data: supplementsData } = await supabase
    .from('supplement_plans')
    .select('items')
    .eq('phase_slug', phase)

  if (!phaseData) return null

  return {
    phase,
    overview: phaseData.overview,
    macros: {
      protein_g: phaseData.protein_g,
      sugar_g: phaseData.sugar_g,
      starches_g: phaseData.starches_g,
      fat_g: phaseData.fat_g,
    },
    meals: mealsData || [],
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
  }
}

// ✅ 3. Fetch a full guide for a specific phase
export async function getPhaseGuide(phaseSlug: PhaseSlug): Promise<TodayPlan | null> {
  const supabase = createClient()

  const { data: phaseData } = await supabase
    .from('phase_plans')
    .select('overview, protein_g, sugar_g, starches_g, fat_g')
    .eq('phase_slug', phaseSlug)
    .single()

  const { data: mealsData } = await supabase
    .from('meal_options')
    .select('time, title, notes')
    .eq('phase_slug', phaseSlug)
    .order('time', { ascending: true })

  const { data: workoutsData } = await supabase
    .from('workout_plans')
    .select('focus, intensity, examples')
    .eq('phase_slug', phaseSlug)

  const { data: supplementsData } = await supabase
    .from('supplement_plans')
    .select('items')
    .eq('phase_slug', phaseSlug)

  if (!phaseData) return null

  return {
    phase: phaseSlug,
    overview: phaseData.overview,
    macros: {
      protein_g: phaseData.protein_g,
      sugar_g: phaseData.sugar_g,
      starches_g: phaseData.starches_g,
      fat_g: phaseData.fat_g,
    },
    meals: mealsData || [],
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
  }
}
