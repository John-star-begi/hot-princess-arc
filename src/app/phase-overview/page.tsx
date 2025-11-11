/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";

// ---------------------------------------------
// Design helpers
// ---------------------------------------------

const PageWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-x-hidden">
    {/* Continuous pastel gradient canvas */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFF9F3] via-[#FFEAE3] to-[#FFD7C8]" />

    {/* Subtle organic texture overlay */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.7) 0 20%, transparent 30%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.7) 0 18%, transparent 28%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.7) 0 16%, transparent 26%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const Header: React.FC = () => (
  <header className="sticky top-0 z-30 backdrop-blur-xl bg-gradient-to-b from-white/40 to-transparent">
    <div className="mx-auto flex max-w-4xl items-center justify-center px-4 py-3">
      <h1 className="font-[var(--font-playfair,ui-serif)] italic text-[18px] text-rose-900">
        👑 Hot Princess Arc
      </h1>
    </div>
  </header>
);

// Reusable divider with soft gradient
const SoftDivider: React.FC = () => (
  <div className="mx-auto my-6 h-px w-24 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-rose-200" />
);

// Frosted card container
const PhaseCard: React.FC<
  React.PropsWithChildren<{
    accentFrom: string;
    accentTo: string;
    title: string;
    subtitle?: string;
    emoji?: string;
    mantra?: string;
  }>
> = ({ accentFrom, accentTo, title, subtitle, emoji, mantra, children }) => {
  return (
    <section
      className="mx-auto mb-12 w-full max-w-3xl rounded-3xl bg-white/40 p-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)] backdrop-blur-xl md:p-10"
      style={{
        boxShadow:
          "0 8px 30px rgba(255,180,170,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}
    >
      {/* Header accent bar */}
      <div
        className="mb-5 h-10 w-full rounded-2xl px-4 py-2 flex items-center"
        style={{
          backgroundImage: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
          opacity: 0.35,
        }}
      />
      <div className="mb-4 flex items-baseline gap-2">
        <h2 className="font-[var(--font-playfair,ui-serif)] italic text-[20px] md:text-[22px] text-[#7A5450]">
          {emoji ? `${emoji} ` : ""}
          {title}
        </h2>
        {subtitle ? (
          <span className="text-sm text-[#7A5450]/80 font-[var(--font-poppins,ui-sans-serif)]">
            {subtitle}
          </span>
        ) : null}
      </div>

      {mantra ? (
        <div className="mb-6 rounded-2xl bg-white/60 p-4 text-center shadow-inner">
          <p className="font-[var(--font-playfair,ui-serif)] italic text-[16px] text-rose-800">
            Mantra: {mantra}
          </p>
        </div>
      ) : null}

      {children}
    </section>
  );
};

// Accessible accordion using <details>
const ASection: React.FC<
  React.PropsWithChildren<{ title: string; emoji?: string; defaultOpen?: boolean; tint?: string }>
> = ({ title, emoji, defaultOpen, tint, children }) => (
  <details
    className="group mb-4 overflow-hidden rounded-2xl border border-rose-100/60 bg-white/70 transition"
    open={defaultOpen}
  >
    <summary className="cursor-pointer list-none px-4 py-3 font-[var(--font-playfair,ui-serif)] italic text-[17px] text-[#7A5450] outline-none transition hover:bg-white/80">
      <span className="mr-1">{emoji ?? "▾"}</span> {title}
    </summary>
    <div
      className="px-4 pb-4 pt-2 text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]"
      style={tint ? { backgroundColor: tint } : undefined}
    >
      {children}
    </div>
  </details>
);

// Tinted tip box
const Tip: React.FC<React.PropsWithChildren<{ tone?: "rose" | "mint" | "honey" | "lavender" }>> = ({
  children,
  tone = "rose",
}) => {
  const map: Record<typeof tone, { bg: string; border: string; text: string }> = {
    rose: {
      bg: "bg-rose-50/60",
      border: "border-rose-200",
      text: "text-rose-800",
    },
    mint: {
      bg: "bg-emerald-50/60",
      border: "border-emerald-200",
      text: "text-emerald-800",
    },
    honey: {
      bg: "bg-amber-50/60",
      border: "border-amber-200",
      text: "text-amber-800",
    },
    lavender: {
      bg: "bg-violet-50/60",
      border: "border-violet-200",
      text: "text-violet-800",
    },
  } as any;
  const t = map[tone];
  return (
    <div className={`my-3 rounded-xl border-l-4 p-4 italic ${t.bg} ${t.border} ${t.text}`}>
      {children}
    </div>
  );
};

// Phase end mantra line
const PhaseMantra: React.FC<{ text: string }> = ({ text }) => (
  <div className="mt-6 text-center font-[var(--font-playfair,ui-serif)] italic text-[15px] text-[#7A5450]">
    “{text}”
  </div>
);

// ---------------------------------------------
// Page content data
// ---------------------------------------------

const INTRO = {
  title: "🌹 Phase Overview Framework",
  sub: "Warmth. Rhythm. Renewal.",
};

export default function PhaseOverviewPage() {
  return (
    <PageWrap>
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 md:pt-12">
        {/* Intro */}
        <div className="mx-auto mb-10 text-center">
          <h1 className="font-[var(--font-playfair,ui-serif)] italic text-[26px] font-semibold text-[#7A5450]">
            {INTRO.title}
          </h1>
          <div className="mt-2 text-xs tracking-[0.18em] text-[#7A5450]/60 font-[var(--font-poppins,ui-sans-serif)]">
            {INTRO.sub}
          </div>
          <SoftDivider />
        </div>

        {/* Menstrual */}
        <PhaseCard
          emoji="🩸"
          title="Menstrual Phase"
          subtitle="Days 1 to 5"
          accentFrom="#FAD1D1"
          accentTo="#FFF6F1"
          mantra="Rest. Rebuild. Return inward."
        >
          <p className="mb-5 text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            This is the body’s natural reset when the uterine lining is shed and the hormonal system gently
            recalibrates. Energy moves inward. When supported well, warmth and steadiness replace fatigue or
            pain, and the body feels safe to rest.
          </p>

          <ASection title="Signs of Balance" emoji="🌿" defaultOpen>
            Bleeding is light to moderate with few clots. Cramps are minimal. The body stays warm and sleep remains deep.
            Emotions feel reflective but not heavy. These are signs that estrogen is not excessive, prostaglandins are low,
            and thyroid function is sustaining metabolism.
          </ASection>

          <ASection title="Nourishment and Care" emoji="🍯">
            Favor warm and easy to digest foods such as milk with honey, ripe fruit, gelatin based broths like oxtail or bone broth,
            soft eggs. Meals should be small and regular to keep blood sugar stable. Salt supports adrenal balance and helps maintain warmth.
            Avoid cold or raw foods that slow digestion. Create warmth around the body with socks and layers and heat pads. Drink mineral rich
            fluids like orange juice, coconut water, or honeyed tea.
          </ASection>

          <ASection title="Movement and Lifestyle" emoji="🧘‍♀️">
            This is a quiet phase. Gentle walks and slow stretching encourage circulation without stress. Avoid strenuous workouts or fasting
            which elevate cortisol. Early nights and deep rest help restore glycogen and stabilize the thyroid.
          </ASection>

          <ASection title="If You Feel Off" emoji="🕯️">
            <Tip tone="rose">
              Cramps or clots → Often due to prostaglandin or estrogen excess. Try a daily carrot salad, magnesium glycinate, and warm baths.
            </Tip>
            <Tip tone="rose">
              Fatigue or chilliness → May indicate low thyroid or glycogen. Increase sugar and salt through warm drinks or honey water.
            </Tip>
            <Tip tone="rose">
              Anxiety or low mood → Often linked to low progesterone or blood sugar dips. A warm cup of milk and honey before bed soothes nerves.
            </Tip>
          </ASection>

          <ASection title="Transition to Next Phase" emoji="➡️">
            As bleeding ends, increase fruit juice and protein gradually. Light movement such as walks or gentle Pilates awakens energy for the follicular phase.
          </ASection>

          <PhaseMantra text="Rest is not retreat. It is renewal." />
        </PhaseCard>

        {/* Follicular */}
        <PhaseCard
          emoji="🌱"
          title="Follicular Phase"
          subtitle="Days 6 to 13"
          accentFrom="#DFF5E9"
          accentTo="#FFFDF6"
          mantra="Awaken. Nourish. Rise with the sun."
        >
          <p className="mb-5 text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            This is the body’s rebuilding phase. Estrogen rises and the ovaries prepare follicles and metabolism strengthens.
            Energy returns, mood lifts, and warmth increases. It is a time to feed and train the body without overstimulation.
          </p>

          <ASection title="Signs of Balance" emoji="🌿" defaultOpen>
            Energy feels steady and creative. Skin is clear, digestion smooth, and mood optimistic. Discharge is light and clear.
            Warming body temperature and bright skin tone signal good thyroid recovery and balanced estrogen.
          </ASection>

          <ASection title="Nourishment and Care" emoji="🍊">
            Support the liver as it clears residual estrogen. Include a daily raw carrot salad, cooked greens, and coffee with milk.
            Eat frequent meals that combine simple sugars and protein such as fruit and eggs and dairy with a small starch serving in the evening if desired.
            Salt and hydration are essential to prevent cortisol surges. Morning sunlight helps regulate the thyroid and improve mood. Avoid skipping breakfast.
          </ASection>

          <ASection title="Movement and Lifestyle" emoji="🏋️‍♀️">
            This is the phase to rebuild fitness and metabolism. Pilates, light weights, posture work, and moderate walks are ideal.
            Keep intensity moderate to sustain thyroid energy without depleting glycogen.
          </ASection>

          <ASection title="If You Feel Off" emoji="🕯️">
            <Tip tone="mint">
              Bloating or puffiness → Linked to estrogen retention. Raw carrot salad, magnesium, and orange juice with salt help balance it.
            </Tip>
            <Tip tone="mint">
              Low energy → Suggests weak thyroid recovery. Add B vitamins such as liver once a week and honey between meals.
            </Tip>
            <Tip tone="mint">
              Anxiety or restlessness → Often from high serotonin or low blood sugar. Snack on fruit or juice throughout the day.
            </Tip>
          </ASection>

          <ASection title="Transition to Next Phase" emoji="➡️">
            In the days before ovulation, keep meals clean and light. Avoid heavy fats or starches. Ensure hydration and include Vitamin E rich foods to support ovulation.
          </ASection>

          <PhaseMantra text="Feed your fire, but keep it steady." />
        </PhaseCard>

        {/* Ovulation */}
        <PhaseCard
          emoji="🌕"
          title="Ovulation Phase"
          subtitle="Days 14 to 17"
          accentFrom="#FFE6A8"
          accentTo="#FFD9C1"
          mantra="Shine. Express. Flow freely."
        >
          <p className="mb-5 text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            Ovulation is the body’s high energy window. Warmth, libido, and creativity peak as estrogen reaches its height
            and progesterone begins to rise. It is a fertile and expressive time both physically and emotionally.
          </p>

          <ASection title="Signs of Balance" emoji="🌿" defaultOpen>
            Cervical mucus is clear and stretchy. Libido and confidence rise naturally. Body temperature feels warm but not overheated.
            Mood is buoyant and sleep remains easy. A healthy ovulation passes without inflammation, mood swings, or bloating.
          </ASection>

          <ASection title="Nourishment and Care" emoji="🥛">
            Keep meals light and clean to protect the delicate hormonal shift. Favor fruit and juice and honey and dairy.
            Eat small and regular protein portions every few hours. Avoid heavy starches and dense fats that slow liver function during the estrogen peak.
            Maintain inner warmth while avoiding external overheating. Drink fresh juice with a pinch of salt after workouts or long days.
          </ASection>

          <ASection title="Movement and Lifestyle" emoji="🏃‍♀️">
            This is the time for dynamic training such as glute and leg strength work and resistance sessions or creative movement.
            End physical activity with orange juice and salt to stabilize blood sugar. Protect recovery with adequate sleep.
          </ASection>

          <ASection title="If You Feel Off" emoji="🕯️">
            <Tip tone="honey">
              Cramps or inflammation → Common from estrogen spikes. Support with Vitamin E about two hundred IU, pomegranate juice, and a rest day.
            </Tip>
            <Tip tone="honey">
              Joint pain or headache → Can stem from serotonin rise. Add more sugar and salt and magnesium.
            </Tip>
            <Tip tone="honey">
              Mood drop → May reflect insufficient progesterone surge. Warm dairy drinks and extra sleep help balance it.
            </Tip>
          </ASection>

          <ASection title="Transition to Next Phase" emoji="➡️">
            After ovulation, gradually raise dietary fat and salt to support progesterone synthesis. Begin lowering training intensity and allow more rest.
          </ASection>

          <PhaseMantra text="Shine without strain. Protect your warmth." />
        </PhaseCard>

        {/* Luteal */}
        <PhaseCard
          emoji="🌙"
          title="Luteal Phase"
          subtitle="Days 18 to 28"
          accentFrom="#E9E0FF"
          accentTo="#FFE4EE"
          mantra="Soothe. Ground. Reflect inward."
        >
          <p className="mb-5 text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            This is the body’s integration phase. Progesterone dominates bringing calmness and warmth and emotional steadiness.
            Energy softens and sleep deepens and appetite rises slightly. When balanced this phase feels safe and grounded.
          </p>

          <ASection title="Signs of Balance" emoji="🌿" defaultOpen>
            Mood remains calm and clear. Body temperature stays gently elevated. Sleep is restorative. Hunger increases but digestion remains easy.
            There is no PMS and no water retention and no spotting.
          </ASection>

          <ASection title="Nourishment and Care" emoji="🍶">
            Support progesterone with warmth and steady meals. Warm milk with honey at night, pomegranate juice for antioxidants, and generous salt intake to ease water balance.
            Combine carbohydrates and fats thoughtfully. More sugars during the day and more fats toward evening. Avoid stress and stimulants that deplete progesterone.
            Keep the body warm. No cold showers. No bare feet on cold floors.
          </ASection>

          <ASection title="Movement and Lifestyle" emoji="🧘‍♀️">
            This is a time to slow down. Choose restorative exercise such as stretching and Pilates and gentle walks.
            Preserve energy and avoid extremes of heat or exhaustion.
          </ASection>

          <ASection title="If You Feel Off" emoji="🕯️">
            <Tip tone="lavender">
              PMS and cramps or anxiety → Usually from progesterone drop or estrogen rebound.
              Take Vitamin E every second day, add sugar and magnesium, and prioritize early sleep.
            </Tip>
            <Tip tone="lavender">
              Spotting → Indicates lingering estrogen dominance. A daily carrot salad and warm orange juice for a few days often help.
            </Tip>
            <Tip tone="lavender">
              Water retention or puffiness → Caused by aldosterone and stress. Increase salt and consciously relax the body.
            </Tip>
          </ASection>

          <ASection title="Transition to Next Phase" emoji="➡️">
            In the final two days, lighten fat intake and increase warm, sugar based foods like honeyed broth and fruit.
            This gentle transition helps the next menstrual phase begin smoothly and painlessly.
          </ASection>

          <PhaseMantra text="Quiet strength grows in softness." />
        </PhaseCard>

        {/* Closing Note */}
        <section className="mx-auto mt-14 w-full max-w-3xl rounded-3xl bg-white/50 p-6 text-center shadow-[0_8px_30px_rgba(255,180,170,0.25)] backdrop-blur-xl md:p-10">
          <div
            className="mx-auto mb-5 h-10 w-full rounded-2xl"
            style={{
              backgroundImage: "linear-gradient(90deg, #FAD1D1, #FFF6F1)",
              opacity: 0.35,
            }}
          />
          <h3 className="mb-3 font-[var(--font-playfair,ui-serif)] italic text-[20px] text-[#7A5450]">
            🌺 Closing Note
          </h3>
          <p className="mx-auto max-w-2xl text-[15px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            Your cycle is not a problem to fix but a rhythm to honor. Each phase brings its own wisdom
            such as rest and renewal and creation and reflection. When you live in sync with it, your body becomes predictable,
            your moods stabilise, and your sense of self deepens into ease.
          </p>
          <SoftDivider />
          <div className="mt-3 text-sm text-[#7A5450]">
            <div className="opacity-70 italic">HotPrincessArc Phase Framework</div>
            <div className="font-semibold tracking-wide">Warmth. Rhythm. Renewal.</div>
          </div>
        </section>

        {/* Optional quick nav back to dashboard */}
        <div className="mx-auto mt-10 flex max-w-3xl justify-center">
          <Link
            href="/dashboard"
            className="rounded-full bg-rose-600 px-5 py-2 text-sm text-white shadow-lg transition hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </PageWrap>
  );
}
