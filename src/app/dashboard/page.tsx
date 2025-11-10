"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { TodayBanner } from "@/components/TodayBanner";
import MonthCalendar from "@/components/MonthCalendar";
import TodayModal from "@/components/TodayModal";
import JournalModal from "@/components/JournalModal"; // ✅ added import
import { Charts } from "@/components/Charts";
import { cycleDay, phaseForDay } from "@/lib/phase";

type PhaseKey = "menstrual" | "follicular" | "ovulation" | "luteal";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [todayOpen, setTodayOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false); // ✅ new state
  const [todayPhase, setTodayPhase] = useState<PhaseKey | "unknown">("unknown");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const uid = user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("settings")
        .select("start_date, cycle_length")
        .eq("user_id", uid)
        .maybeSingle();

      if (data?.start_date && data?.cycle_length) {
        setSettings({
          start_date: data.start_date,
          cycle_length: Number(data.cycle_length),
        });

        const start = new Date(`${data.start_date}T00:00:00`);
        const d = cycleDay(new Date(), start, Number(data.cycle_length));
        const p = phaseForDay(d) as PhaseKey;
        setTodayPhase(p);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 pt-6 space-y-8">
      {/* 🌕 Today Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <TodayBanner settings={settings} />
      </motion.section>

      {/* 🍑 Quick Actions Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
        className="space-y-6"
      >
        {/* View Today’s Plan */}
        <button
          onClick={() => setTodayOpen(true)}
          className="w-full text-left rounded-[24px] p-5 bg-gradient-to-r from-[#FFD7C8] to-[#FFF3EB] shadow-[0_6px_24px_rgba(255,180,170,0.25)] hover:brightness-105 active:scale-[.99] transition"
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">🍑</span>
            <div>
              <div className="text-lg font-medium" style={{ color: "#7A5450" }}>
                View Today’s Plan
              </div>
              <div className="text-sm opacity-80" style={{ color: "#7A5450" }}>
                See your meals, movement, and supplements.
              </div>
            </div>
          </div>
        </button>

        {/* Log Journal — opens modal now */}
        <button
          onClick={() => setJournalOpen(true)}
          className="w-full text-left rounded-[24px] p-5 bg-gradient-to-r from-[#FFEDE4] to-[#FFF9F3] shadow-[0_6px_24px_rgba(255,180,170,0.25)] hover:brightness-105 active:scale-[.99] transition"
        >
          <div className="flex items-center gap-4">
            <span className="text-xl">🪞</span>
            <div>
              <div className="text-lg font-medium" style={{ color: "#7A5450" }}>
                Log Journal
              </div>
              <div className="text-sm opacity-80" style={{ color: "#7A5450" }}>
                Reflect and record your glow today.
              </div>
            </div>
          </div>
        </button>
      </motion.section>

      {/* 🌸 Calendar Section */}
      {settings && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="rounded-[28px] p-6 bg-[#FFF9F3]/70 backdrop-blur-md border border-white/40 shadow-sm"
        >
          <h3 className="font-serif italic text-[18px] text-rose-900 mb-3">Your Month</h3>
          <MonthCalendar startDate={settings.start_date} cycleLength={settings.cycle_length} />
          <div className="mt-4 text-right">
            <a href="/dashboard#year" className="text-rose-700/80 hover:text-rose-900 underline">
              View full year
            </a>
          </div>
        </motion.section>
      )}

      {/* 📈 Charts Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="rounded-[28px] p-6 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm"
      >
        <h3 className="font-serif text-[18px] text-rose-900 mb-4">Your Energy Flow</h3>
        <Charts />
      </motion.section>

      {/* 🕯️ Closing Affirmation */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: "easeInOut", delay: 0.1 }}
        className="pt-4"
      >
        <div className="mx-auto w-3/4 h-px bg-gradient-to-r from-transparent via-rose-200/60 to-transparent" />
        <p
          className="mt-4 text-center font-serif italic text-[16px]"
          style={{
            background: "linear-gradient(to right, #F5B8A9, #E1A3C1)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            letterSpacing: "0.2px",
          }}
        >
          ✨ You’re doing beautifully, even when you rest.
        </p>
      </motion.section>

      {/* Modals */}
      {todayOpen && <TodayModal onClose={() => setTodayOpen(false)} />}
      {journalOpen && <JournalModal onClose={() => setJournalOpen(false)} />} {/* ✅ Added */}
    </div>
  );
}
