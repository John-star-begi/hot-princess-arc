import { createServerSupabase } from "@/lib/supabaseServer";

export type PhaseSlug = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface Macros {
  protein_g: number;
  sugar_g: number;
  starches_g: number;
  fat_g: number;
}

export interface TodayPlan {
  phase: PhaseSlug;
  overview: string;
  macros: Macros;
  meals: { time: string; title: string; notes?: string | null }[]; // ALWAYS 5 items
  workouts: { focus: string; intensity: string; examples: string[] }[];
  supplements: string[];
  options?: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snack: any[];
  };
}

// ---------------------------------------------
// BASE 5-MEAL STRUCTURE FOR EACH PHASE
// ---------------------------------------------
const BASE_MEALS: Record<
  PhaseSlug,
  { time: string; title: string; notes?: string | null }[]
> = {
  menstrual: [
    { time: "breakfast", title: "Breakfast", notes: null },
    { time: "lunch", title: "Lunch", notes: null },
    { time: "dinner", title: "Dinner", notes: null },
    { time: "snack", title: "Snack", notes: null },
    { time: "snack", title: "Snack", notes: null },
  ],
  follicular: [
    { time: "breakfast", title: "Breakfast", notes: null },
    { time: "lunch", title: "Lunch", notes: null },
    { time: "dinner", title: "Dinner", notes: null },
    { time: "snack", title: "Snack", notes: null },
    { time: "snack", title: "Snack", notes: null },
  ],
  ovulation: [
    { time: "breakfast", title: "Breakfast", notes: null },
    { time: "lunch", title: "Lunch", notes: null },
    { time: "dinner", title: "Dinner", notes: null },
    { time: "snack", title: "Snack", notes: null },
    { time: "snack", title: "Snack", notes: null },
  ],
  luteal: [
    { time: "breakfast", title: "Breakfast", notes: null },
    { time: "lunch", title: "Lunch", notes: null },
    { time: "dinner", title: "Dinner", notes: null },
    { time: "snack", title: "Snack", notes: null },
    { time: "snack", title: "Snack", notes: null },
  ],
};

// ----------------------------------------------------
// Determine user’s current phase
// ----------------------------------------------------
export async function getUserCurrentPhase(userId: string): Promise<PhaseSlug | null> {
  const supabase = createServerSupabase();

  const { data: settings } = await supabase
    .from("settings")
    .select("start_date, cycle_length")
    .eq("user_id", userId)
    .single();

  if (!settings) return null;

  const { start_date, cycle_length } = settings;

  const now = new Date();
  const start = new Date(start_date);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const dayInCycle = ((diffDays % cycle_length) + cycle_length) % cycle_length;

  if (dayInCycle < 5) return "menstrual";
  if (dayInCycle < 13) return "follicular";
  if (dayInCycle < 16) return "ovulation";
  return "luteal";
}

// ----------------------------------------------------
// MAIN: Get TodayPlan (with fixed 5 meals)
// ----------------------------------------------------
export async function getTodayPlan(userId: string): Promise<TodayPlan | null> {
  const supabase = createServerSupabase();
  const phase = await getUserCurrentPhase(userId);
  if (!phase) return null;

  // Phase macros + overview
  const { data: phaseData } = await supabase
    .from("phase_plans")
    .select("overview, protein_g, sugar_g, starches_g, fat_g")
    .eq("phase_slug", phase)
    .single();

  if (!phaseData) return null;

  // FIXED 5 cards
  const mealsData = BASE_MEALS[phase];

  // Workouts
  const { data: workoutsData } = await supabase
    .from("workout_plans")
    .select("focus, intensity, examples")
    .eq("phase_slug", phase);

  // Supplements
  const { data: supplementsData } = await supabase
    .from("supplement_plans")
    .select("items")
    .eq("phase_slug", phase);

  // Meal OPTIONS for swiping
  const { data: allMealOptions } = await supabase
    .from("meal_options")
    .select("id, time, title, notes")
    .eq("phase_slug", phase);

  // Group options by type
  const grouped = {
    breakfast: [] as any[],
    lunch: [] as any[],
    dinner: [] as any[],
    snack: [] as any[],
  };

  (allMealOptions || []).forEach((m) => {
    if (m.time === "breakfast") grouped.breakfast.push(m);
    if (m.time === "lunch") grouped.lunch.push(m);
    if (m.time === "dinner") grouped.dinner.push(m);
    if (m.time === "snack") grouped.snack.push(m);
  });

  return {
    phase,
    overview: phaseData.overview,
    macros: {
      protein_g: phaseData.protein_g,
      sugar_g: phaseData.sugar_g,
      starches_g: phaseData.starches_g,
      fat_g: phaseData.fat_g,
    },
    meals: mealsData, // ✔ ALWAYS 5 slots ONLY
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
    options: grouped, // ✔ meal_options for swiping
  };
}

// ----------------------------------------------------
// Phase Guide (unchanged, but fixed to use BASE_MEALS too)
// ----------------------------------------------------
export async function getPhaseGuide(phaseSlug: PhaseSlug): Promise<TodayPlan | null> {
  const supabase = createServerSupabase();

  const { data: phaseData } = await supabase
    .from("phase_plans")
    .select("overview, protein_g, sugar_g, starches_g, fat_g")
    .eq("phase_slug", phaseSlug)
    .single();

  if (!phaseData) return null;

  const mealsData = BASE_MEALS[phaseSlug];

  const { data: workoutsData } = await supabase
    .from("workout_plans")
    .select("focus, intensity, examples")
    .eq("phase_slug", phaseSlug);

  const { data: supplementsData } = await supabase
    .from("supplement_plans")
    .select("items")
    .eq("phase_slug", phaseSlug);

  const { data: allMealOptions } = await supabase
    .from("meal_options")
    .select("id, time, title, notes")
    .eq("phase_slug", phaseSlug);

  const grouped = {
    breakfast: [] as any[],
    lunch: [] as any[],
    dinner: [] as any[],
    snack: [] as any[],
  };

  (allMealOptions || []).forEach((m) => {
    if (m.time === "breakfast") grouped.breakfast.push(m);
    if (m.time === "lunch") grouped.lunch.push(m);
    if (m.time === "dinner") grouped.dinner.push(m);
    if (m.time === "snack") grouped.snack.push(m);
  });

  return {
    phase: phaseSlug,
    overview: phaseData.overview,
    macros: {
      protein_g: phaseData.protein_g,
      sugar_g: phaseData.sugar_g,
      starches_g: phaseData.starches_g,
      fat_g: phaseData.fat_g,
    },
    meals: mealsData, // ✔ fixed 5 slots
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
    options: grouped,
  };
}
