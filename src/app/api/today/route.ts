import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { getTodayPlan } from "@/lib/data/phasePlans";

export const runtime = "nodejs";

export async function GET() {
  console.log("🔥 /api/today HIT");

  let supabase;
  try {
    supabase = createServerSupabase();
    console.log("✔ supabase created");
  } catch (err) {
    console.log("❌ Supabase init error:", err);
    return NextResponse.json({ error: "Supabase init failed" }, { status: 500 });
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  console.log("user:", user, "userErr:", userErr);

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  console.log("➡️ calling getTodayPlan");
  let plan;

  try {
    plan = await getTodayPlan(user.id);
    console.log("✔ plan from getTodayPlan:", plan);
  } catch (err) {
    console.log("❌ getTodayPlan crashed:", err);
    return NextResponse.json({ error: "getTodayPlan crashed" }, { status: 500 });
  }

  if (!plan) {
    console.log("❌ No plan returned");
    return NextResponse.json({ error: "No plan found" }, { status: 404 });
  }

  console.log("➡️ Loading meal_options from Supabase...");

  const { data: mealOptions, error: mealErr } = await supabase
    .from("meal_options")
    .select("id, phase_slug, time, title, notes")
    .eq("phase_slug", plan.phase);

  console.log("mealOptions:", mealOptions);
  console.log("mealErr:", mealErr);

  if (mealErr) {
    return NextResponse.json(
      { error: "Failed to load meal options" },
      { status: 500 }
    );
  }

  const grouped = {
    breakfast: [] as any[],
    lunch: [] as any[],
    dinner: [] as any[],
    snack: [] as any[],
  };

  (mealOptions || []).forEach((m) => {
    if (m.time === "breakfast") grouped.breakfast.push(m);
    else if (m.time === "lunch") grouped.lunch.push(m);
    else if (m.time === "dinner") grouped.dinner.push(m);
    else if (m.time === "snack") grouped.snack.push(m);
  });

  console.log("✔ grouped meal options:", grouped);

  console.log("➡️ Returning final JSON");

  return NextResponse.json({
    ...plan,
    options: grouped,
  });
}
