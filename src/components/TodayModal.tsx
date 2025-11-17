"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodayPlan, TodayPlanMeal, MealOption } from "@/hooks/useTodayPlan";

interface MealCardProps {
  baseMeal: TodayPlanMeal;
  options?: MealOption[];
}

function MealCard({ baseMeal, options }: MealCardProps) {
  const [index, setIndex] = useState(0);

  const safeOptions = options || [];
  const hasOptions = safeOptions.length > 0;

  const current = hasOptions ? safeOptions[index] : null;

  const title = current?.title ?? baseMeal.title;
  const notes = current?.notes ?? baseMeal.notes;

  function handleSwipe(_: any, info: { offset: { x: number } }) {
    if (!hasOptions || safeOptions.length < 2) return;

    const threshold = 40;

    if (info.offset.x < -threshold) {
      setIndex((prev) => (prev + 1) % safeOptions.length);
    } else if (info.offset.x > threshold) {
      setIndex((prev) => (prev - 1 + safeOptions.length) % safeOptions.length);
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className="rounded-md bg-[#FFF3F0] border border-[#FFD7C8]
                 shadow-[0_2px_6px_rgba(250,200,180,0.15)] 
                 p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] hover:bg-[#FFECE6]"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="text-[15px] font-medium text-rose-800">
          {baseMeal.time} — {title}
        </div>
        {notes && (
          <div className="text-[14px] text-gray-700/80 mt-1 italic leading-relaxed">
            {notes}
          </div>
        )}
        {hasOptions && safeOptions.length > 1 && (
          <div className="mt-1 text-[12px] text-gray-500">
            swipe left or right for another option
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

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

  const options = data.options || {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

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
          className="relative w-full sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto scrollbar-hide
                     rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FFF9F5] to-[#FFE9E3]
                     shadow-[0_8px_20px_rgba(245,175,160,0.25)] border border-[#FFE1DA]
                     p-6 sm:p-8 text-gray-800/90 font-[Poppins]"
        >
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
              🌸{" "}
              {data.phase.charAt(0).toUpperCase() + data.phase.slice(1)} phase —{" "}
              {data.overview}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 pb-4">
            {/* Meals Section */}
            <section>
              <h3 className="text-lg font-[Playfair_Display] font-semibold text-rose-900 mb-3">
                🍽 Meals
              </h3>
              <div className="grid gap-3">
                {data.meals.map((meal, index) => {
                  const timeKey = meal.time.toLowerCase(); // breakfast, lunch, dinner, snack
                  let mealOptions: MealOption[] = [];

                  if (timeKey === "breakfast") {
                    mealOptions = options.breakfast || [];
                  } else if (timeKey === "lunch") {
                    mealOptions = options.lunch || [];
                  } else if (timeKey === "dinner") {
                    mealOptions = options.dinner || [];
                  } else if (timeKey === "snack") {
                    mealOptions = options.snack || [];
                  }

                  return (
                    <MealCard
                      key={meal.title + meal.time + index}
                      baseMeal={meal}
                      options={mealOptions}
                    />
                  );
                })}
              </div>
            </section>

            {/* Movement Section */}
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

            {/* Supplements Section */}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
