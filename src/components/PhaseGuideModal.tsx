'use client'
import { usePhaseGuide } from '@/hooks/usePhaseGuide'

export default function PhaseGuideModal({
  phase,
  onClose,
}: {
  phase: string
  onClose: () => void
}) {
  const { data, loading, error } = usePhaseGuide(phase)

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!data) return <div className="p-6">No guide found.</div>

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-xl font-semibold mb-2 capitalize">
          {data.phase} Phase
        </h2>
        <p className="text-sm mb-4">{data.overview}</p>

        <section className="mb-4">
          <h3 className="font-medium mb-1">🍳 Meal Ideas</h3>
          <ul className="space-y-1 text-sm">
            {data.meals.map((m) => (
              <li key={m.title}>
                <b>{m.time}:</b> {m.title} <i>{m.notes}</i>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-4">
          <h3 className="font-medium mb-1">🏋️ Workouts</h3>
          <ul className="text-sm space-y-1">
            {data.workouts.map((w) => (
              <li key={w.focus}>
                {w.focus} ({w.intensity})
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-medium mb-1">💊 Supplements</h3>
          <ul className="text-sm list-disc list-inside">
            {data.supplements.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
