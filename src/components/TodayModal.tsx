"use client";
import { motion, AnimatePresence } from "framer-motion";
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
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Main Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative w-full sm:max-w-md mx-auto max-h-[90vh] overflow-hidden
                     rounded-2xl sm:rounded-3xl shadow-[0_8px_20px_rgba(245,175,160,0.25)] 
                     border border-[#FFE1DA] text-gray-800/90 font-[Poppins]
                     bg-[#FFE9E3]" /* ✅ matches gradient bottom tone */
        >
          {/* Scrollable Content */}
          <div className="overflow-y-auto scrollbar-hide p-6 sm:p-8 pb-14 bg-gradient-to-b from-[#FFF9F5] via-[#FFF3EF] to-[#FFE9E3] relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-[#FFE6E2]
                         flex items-center justify-center text-[#B35E6A] text-xl
                         shadow-sm hover:shadow-[0_0_6px_rgba(255,200,180,0.5)]
                         transition-transform duration-200 active:scale-95"
            >
              ×
            </button>

            {/* Hormonal Snapshot */}
            <div className="mb-5 rounded-xl bg-[#FFE1DA] border border-[#FFD7C8] py-3 px-4">
              <div className="text-sm font-semibold text-rose-700 uppercase tracking-wide mb-1">
                Hormonal Snapshot
              </div>
              <div className="text-sm text-gray-700/80">
                🌸 {data.phase.charAt(0).toUpperCase() + data.phase.slice(1)} phase — {data.overview}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Meals */}
              <section>
                <h3 className="text-lg font-[Playfair_Display] font-semibold text-rose-900 mb-3">
                  🍽 Meals
                </h3>
                <div className="grid gap-3">
                  {data.meals.map((m) => (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      key={m.title + m.time}
                      className="rounded-md bg-[#FFF3F0] border border-[#FFD7C8]
                                 shadow-[0_2px_6px_rgba(250,200,180,0.15)] 
                                 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] hover:bg-[#FFECE6]"
                    >
                      <div className="text-[15px] font-medium text-rose-800">
                        {m.time} — {m.title}
                      </div>
                      {m.notes && (
                        <div className="text-[14px] text-gray-700/80 mt-1 italic leading-relaxed">
                          {m.notes}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Movement */}
              <section>
                <h3 className="text-lg font-[Playfair_Display] font-semibold text-rose-900 mb-3">
                  💪 Movement
                </h3>
                <div className="grid gap-3">
                  {data.workouts.map((w, idx) => (
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      key={idx}
                      className="rounded-md bg-[#FFF3F0] border border-[#FFD7C8]
                                 shadow-[0_2px_6px_rgba(250,200,180,0.15)]
                                 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] hover:bg-[#FFECE6]"
                    >
                      <div className="text-[15px] font-medium text-rose-800">
                        {w.focus} • {w.intensity}
                      </div>
                      <ul className="text-[14px] text-gray-700/80 mt-1 list-disc pl-5 leading-relaxed">
                        {w.examples.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Supplements */}
              <section>
                <h3 className="text-lg font-[Playfair_Display] font-semibold text-rose-900 mb-3">
                  💊 Supplements
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.supplements.map((s) => (
                    <motion.span
                      whileTap={{ scale: 0.95 }}
                      key={s}
                      className="px-3 py-1.5 rounded-full bg-[#FFF3F0] border border-[#FFD7C8]
                                 text-[14px] text-gray-800/80 shadow-sm hover:bg-[#FFECE6]
                                 transition-all duration-200"
                    >
                      {s}
                    </motion.span>
                  ))}
                </div>
              </section>
            </div>

            {/* ✅ Moved fade INSIDE scrollable area */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#FFE9E3] via-transparent to-transparent pointer-events-none"></div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
