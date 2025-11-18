import { createServerSupabase } from "@/lib/supabaseServer";

console.log("📌 phasePlans.ts LOADED");

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
  meals: { time: string; title: string; notes?: string | null }[];
  workouts: { focus: string; intensity: string; examples: string[] }[];
  supplements: string[];
  options?: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snack: any[];
  };
}

console.log("📌 Initialising BASE_MEALS");

const BASE_MEALS: Record<
  PhaseSlug,
  { time: string; title: string; notes?: string | null }[]
> = {
  menstrual: [
    { time: "breakfast", title: "Breakfast" },
    { time: "lunch", title: "Lunch" },
    { time: "dinner", title: "Dinner" },
    { time: "snack", title: "Snack" },
    { time: "snack", title: "Snack" },
  ],
  follicular: [
    { time: "breakfast", title: "Breakfast" },
    { time: "lunch", title: "Lunch" },
    { time: "dinner", title: "Dinner" },
    { time: "snack", title: "Snack" },
    { time: "snack", title: "Snack" },
  ],
  ovulation: [
    { time: "breakfast", title: "Breakfast" },
    { time: "lunch", title: "Lunch" },
    { time: "dinner", title: "Dinner" },
    { time: "snack", title: "Snack" },
    { time: "snack", title: "Snack" },
  ],
  luteal: [
    { time: "breakfast", title: "Breakfast" },
    { time: "lunch", title: "Lunch" },
    { time: "dinner", title: "Dinner" },
    { time: "snack", title: "Snack" },
    { time: "snack", title: "Snack" },
  ],
};

export async function getUserCurrentPhase(
  userId: string
): Promise<PhaseSlug | null> {
  console.log("➡️ getUserCurrentPhase START", userId);

  const supabase = createServerSupabase();

  const { data: settings, error } = await supabase
    .from("settings")
    .select("start_date, cycle_length")
    .eq("user_id", userId)
    .single();

  console.log("settings:", settings, "error:", error);

  if (!settings) {
    console.log("❌ NO settings found");
    return null;
  }

  const { start_date, cycle_length } = settings;

  const now = new Date();
  const start = new Date(start_date);
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const dayInCycle = ((diffDays % cycle_length) + cycle_length) % cycle_length;

  let phase: PhaseSlug;

  if (dayInCycle < 5) phase = "menstrual";
  else if (dayInCycle < 13) phase = "follicular";
  else if (dayInCycle < 16) phase = "ovulation";
  else phase = "luteal";

  console.log("➡️ PHASE:", phase);

  return phase;
}

// ----------------------------------------------------

export async function getTodayPlan(
  userId: string
): Promise<TodayPlan | null> {
  console.log("➡️ getTodayPlan START for user:", userId);

  const supabase = createServerSupabase();

  const phase = await getUserCurrentPhase(userId);
  console.log("phase returned:", phase);

  if (!phase) {
    console.log("❌ No phase returned");
    return null;
  }

  const { data: phaseData, error: phaseErr } = await supabase
    .from("phase_plans")
    .select("overview, protein_g, sugar_g, starches_g, fat_g")
    .eq("phase_slug", phase)
    .single();

  console.log("phaseData:", phaseData, "phaseErr:", phaseErr);

  if (!phaseData) {
    console.log("❌ No phaseData found");
    return null;
  }

  const mealsData = BASE_MEALS[phase];
  console.log("BASE meals:", mealsData);

  const { data: workoutsData } = await supabase
    .from("workout_plans")
    .select("focus, intensity, examples")
    .eq("phase_slug", phase);

  const { data: supplementsData } = await supabase
    .from("supplement_plans")
    .select("items")
    .eq("phase_slug", phase);

  const { data: allMealOptions, error: mealOptError } = await supabase
    .from("meal_options")
    .select("id, time, title, notes")
    .eq("phase_slug", phase);

  console.log("allMealOptions:", allMealOptions, "mealOptError", mealOptError);

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

  console.log("grouped options:", grouped);

  return {
    phase,
    overview: phaseData.overview,
    macros: {
      protein_g: phaseData.protein_g,
      sugar_g: phaseData.sugar_g,
      starches_g: phaseData.starches_g,
      fat_g: phaseData.fat_g,
    },
    meals: mealsData,
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
    options: grouped,
  };
}

// ----------------------------------------------------

export async function getPhaseGuide(
  phaseSlug: PhaseSlug
): Promise<TodayPlan | null> {
  console.log("➡️ getPhaseGuide START", phaseSlug);

  const supabase = createServerSupabase();

  const { data: phaseData } = await supabase
    .from("phase_plans")
    .select("overview, protein_g, sugar_g, starches_g, fat_g")
    .eq("phase_slug", phaseSlug)
    .single();

  if (!phaseData) return null;

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
    meals: BASE_MEALS[phaseSlug],
    workouts: workoutsData || [],
    supplements: supplementsData?.[0]?.items || [],
    options: grouped,
  };
}

