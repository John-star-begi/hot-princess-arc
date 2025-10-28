export const runtime = 'nodejs'
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";
import { getTodayPlan } from "@/lib/data/phasePlans";

export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const plan = await getTodayPlan(user.id);
  if (!plan) {
    return NextResponse.json({ error: "No plan found" }, { status: 404 });
  }

  return NextResponse.json(plan);
}
