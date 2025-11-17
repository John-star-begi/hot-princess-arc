import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { getTodayPlan } from "@/lib/data/phasePlans";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createServerSupabase();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the existing plan for today
  const plan = await getTodayPlan(user.id);
  if (!plan) {
    return NextResponse.json({ error: "No plan found" }, { status: 404 });
  }

  // Load all meal options for this phase from public.meal_options
  const { data: mealOptions, error: mealErr } = await supabase
    .from("meal_options")
    .select("id, phase_slug, time, title, notes")
    .eq("phase_slug", plan.phase);

  if (mealErr) {
    return NextResponse.json(
      { error: "Failed to load meal options" },
      { status: 500 }
    );
  }

  // Group options by meal_time enum
  const grouped: {
    breakfast: any[];
    lunch: any[];
    dinner: any[];
    snack: any[];
  } = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  (mealOptions || []).forEach((m) => {
    if (m.time === "breakfast") grouped.breakfast.push(m);
    else if (m.time === "lunch") grouped.lunch.push(m);
    else if (m.time === "dinner") grouped.dinner.push(m);
    else if (m.time === "snack") grouped.snack.push(m);
  });

  // Return the original plan plus the grouped options
  return NextResponse.json({
    ...plan,
    options: grouped,
  });
}
