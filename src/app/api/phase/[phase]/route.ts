export const runtime = 'nodejs'
import { NextResponse } from "next/server";
import { getPhaseGuide, type PhaseSlug } from "@/lib/data/phasePlans";

export async function GET(
  _req: Request,
  ctx: { params: { phase: string } }
) {
  const phase = ctx.params.phase as PhaseSlug;

  if (!["menstrual", "follicular", "ovulation", "luteal"].includes(phase)) {
    return NextResponse.json({ error: "Invalid phase" }, { status: 400 });
  }

  const guide = await getPhaseGuide(phase);
  if (!guide) {
    return NextResponse.json({ error: "Phase not found" }, { status: 404 });
  }

  return NextResponse.json(guide);
}
