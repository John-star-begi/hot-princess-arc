/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// -------------------------
// Shared layout helpers
// -------------------------
const PageWrap: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-x-hidden">
    {/* Dawn to dusk gradient drift */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFF9F3] via-[#FFEAE3] to-[#EED8E8]" />
    {/* Paper texture */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.75) 0 18%, transparent 28%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.7) 0 16%, transparent 26%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.65) 0 14%, transparent 24%)",
      }}
    />
    {/* Faint rising breath particles */}
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-10 top-1/3 h-40 w-40 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute right-0 bottom-16 h-32 w-32 rounded-full bg-white/10 blur-3xl animate-pulse" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

const Header: React.FC = () => {
  const [opaque, setOpaque] = useState(0.7);
  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;
      setOpaque(goingDown ? 0.5 : 0.75);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-lg transition-opacity"
      style={{ backgroundColor: `rgba(255,234,227,${opaque})` }} // bg-[#FFEAE3]/70
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-3">
        <h1 className="font-[var(--font-playfair,ui-serif)] italic text-[18px] text-rose-900">
          👑 Hot Princess Arc
        </h1>
      </div>
    </header>
  );
};

const SoftDivider: React.FC = () => (
  <div className="mx-auto my-6 h-px w-28 rounded-full bg-gradient-to-r from-[#FFE083] via-rose-200 to-[#FFE083]" />
);

// Flow card
const FlowCard: React.FC<
  React.PropsWithChildren<{
    indexLabel: string;
    title: string;
    mantra?: string;
  }>
> = ({ indexLabel, title, mantra, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 24, scale: 0.98 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className="mx-auto my-6 w-full max-w-3xl rounded-3xl bg-white/50 p-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)] backdrop-blur-xl md:p-8 space-y-4"
  >
    <div className="flex items-baseline gap-3">
      <h2 className="font-[var(--font-playfair,ui-serif)] italic text-[22px] md:text-[24px] text-[#7A5450]">
        {indexLabel} {title}
      </h2>
    </div>
    <div className="h-[2px] w-28 bg-gradient-to-r from-[#FFE3D8] via-[#FFE083] to-[#FFE3D8] rounded-full" />
    {mantra ? (
      <div className="rounded-2xl bg-[#FFEAE3]/70 text-[#6E4E46] italic text-center p-4 shadow-inner">
        <p className="font-[var(--font-playfair,ui-serif)] text-[16px]">
          Mantra: {mantra}
        </p>
      </div>
    ) : null}
    {children}
  </motion.section>
);

// Collapsible block
const Block: React.FC<React.PropsWithChildren<{ title: string; defaultOpen?: boolean }>> = ({
  title,
  defaultOpen,
  children,
}) => (
  <details className="group overflow-hidden rounded-2xl border border-rose-100/60 bg-white/70" open={defaultOpen}>
    <summary className="cursor-pointer list-none px-4 py-3 font-[var(--font-playfair,ui-serif)] italic text-[18px] text-[#8B5D54] outline-none transition hover:bg-white/80">
      {title}
    </summary>
    <div className="px-4 pb-4 pt-2 text-[15.5px] leading-8 text-[#5B3B34] font-[var(--font-poppins,ui-sans-serif)]">
      {children}
    </div>
  </details>
);

// Soft callout
const Callout: React.FC<React.PropsWithChildren<{ tone?: "rose" | "honey" | "lavender" }>> = ({
  children,
  tone = "rose",
}) => {
  const tones = {
    rose: "bg-rose-50/70 border-rose-200 text-rose-800",
    honey: "bg-amber-50/70 border-amber-200 text-amber-800",
    lavender: "bg-violet-50/70 border-violet-200 text-violet-800",
  };
  return <div className={`my-3 rounded-xl border-l-4 p-4 italic ${tones[tone]}`}>{children}</div>;
};

const Bullet: React.FC<React.PropsWithChildren<{ icon?: string }>> = ({ icon = "🌿", children }) => (
  <li className="pl-1">
    <span className="mr-2">{icon}</span>
    <span className="align-middle">{children}</span>
  </li>
);

// Soft list table
const SoftTable: React.FC<{
  headers: [string, string];
  rows: Array<[string, string, string?]>;
}> = ({ headers, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-rose-100/60 bg-white/60">
    <div className="grid grid-cols-2 gap-px bg-white/20">
      {headers.map((h, i) => (
        <div
          key={i}
          className="bg-white/60 p-3 text-[16px] font-[var(--font-playfair,ui-serif)] italic text-[#A96A61]"
        >
          {h}
        </div>
      ))}
    </div>
    <div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-2 border-t border-white/40 ${
            i % 2 === 0 ? "bg-[#FFF9F3]/80" : "bg-[#FFEAE3]/80"
          }`}
        >
          <div className="p-3 text-[15px] text-[#5B3B34]">
            {r[2] ? <span className="mr-2">{r[2]}</span> : null}
            {r[0]}
          </div>
          <div className="p-3 text-[15px] text-[#5B3B34]">{r[1]}</div>
        </div>
      ))}
    </div>
  </div>
);

// Three column table variant
const SoftTable3: React.FC<{
  headers: [string, string, string];
  rows: Array<[string, string, string, string?]>;
}> = ({ headers, rows }) => (
  <div className="overflow-hidden rounded-2xl border border-rose-100/60 bg-white/60">
    <div className="grid grid-cols-3 gap-px bg-white/20">
      {headers.map((h, i) => (
        <div
          key={i}
          className="bg-white/60 p-3 text-[16px] font-[var(--font-playfair,ui-serif)] italic text-[#A96A61]"
        >
          {h}
        </div>
      ))}
    </div>
    <div>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`grid grid-cols-3 border-t border-white/40 ${
            i % 2 === 0 ? "bg-[#FFF9F3]/80" : "bg-[#FFEAE3]/80"
          }`}
        >
          <div className="p-3 text-[15px] text-[#5B3B34]">
            {r[3] ? <span className="mr-2">{r[3]}</span> : null}
            {r[0]}
          </div>
          <div className="p-3 text-[15px] text-[#5B3B34]">{r[1]}</div>
          <div className="p-3 text-[15px] text-[#5B3B34]">{r[2]}</div>
        </div>
      ))}
    </div>
  </div>
);

// Phase chip
const PhaseChip: React.FC<React.PropsWithChildren<{ from: string; to: string; title: string; emoji: string }>> = ({
  from,
  to,
  title,
  emoji,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5 }}
    className="rounded-3xl p-5 shadow-lg shadow-rose-100/40"
    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
  >
    <div className="mb-2 font-[var(--font-playfair,ui-serif)] italic text-[18px] text-[#6B4A44]">
      {emoji} {title}
    </div>
    <div className="rounded-2xl bg-white/60 p-4 text-[#5B3B34] font-[var(--font-poppins,ui-sans-serif)] leading-8">
      {children}
    </div>
  </motion.div>
);

// Scroll to top
const ScrollTop: React.FC = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-40 rounded-full border border-rose-200 bg-rose-100/80 p-3 shadow-lg transition ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-label="Back to top"
      title="Back to top"
    >
      🌹
    </button>
  );
};

// -------------------------
// Page
// -------------------------
export default function MovementPage() {
  return (
    <PageWrap>
      <Header />

      {/* Intro */}
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 md:pt-12">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="mx-auto mb-10 w-full rounded-3xl bg-gradient-to-r from-[#FFE3D8] to-[#FFF9F3] p-8 text-center shadow-[0_8px_30px_rgba(255,180,170,0.25)]"
        >
          <h1 className="font-[var(--font-playfair,ui-serif)] italic text-[26px] font-semibold text-[#7A5450]">
            🩰 Soft Princess Movement Doctrine
          </h1>
          <p className="mt-2 text-[15.5px] leading-8 text-[#5B3B34] font-[var(--font-poppins,ui-sans-serif)]">
            A metabolic approach to feminine strength, rhythm, and recovery through every phase of the cycle.
          </p>
          <SoftDivider />
        </motion.section>

        {/* I */}
        <FlowCard indexLabel="I." title="Principles of Metabolic Movement" mantra="Move to nourish, not to drain.">
          <p>
            Movement, when done in sync with the body’s natural rhythm, becomes a form of therapy. It warms the blood,
            clears the lymph, and teaches your nervous system calm strength. The female metabolism thrives on
            circulation, not exhaustion. Your muscles, hormones, and thyroid need energy before effort.
          </p>
          <Block title="The core truths" defaultOpen>
            <ul className="mt-2 space-y-2">
              <Bullet icon="🍯">Energy before effort. Eat something sweet and protective before training. Sugar and protein lower cortisol and shield the thyroid.</Bullet>
              <Bullet icon="🕰️">Rhythm over intensity. The body blooms under consistency, not chaos. Gentle daily movement with short focused sessions builds more beauty than endless cardio.</Bullet>
              <Bullet icon="🌗">Cycle synchronization. Estrogen, progesterone, and thyroid tone shift each week. Your movement should shift with them.</Bullet>
              <Bullet icon="🔥">Warmth as readiness. Cold hands, feet, or muscles mean low oxidation. Eat or rest before you move.</Bullet>
              <Bullet icon="🦋">Quality before quantity. Feminine shape comes from posture, breath, and presence, not pain.</Bullet>
            </ul>
            <p className="mt-3">Your body is a warm organism, not a machine. Treat it that way and movement becomes metabolic care.</p>
          </Block>
        </FlowCard>

        {/* II */}
        <FlowCard indexLabel="II." title="Universal Movement Rhythms" mantra="Train warm, fueled, and loved.">
          <SoftTable
            headers={["Rule", "Why it matters"]}
            rows={[
              ["Move only after eating", "Prevents cortisol rise and supports thyroid and blood sugar.", "🌞"],
              ["Keep body warm", "Muscles contract best in warmth and cold suppresses oxidation.", "🔥"],
              ["Move every day, even gently", "Seven thousand to ten thousand steps keep lymph and hormones flowing.", "🚶‍♀️"],
              ["Prioritize posture", "An open chest frees breath and thyroid circulation.", "🧘‍♀️"],
              ["Avoid HIIT, fasting cardio, long depletion workouts", "They burn glycogen and signal stress.", "⚖️"],
              ["Rest during illness or heavy bleeding", "Recovery is metabolic work, not laziness.", "💤"],
              ["Track warmth and pulse", "Cold body or racing heart means stress greater than energy. Adjust.", "📈"],
            ]}
          />
          <p className="mt-3">Movement should build calm strength and never leave you shaky, cold, or inflamed.</p>
        </FlowCard>

        {/* III */}
        <FlowCard indexLabel="III." title="Movement Through the Cycle">
          <SoftTable3
            headers={["Phase", "Body tone and focus", "Best movements"]}
            rows={[
              ["Menstrual, Days one to five", "Energy dips and cooler body, focus on circulation and release", "Gentle walking, stretching, soft Pilates", "🩸"],
              ["Follicular, Days six to thirteen", "Energy lifting, build strength base", "Pilates, light weights, mobility", "🌱"],
              ["Ovulation, Days fourteen to seventeen", "Strong and radiant, shaping and expression", "Strength sessions, glute work, posture", "🌕"],
              ["Luteal, Days eighteen to twenty eight", "Warm with slower recovery, grounding and calming", "Yoga, reformer Pilates, walking", "🌙"],
            ]}
          />
          <p className="mt-3">The body rhythm is cyclical. Movement that honors it enhances hormone harmony and beauty at once.</p>
          {/* Pastel phase chips */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PhaseChip from="#FAD1D1" to="#FFF6F1" title="Menstrual" emoji="🩸">
              Blush to cream tint. Move softly and allow release.
            </PhaseChip>
            <PhaseChip from="#DFF5E9" to="#FFFDF6" title="Follicular" emoji="🌱">
              Mint to cream tint. Build foundation and coordination.
            </PhaseChip>
            <PhaseChip from="#FFE6A8" to="#FFD9C1" title="Ovulation" emoji="🌕">
              Gold to peach tint. Express strength with softness.
            </PhaseChip>
            <PhaseChip from="#E9E0FF" to="#FFE4EE" title="Luteal" emoji="🌙">
              Lavender to rose tint. Ground and restore.
            </PhaseChip>
          </div>
        </FlowCard>

        {/* IV */}
        <FlowCard indexLabel="IV." title="Menstrual Phase, Days one to five" mantra="Move softly, breathe deeply, and let the body exhale.">
          <p>During bleeding, the body turns inward. Circulation, warmth, and gentleness are the priorities. Move only to relieve cramps and support flow, not to train.</p>
          <Block title="Best choices" defaultOpen>
            <ul className="space-y-2">
              <Bullet icon="🚶‍♀️">Slow twenty to thirty minute walks in warmth or indoors.</Bullet>
              <Bullet icon="🧘‍♀️">Gentle hip and spine stretching.</Bullet>
              <Bullet icon="🦋">Breath centered Pilates or mobility flows.</Bullet>
              <Bullet icon="🛁">Optional, dry brushing or light sauna after day three if energy allows.</Bullet>
            </ul>
          </Block>
          <Callout tone="rose">Avoid heavy lifting, fast paced cardio, or cold studios. If energy is low, a warm bath or eight hours of sleep is your workout.</Callout>
        </FlowCard>

        {/* V */}
        <FlowCard indexLabel="V." title="Follicular Phase, Days six to thirteen" mantra="Rise gently. Build strength from grace, not from strain.">
          <p>As estrogen rises, your body wakes up. This is the phase to build foundation and coordination.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🗓️">Three to four sessions a week, forty to forty five minutes maximum.</Bullet>
            <Bullet icon="🦵">Emphasize posture, glute activation, and balance.</Bullet>
            <Bullet icon="🩰">Pilates, barre, and light resistance are ideal.</Bullet>
            <Bullet icon="💃">Small bursts of cardio such as dance or cycling only after a fruit or honey snack.</Bullet>
            <Bullet icon="💧">Keep intensity low enough that you leave energized, not shaky.</Bullet>
          </ul>
          <Callout tone="honey">Thyroid is still delicate here. Feed before every session, hydrate, and enjoy power returning.</Callout>
        </FlowCard>

        {/* VI */}
        <FlowCard indexLabel="VI." title="Ovulation Phase, Days fourteen to seventeen" mantra="Move with power, but protect your softness.">
          <p>This is your high energy confident window. Use it, and protect recovery.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🏋️‍♀️">Three to four strength sessions, forty to sixty minutes.</Bullet>
            <Bullet icon="🧠">Focus on glutes, legs, back, and posture lines.</Bullet>
            <Bullet icon="🔥">Ten minute warm up minimum, joints can be elastic.</Bullet>
            <Bullet icon="🍊">End sessions with orange juice and honey and salt to refill glycogen.</Bullet>
            <Bullet icon="🏖️">Great fits, resistance training, reformer Pilates, swimming laps, beach volleyball.</Bullet>
          </ul>
          <Callout tone="honey">Recovery support, gelatin or oxtail broth post training, Vitamin E if inflammation shows.</Callout>
          <p className="mt-2">Let strength feel sensual, not harsh.</p>
        </FlowCard>

        {/* VII */}
        <FlowCard indexLabel="VII." title="Luteal Phase, Days eighteen to twenty eight" mantra="Slow down to stay steady.">
          <p>Progesterone rises now. Warmth increases, recovery slows, and emotions deepen. Ground and reflect.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🗓️">Three light to moderate sessions a week, thirty to forty minutes.</Bullet>
            <Bullet icon="🧘‍♀️">Focus on deep breathing, flexibility, and alignment.</Bullet>
            <Bullet icon="🚶‍♀️">Choose yoga, Pilates, mobility work, or long walks.</Bullet>
            <Bullet icon="🌙">Stretch before bed to relax the nervous system.</Bullet>
          </ul>
          <Callout tone="lavender">If PMS begins, replace sessions with warm baths, magnesium, and stillness.</Callout>
          <p className="mt-2">This phase rewards slowness. Rushing here disrupts hormonal balance.</p>
        </FlowCard>

        {/* VIII */}
        <FlowCard indexLabel="VIII." title="Movement Beyond Workouts">
          <SoftTable3
            headers={["Time", "Practice", "Purpose"]}
            rows={[
              ["Morning", "Ten to fifteen minutes walk or mobility", "Awakens thyroid and natural cortisol rhythm", "🌞"],
              ["After meals", "Ten minutes slow walk", "Supports digestion and glucose balance", "🚶‍♀️"],
              ["Work hours", "Stretch or stand every forty five minutes", "Keeps circulation and posture open", "⌛"],
              ["Evening", "Light stretching or lymph brushing", "Reduces water retention and prepares for sleep", "🕯️"],
            ]}
          />
          <p className="mt-3">Think of this as metabolic housekeeping. Small acts keep energy moving without stress.</p>
        </FlowCard>

        {/* IX */}
        <FlowCard indexLabel="IX." title="Seasonal and Life Modifiers">
          <ul className="space-y-2">
            <Bullet icon="❄️">In colder seasons, stay indoors or layer up. Prioritize stretching, baths, and saunas to keep blood flow warm.</Bullet>
            <Bullet icon="🌤️">In warmer seasons, enjoy nature. Walks, ocean swims, and light sports boost serotonin and Vitamin D.</Bullet>
            <Bullet icon="🫶">High stress weeks, replace intensity with grounding movement. Stretching, breathwork, restorative yoga.</Bullet>
            <Bullet icon="🏖️">Vacations, skip structure. Dance, walk, and float. Circulation is enough.</Bullet>
          </ul>
          <p className="mt-3">Adaptability is feminine resilience. Movement should fit your life, not the other way around.</p>
        </FlowCard>

        {/* X */}
        <FlowCard indexLabel="X." title="Red Flags During Movement">
          <SoftTable3
            headers={["Sign", "Likely cause", "Correction"]}
            rows={[
              ["Cold or shaky after training", "Glycogen depletion", "Sugar and salt drink immediately", "❗"],
              ["Dizziness", "Low blood sugar", "Eat fruit or honey before moving", "🌀"],
              ["Cramps", "Low magnesium or hydration", "Add magnesium, salt, and water", "💧"],
              ["Soreness beyond forty eight hours", "Overload or poor recovery fuel", "Eat sugar and protein and rest fully", "⏳"],
              ["PMS worsens", "Too much cortisol", "Switch to walks or gentle Pilates and raise carbs", "⚠️"],
            ]}
          />
          <p className="mt-3">Your body whispers before it shouts. Listening early prevents hormonal backlash later.</p>
        </FlowCard>

        {/* XI */}
        <FlowCard indexLabel="XI." title="How to Build a Session">
          <ul className="space-y-2">
            <Bullet icon="🥤">Before, eat sugar and protein such as orange juice and cheese about thirty minutes prior.</Bullet>
            <Bullet icon="🌡️">Warm up, five to ten minutes of mobility until a light sweat forms.</Bullet>
            <Bullet icon="🧩">Main practice, twenty five to forty minutes of phase appropriate movement.</Bullet>
            <Bullet icon="🧘‍♀️">Cool down, five minutes of stretching and slow breathing.</Bullet>
            <Bullet icon="🍊">After, sugar and salt and protein within twenty minutes.</Bullet>
            <Bullet icon="🧥">Always keep the body warm. No cold showers or icy drinks post workout.</Bullet>
          </ul>
          <p className="mt-3">Warmth is the measure of safety. If you glow after training and do not feel chilled, you did it right.</p>
        </FlowCard>

        {/* XII */}
        <FlowCard indexLabel="XII." title="Recovery and Sleep Integration">
          <p>Healing happens in the spaces between movement.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🛌">Sleep seven and a half to eight and a half hours. Earlier bedtimes during luteal and menstrual phases.</Bullet>
            <Bullet icon="🛁">Heat therapy such as saunas, warm baths, or heating pads. Eases cramps and improves circulation.</Bullet>
            <Bullet icon="🥤">Electrolytes, sip orange juice with salt on long walks or warm days.</Bullet>
            <Bullet icon="💆‍♀️">Massage and rolling, gentle only. Avoid deep tissue while bleeding.</Bullet>
          </ul>
          <p className="mt-3">The softer your recovery, the stronger your metabolism becomes.</p>
        </FlowCard>

        {/* XIII */}
        <FlowCard indexLabel="XIII." title="Progress Markers">
          <div className="rounded-2xl bg-white/60 p-4">
            <ul className="space-y-3">
              <li>✅ Hands and feet stay warm after sessions</li>
              <li>🌿 Cycle remains regular and painless</li>
              <li>🕊 Mood stabilises and sleep deepens</li>
              <li>🍑 Glutes strengthen and posture lengthens</li>
              <li>⚡ You feel energised, not drained</li>
            </ul>
          </div>
          <p className="mt-3">The new feminine strength is warmth, not fatigue.</p>
        </FlowCard>

        {/* XIV */}
        <FlowCard indexLabel="XIV." title="The Psychology of Movement">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="mx-auto rounded-3xl bg-gradient-to-r from-[#FFE3D8] to-[#FFD7C8] p-6 text-center"
          >
            <p className="mx-auto max-w-2xl font-[var(--font-playfair,ui-serif)] italic text-[18px] text-[#6B4A44] leading-8">
              Movement is nourishment in motion. It is not about shrinking or earning food. It is about circulation, breath, and emotional steadiness. Sweat is not proof of success. Warmth, posture, and peace are.
            </p>
            <p className="mt-3 font-[var(--font-poppins,ui-sans-serif)] text-[#5B3B34]">
              Move to express, not to escape. The more gentle your discipline, the more your hormones trust you.
            </p>
          </motion.div>
        </FlowCard>

        {/* XV */}
        <FlowCard indexLabel="XV." title="A Gentle Weekly Flow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[
              ["Mon", "🌱 Follicular", "Pilates and walk"],
              ["Tue", "🌱 Follicular", "Light weights, glute work"],
              ["Wed", "🌱 Follicular", "Walk and stretch"],
              ["Thu", "🌕 Ovulation", "Strength session"],
              ["Fri", "🌕 Ovulation", "Gentle active rest"],
              ["Sat", "🌙 Luteal", "Yoga or swimming"],
              ["Sun", "🌙 Luteal", "Nature walk or rest"],
            ].map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="rounded-2xl bg-white/60 p-4 shadow-inner"
              >
                <div className="flex items-center justify-between">
                  <div className="font-[var(--font-playfair,ui-serif)] italic text-[#7A5450]">{d[0]}</div>
                  <div className="text-sm text-[#6B4A44]">{d[1]}</div>
                </div>
                <div className="mt-2 text-[#5B3B34]">{d[2]}</div>
              </motion.div>
            ))}
          </div>
          <p className="mt-3">Adapt the pattern to your rhythm. Your energy, not your calendar, is the real guide.</p>
        </FlowCard>

        {/* XVI */}
        <FlowCard indexLabel="XVI." title="Emergency Reset">
          <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F3] to-[#FFD7C8] p-6 text-center">
            <div className="mb-2 text-2xl">🕯️</div>
            <p className="text-[15.5px] text-[#5B3B34]">
              If you feel cold or anxious or fatigued, pause.
            </p>
            <ul className="mt-3 space-y-2 text-[#5B3B34]">
              <li>• For forty eight hours</li>
              <li>• Skip all strenuous training</li>
              <li>• Take two fifteen minute warm walks daily</li>
              <li>• Eat sugar and salt and protein frequently</li>
              <li>• Sleep early and stay warm</li>
            </ul>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-4 font-[var(--font-poppins,ui-sans-serif)] text-[#5B3B34]"
            >
              When your body feels steady and your hands are warm again, return to movement with softness.
            </motion.p>
          </div>
        </FlowCard>

        {/* Closing reflection */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mx-auto mt-12 w-full max-w-3xl rounded-3xl bg-gradient-to-b from-rose-100 to-[#FFF3EA] p-8 text-center shadow-[0_8px_30px_rgba(255,180,170,0.25)]"
        >
          <h3 className="mb-3 font-[var(--font-playfair,ui-serif)] italic text-[20px] text-[#6B4A44]">
            🌺 Closing Reflection
          </h3>
          <p className="mx-auto max-w-2xl text-[16px] leading-8 text-[#5B3B34] font-[var(--font-poppins,ui-sans-serif)]">
            Soft Princess Movement is a love language written in muscle, breath, and rhythm. It restores circulation where stress once froze it and teaches strength that never costs softness. Move like a woman who trusts her warmth, not one who fears losing it.
          </p>
          <p className="text-center italic text-rose-700 mt-6">✨ Strength is not in force, but in flow. ✨</p>
        </motion.section>
      </main>

      <ScrollTop />
    </PageWrap>
  );
}
