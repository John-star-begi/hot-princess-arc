"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useTodayPlan } from "@/hooks/useTodayPlan";

export default function TodayModal({ onClose }: { onClose: () => void }) {
  const { data, loading, error } = useTodayPlan();

  if (loading)
    return (
      <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex items-center justify-center">
        <div className="text-base text-rose-800">Loading your plan…</div>
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
        <div className="text-rose-700">No plan found</div>
      </div>
    );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[3px] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Outer shell */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFF9F5] to-[#FFE9E3] shadow-[0_8px_20px_rgba(245,175,160,0.25)] border border-[#FFD7C8]/60 overflow-hidden sm:h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#FFE6E2] text-[#B35E6A] text-lg font-light shadow-[0_0_6px_rgba(255,200,180,0.25)] hover:shadow-[0_0_8px_rgba(255,200,180,0.5)] active:scale-95 transition-all duration-200"
          >
            ×
          </button>

          {/* Scrollable Content */}
          <div className="px-6 sm:px-8 py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-100/50 scrollbar-track-transparent">
            {/* Hormonal Snapshot Tile */}
            <div className="bg-[#FFE1DA] border border-[#FFD7C8] rounded-xl py-3 px-4 mb-5 shadow-[0_2px_6px_rgba(250,200,180,0.15)]">
              <h4 className="text-sm font-semibold text-rose-700 uppercase tracking-wide mb-1">
                Hormonal Snapshot
              </h4>
              <p className="text-[14px] text-gray-700/80 leading-relaxed">
                🌸 {data.phase.charAt(0).toUpperCase() + data.phase.slice(1)} —{" "}
                {data.overview}
              </p>
            </div>

            {/* Meals Section */}
            <section className="mb-6">
              <h3 className="font-playfair text-lg font-semibold text-rose-900 mb-3">
                🍽 Meals
              </h3>
              <div className="space-y-3">
                {data.meals.map((m) => (
                  <div
                    key={m.title + m.time}
                    className="rounded-lg py-4 px-5 bg-[#FFF3F0] border border-[#FFD7C8] shadow-[0_2px_6px_rgba(250,200,180,0.15)] hover:shadow-md hover:-translate-y-[1px] hover:bg-[#FFECE6] transition-all duration-200"
                  >
                    <div className="text-[15px] font-medium text-rose-800">
                      {m.time} — {m.title}
                    </div>
                    {m.notes ? (
                      <div className="text-[14px] text-gray-700/80 mt-1 italic leading-relaxed">
                        {m.notes}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            {/* Movement Section */}
            <section className="mb-6">
              <h3 className="font-playfair text-lg font-semibold text-rose-900 mb-3">
                💪 Movement
              </h3>
              <div className="space-y-3">
                {data.workouts.map((w, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg py-4 px-5 bg-[#FFF3F0] border border-[#FFD7C8] shadow-[0_2px_6px_rgba(250,200,180,0.15)] hover:shadow-md hover:-translate-y-[1px] hover:bg-[#FFECE6] transition-all duration-200"
                  >
                    <div className="text-[15px] font-medium text-rose-800">
                      {w.focus} • {w.intensity}
                    </div>
                    <ul className="text-[14px] text-gray-700/80 mt-1 list-disc pl-5 leading-relaxed">
                      {w.examples.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Supplements Section */}
            <section>
              <h3 className="font-playfair text-lg font-semibold text-rose-900 mb-3">
                💊 Supplements
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.supplements.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-full bg-[#FFF3F0] border border-[#FFD7C8] text-[14px] text-gray-800/85 shadow-sm hover:bg-[#FFECE6] transition-colors duration-200"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
