import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, phase, text } = body as { date: string; phase: string; text: string };

    // simple placeholder analysis – later replace with real AI call
    const analysis =
      `journal analysis for ${date} (${phase} phase)\n\n` +
      `this is a rough high level reflection based on your answers.\n\n` +
      `key notes:\n` +
      `- warm up signs: check warmth scores and temps\n` +
      `- energy and mood: check if energy is below 3 or mood stability is low\n` +
      `- digestion: bloating, post meal sleepiness, bowel quality\n` +
      `- sleep and recovery: bedtime, night wakings, effort and felt energized.\n\n` +
      `full raw journal:\n\n` +
      text;

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('analyze journal error', err);
    return NextResponse.json({ error: 'could not analyze' }, { status: 500 });
  }
}
