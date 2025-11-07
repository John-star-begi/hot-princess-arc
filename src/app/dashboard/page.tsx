"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { TodayBanner } from "@/components/TodayBanner";
import MonthCalendar from "@/components/MonthCalendar";
import TodayModal from "@/components/TodayModal";
import PhaseGuideModal from "@/components/PhaseGuideModal";
import { Charts } from "@/components/Charts";
import { cycleDay, phaseForDay } from "@/lib/phase";

type PhaseKey = "menstrual" | "follicular" | "ovulation" | "luteal";

export default function Dashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<{ start_date: string; cycle_length: number } | null>(null);
  const [todayOpen, setTodayOpen] = useState(false);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [todayPhase, setTodayPhase] = useState<PhaseKey | "unknown">("unknown");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
        setSettings({ start_date: data.start_date, cycle_length: Number(data.cycle_length) });

        // compute todays phase for banner buttons
        const start = new Date(`${data.start_date}T00:00:00`);
        const d = cycleDay(new Date(), start, Number(data.cycle_length));
        const p = phaseForDay(d) as PhaseKey;
        setTodayPhase(p);
      }
    })();
  }, []);

  return (
    <div className="px-3 pb-8 space-y-4">
      {/* Soft, phase aware banner */}
      <section className="pt-3">
        <TodayBanner settings={settings} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setTodayOpen(true)}
            className="rounded-2xl bg-white/80 border border-pink-200 py-3 text-sm shadow-sm active:scale-[.99]"
          >
            🍑 View Today’s Plan
          </button>
          <button
            onClick={() => setPhaseOpen(true)}
            className="rounded-2xl bg-white/80 border border-pink-200 py-3 text-sm shadow-sm active:scale-[.99]"
          >
            🌸 Phase Guide
          </button>
          <a
            href="/journal"
            className="rounded-2xl bg-gradient-to-r from-princess-rose to-princess-peach py-3 text-sm text-gray-800 text-center shadow-sm active:scale-[.99]"
          >
            ✍️ Log Journal
          </a>
        </div>
      </section>

      {/* Calendar */}
      {settings ? (
        <section className="rounded-3xl bg-white/70 border border-pink-200 shadow-sm p-3">
          <h3 className="text-base font-medium mb-1">Your month</h3>
          <MonthCalendar startDate={settings.start_date} cycleLength={settings.cycle_length} />
        </section>
      ) : null}

      {/* Charts */}
      <section className="rounded-3xl bg-white/70 border border-pink-200 shadow-sm p-3">
        <h3 className="text-base font-medium mb-1">Your flow insights</h3>
        <Charts />
      </section>

      {todayOpen && <TodayModal onClose={() => setTodayOpen(false)} />}
      {phaseOpen && <PhaseGuideModal phase={todayPhase} onClose={() => setPhaseOpen(false)} />}
    </div>
  );
}
