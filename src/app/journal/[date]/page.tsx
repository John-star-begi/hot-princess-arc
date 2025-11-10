'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser, loadJournal } from '@/lib/journal';

export default function JournalByDate() {
  const { date } = useParams<{ date: string }>();
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const user = await getUser();
        const existing = await loadJournal(user.id, date);
        setEntry(existing);
        setLoading(false);
      } catch {
        window.location.href = '/login';
      }
    })();
  }, [date]);

  if (loading)
    return (
      <div className="text-center text-rose-700/70 mt-20 animate-pulse">
        Loading your reflection…
      </div>
    );

  if (!entry)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="rounded-3xl bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)] p-8 space-y-4 max-w-md">
          <h1 className="font-serif italic text-rose-900 text-xl">Journal — {date}</h1>
          <p className="text-rose-700/70 italic">
            No reflections logged for this day 💭
          </p>
        </div>
        <a
          href="/dashboard"
          className="mt-6 text-sm text-rose-700/80 hover:text-rose-900 underline"
        >
          ← Back to Dashboard
        </a>
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] px-4 py-10">
      <div className="rounded-3xl bg-white/50 backdrop-blur-xl shadow-[0_8px_30px_rgba(255,180,170,0.25)] p-6 space-y-4 max-w-md w-full">
        <h1 className="text-center font-serif italic text-rose-900 text-xl mb-3">
          {new Date(date).toLocaleDateString('en-AU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </h1>

        <div className="grid gap-2 text-rose-800">
          <div className="flex justify-between">
            <span className="font-medium">Mood</span>
            <span>{entry.mood ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Energy</span>
            <span>{entry.energy ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Stress</span>
            <span>{entry.stress ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Warmth</span>
            <span>{entry.warmth ?? '—'}</span>
          </div>
          {entry.bloating && (
            <div className="flex justify-between">
              <span className="font-medium">Bloating</span>
              <span>{entry.bloating}</span>
            </div>
          )}
        </div>

        {entry.notes && (
          <div className="pt-3 border-t border-rose-100 mt-2">
            <p className="italic text-rose-700/80">“{entry.notes}”</p>
          </div>
        )}

        {entry.photo_url && (
          <div className="pt-3">
            <img
              src={entry.photo_url}
              alt="Journal photo"
              className="rounded-2xl shadow-md w-full object-cover"
            />
          </div>
        )}
      </div>

      <a
        href="/dashboard"
        className="mt-6 text-sm text-rose-700/80 hover:text-rose-900 underline"
      >
        ← Back to Dashboard
      </a>
    </div>
  );
}
