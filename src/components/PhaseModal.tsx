'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { phaseGuides, PhaseKey } from '@/lib/phaseGuides';

type Props = {
  open: boolean;
  onClose: () => void;
  phase: PhaseKey;
};

export default function PhaseModal({ open, onClose, phase }: Props) {
  const data = phaseGuides[phase];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="absolute left-1/2 top-10 -translate-x-1/2 w-[92%] max-w-lg rounded-2xl bg-white p-4 shadow-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{data.name} — Overview</h2>
              <button
                className="text-sm px-2 py-1 rounded bg-gray-100"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            {/* Focus */}
            <p className="mt-2 text-sm">{data.focus}</p>

            {/* Quick tiles */}
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <div className="rounded-lg border p-2">
                <div className="font-medium">Hormones</div>
                <div>Estrogen: {data.hormones.estrogen}</div>
                <div>Progesterone: {data.hormones.progesterone}</div>
                <div>Body temp: {data.bodyTemp}</div>
              </div>
              <div className="rounded-lg border p-2">
                <div className="font-medium">Training</div>
                <div>{data.training.focus}</div>
                <div className="text-gray-600">{data.training.frequency}</div>
              </div>
            </div>

            {/* Tabs (simple sections) */}
            <div className="mt-4 grid gap-3">
              <Section title="Nutrition">
                <p className="text-sm mb-1">{data.nutrition.goal}</p>
                <div className="text-sm">
                  <div>Protein: {data.nutrition.macros.protein}</div>
                  <div>Sugars: {data.nutrition.macros.sugars}</div>
                  <div>Starch: {data.nutrition.macros.starch}</div>
                  <div>Fat: {data.nutrition.macros.fat}</div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-medium mb-1">Examples</div>
                  <ul className="list-disc pl-5">
                    {data.nutrition.examples.map((m, i) => (
                      <li key={i}>
                        <span className="capitalize">{m.time}:</span> {m.label}
                      </li>
                    ))}
                  </ul>
                </div>
                {!!data.nutrition.notes?.length && (
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                    {data.nutrition.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                )}
              </Section>

              {!!data.supportiveFoods.length && (
                <Section title="Supportive foods">
                  <ul className="list-disc pl-5 text-sm">
                    {data.supportiveFoods.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </Section>
              )}

              {!!data.supplements.length && (
                <Section title="Supplements">
                  <ul className="list-disc pl-5 text-sm">
                    {data.supplements.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </Section>
              )}

              {!!data.lifestyle && (
                <Section title="Lifestyle">
                  <ul className="list-disc pl-5 text-sm">
                    {data.lifestyle.sleep && <li>Sleep: {data.lifestyle.sleep}</li>}
                    {data.lifestyle.warmth && <li>Warmth: {data.lifestyle.warmth}</li>}
                    {data.lifestyle.light && <li>Light: {data.lifestyle.light}</li>}
                    {data.lifestyle.tips?.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </Section>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="font-medium mb-1">{title}</div>
      {children}
    </div>
  );
}
