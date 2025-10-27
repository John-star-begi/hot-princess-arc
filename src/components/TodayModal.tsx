'use client'
import { useTodayPlan } from '@/hooks/useTodayPlan'

export default function TodayModal({ onClose }: { onClose: () => void }) {
  const { data, loading, error } = useTodayPlan()

  if (loading) return <div className="p-6">Loading your plan...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!data) return <div className="p-6">No plan found</div>

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-2">
          Today — {data.phase.charAt(0).toUpperCase() + data.phase.slice(1)}
        </h2>
        <p className="text-sm mb-4">{data.overview}</p>

        <section className="mb-4">
          <h3 className="font-medium mb-1">🍳 Meals</h3>
          <ul className="space-y-1 text-sm">
            {data.meals.map((m) => (
              <li key={m.title}>
                <b>{m.time}:</b> {m.title} <i>{m.notes}</i>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="font-medium mb-1">🏋️ Workout</h3>
          <ul className="text-sm space-y-1">
            {data.workouts.map((w) => (
              <li key={w.focus}>
                {w.focus} ({w.intensity})
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="font-medium mb-1">💊 Supplements</h3>
          <ul className="text-sm list-disc list-inside">
            {data.supplements.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-medium mb-1">⚖️ Macros</h3>
          <p className="text-sm">
            Protein {data.macros.protein_g} g • Sugar {data.macros.sugar_g} g •
            Starch {data.macros.starches_g} g • Fat {data.macros.fat_g} g
          </p>
        </section>
      </div>
    </div>
  )
}
