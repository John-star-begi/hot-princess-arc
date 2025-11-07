"use client";
import { useTodayPlan } from "@/hooks/useTodayPlan";

export default function TodayModal({ onClose }: { onClose: () => void }) {
  const { data, loading, error } = useTodayPlan();

  if (loading)
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        <div className="text-base">Loading your plan…</div>
      </div>
    );
  if (error)
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  if (!data)
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        <div>No plan found</div>
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]">
      <div className="absolute inset-x-0 bottom-0 top-0 sm:inset-y-8 sm:mx-auto sm:max-w-screen-sm">
        {/* Full height scrollable sheet on mobile */}
        <div className="relative bg-white rounded-t-3xl sm:rounded-3xl border border-pink-200 shadow-xl h-full sm:h-[88%] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-gray-500 text-2xl"
            aria-label="Close"
          >
            ×
          </button>

          <div className="p-4 space-y-4">
            <header className="pb-2 border-b border-pink-100">
              <h2 className="text-lg font-semibold">
                Today — {data.phase.charAt(0).toUpperCase() + data.phase.slice(1)}
              </h2>
              <p className="text-sm text-gray-600">{data.overview}</p>
            </header>

            <section>
              <h3 className="text-base font-medium mb-2">🍽 Meals</h3>
              <div className="grid gap-2">
                {data.meals.map((m) => (
                  <div
                    key={m.title + m.time}
                    className="rounded-2xl p-3 bg-pink-50/60 border border-pink-200 shadow-sm"
                  >
                    <div className="text-sm font-semibold">{m.time} — {m.title}</div>
                    {m.notes ? <div className="text-[13px] text-gray-700 mt-1 italic">{m.notes}</div> : null}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-base font-medium mb-2">💪 Movement</h3>
              <div className="grid gap-2">
                {data.workouts.map((w, idx) => (
                  <div key={idx} className="rounded-2xl p-3 bg-pink-50/60 border border-pink-200 shadow-sm">
                    <div className="text-sm font-semibold">
                      {w.focus} • {w.intensity}
                    </div>
                    <ul className="text-[13px] text-gray-700 mt-1 list-disc pl-5">
                      {w.examples.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="pb-4">
              <h3 className="text-base font-medium mb-2">💊 Supplements</h3>
              <div className="flex flex-wrap gap-2">
                {data.supplements.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-white border border-pink-200 text-[13px]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
