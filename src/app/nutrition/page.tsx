/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// -------------------------
// Helpers
// -------------------------
const PageWrap: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-x-hidden">
    {/* Background gradient */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#FFF9F3] via-[#FFEAE3] to-[#FFD7C8]" />
    {/* Paper texture */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 10%, rgba(255,255,255,0.75) 0 18%, transparent 28%), radial-gradient(circle at 80% 25%, rgba(255,255,255,0.7) 0 16%, transparent 26%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.65) 0 14%, transparent 24%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const Header: React.FC = () => {
  const [opaque, setOpaque] = useState(0.6);
  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY;
      lastY = y;
      setOpaque(goingDown ? 0.45 : 0.7);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-lg transition-opacity"
      style={{ backgroundColor: `rgba(255,248,245,${opaque})` }}
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
  <div className="mx-auto my-6 h-px w-24 rounded-full bg-gradient-to-r from-rose-200 via-rose-100 to-rose-200" />
);

const SectionCard: React.FC<
  React.PropsWithChildren<{
    indexLabel: string;
    title: string;
    mantra?: string;
  }>
> = ({ indexLabel, title, mantra, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className="mx-auto my-6 w-full max-w-3xl rounded-3xl bg-white/40 p-6 shadow-[0_8px_30px_rgba(255,180,170,0.25)] backdrop-blur-xl md:p-8 space-y-4"
  >
    <div className="flex items-baseline gap-3">
      <h2 className="font-[var(--font-playfair,ui-serif)] italic text-[22px] md:text-[24px] text-[#7A5450]">
        {indexLabel} {title}
      </h2>
    </div>
    <div className="h-[2px] w-28 bg-gradient-to-r from-[#FFF4EA] via-[#FFE3D8] to-[#FFD7C8] rounded-full" />

    {mantra ? (
      <div className="rounded-2xl bg-[#FFEAE3]/70 backdrop-blur-md p-4 text-center shadow-inner">
        <p className="font-[var(--font-playfair,ui-serif)] italic text-[16px] text-[#6B4A44]">
          Mantra: {mantra}
        </p>
      </div>
    ) : null}

    {children}
  </motion.section>
);

// Collapsible block using <details> for accessibility
const Block: React.FC<React.PropsWithChildren<{ title: string; defaultOpen?: boolean }>> = ({
  title,
  defaultOpen,
  children,
}) => (
  <details
    className="group overflow-hidden rounded-2xl border border-rose-100/60 bg-white/70"
    open={defaultOpen}
  >
    <summary className="cursor-pointer list-none px-4 py-3 font-[var(--font-playfair,ui-serif)] italic text-[18px] text-[#8B5D54] outline-none transition hover:bg-white/80">
      {title}
    </summary>
    <div className="px-4 pb-4 pt-2 text-[15.5px] leading-8 text-[#5B3B34] font-[var(--font-poppins,ui-sans-serif)]">
      {children}
    </div>
  </details>
);

const Callout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="my-3 rounded-xl border-l-4 border-rose-200 bg-rose-50/60 p-4 italic text-rose-800">
    {children}
  </div>
);

const Bullet: React.FC<React.PropsWithChildren<{ icon?: string }>> = ({ icon = "🍯", children }) => (
  <li className="pl-1">
    <span className="mr-2">{icon}</span>
    <span className="align-middle">{children}</span>
  </li>
);

// Alternating rows table for sections V and IX
const SoftTable: React.FC<{
  headers: [string, string, string];
  rows: Array<[string, string, string, string?]>;
  iconCol?: boolean;
}> = ({ headers, rows, iconCol = false }) => (
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
            {iconCol && r[3] ? (
              <span className="mr-2">{r[3]}</span>
            ) : null}
            {r[0]}
          </div>
          <div className="p-3 text-[15px] text-[#5B3B34]">{r[1]}</div>
          <div className="p-3 text-[15px] text-[#5B3B34]">{r[2]}</div>
        </div>
      ))}
    </div>
  </div>
);

// Scroll to top rose
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
export default function NutritionPage() {
  return (
    <PageWrap>
      <Header />

      {/* Intro */}
      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-8 md:pt-12">
        <div className="mx-auto mb-10 text-center">
          <h1 className="font-[var(--font-playfair,ui-serif)] italic text-[26px] font-semibold text-[#7A5450]">
            🌹 Soft Princess Nutrition Doctrine
          </h1>
          <div className="mt-2 text-xs tracking-[0.18em] text-[#7A5450]/60 font-[var(--font-poppins,ui-sans-serif)]">
            Warmth. Rhythm. Nourishment.
          </div>
          <SoftDivider />
        </div>

        {/* I */}
        <SectionCard
          indexLabel="I."
          title="Foundations of Metabolic Eating"
          mantra="Eat to stay warm, calm, and grounded."
        >
          <p>
            Metabolic eating is not about control or clean perfection. It is about teaching your body that it is safe,
            fed, and loved. When warmth and sweetness return to your meals, your thyroid whispers back into life. When
            blood sugar stays steady, your stress hormones finally exhale.
          </p>
          <p className="mt-3">
            Each bite is a small act of safety, a reminder that healing does not come from deprivation, but from rhythm.
          </p>
          <Block title="The guiding principles" defaultOpen>
            <ul className="space-y-2">
              <Bullet icon="🍯">
                <span className="font-medium">Sugar as calm fuel:</span> ripe fruits, honey, juices, and milk sugars
                refill liver glycogen and tell cortisol to stand down.
              </Bullet>
              <Bullet icon="🥚">
                <span className="font-medium">Protein as steady structure:</span> eggs, dairy, gelatin, or tender
                ruminant meats give the amino acids your thyroid and reproductive hormones depend on.
              </Bullet>
              <Bullet icon="🧈">
                <span className="font-medium">Fats as quiet protectors:</span> butter, ghee, and coconut oil keep cell
                membranes stable and energy smooth.
              </Bullet>
              <Bullet icon="🕰️">
                <span className="font-medium">Rhythm over restriction:</span> eat every two to four hours. Never let
                your body wonder when the next warmth is coming.
              </Bullet>
              <Bullet icon="🔥">
                <span className="font-medium">Warmth as compass:</span> after eating, you should feel soft warmth in
                your hands and calm brightness in your head. That is how you know your metabolism is happy.
              </Bullet>
            </ul>
            <p className="mt-4">
              When this balance holds, blood sugar stabilises, the thyroid hums, and hormones begin to flow as they are
              meant to.
            </p>
          </Block>
        </SectionCard>

        {/* II */}
        <SectionCard indexLabel="II." title="Foods to Cherish">
          <p>
            Every woman needs her daily rhythm of comfort foods, simple and rich and forgiving. These are the ones that
            build steady warmth. Eat them warm, not cold. Let each one comfort rather than challenge your digestion.
          </p>
          <Block title="Sweetness" defaultOpen>
            Ripe fruits, orange juice, grape juice, honey, milk. They refill glycogen, the gentle storage sugar that
            keeps you calm between meals.
          </Block>
          <Block title="Protein">
            Milk, cheese, strained yogurt, soft eggs, gelatin, oxtail, lean beef or chicken. They rebuild cells and keep
            thyroid and progesterone strong.
          </Block>
          <Block title="Fats">
            Butter, ghee, coconut oil, a touch of light olive oil. They steady energy and reduce oxidative stress.
          </Block>
          <Block title="Mineral bearers">
            Dairy for calcium, citrus and coconut water for potassium, salt for sodium, cooked greens for magnesium.
            They keep nerves soft, muscles responsive, and water balanced.
          </Block>
          <Block title="Estrogen clearing foods">
            A daily carrot salad, cooked white mushrooms, and coffee with milk. They help the liver and gut process what
            no longer serves your hormones.
          </Block>
          <Block title="Broths and gelatin">
            Oxtail soup, slow cooked broth, or soft gelatin desserts. They bring glycine, the quiet amino acid of
            restoration and calm.
          </Block>
        </SectionCard>

        {/* III */}
        <SectionCard indexLabel="III." title="What to Leave Behind">
          <p>
            What we stop consuming can be as healing as what we begin. The body cannot thrive in an environment of
            stress oils, cold inputs, and long fasts.
          </p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🛑">
              Skip seed oils entirely such as canola, soy, sunflower, safflower, corn, rice bran, and grapeseed. They
              stiffen cell membranes and suppress thyroid fire.
            </Bullet>
            <Bullet icon="🥫">Avoid nut and seed butters, fryers, vegan spreads, and packaged snacks.</Bullet>
            <Bullet icon="🥗">Let go of raw salads and cold cruciferous greens. Cook them until tender.</Bullet>
            <Bullet icon="⏳">
              Never punish the body with fasting. The female nervous system needs rhythm, not deprivation.
            </Bullet>
          </ul>
          <Callout>
            Even your behavior matters. Warmth, sunlight, regular meals, and rest tell your hormones they are safe to
            produce beauty again.
          </Callout>
        </SectionCard>

        {/* IV */}
        <SectionCard indexLabel="IV." title="The Daily Rhythm" mantra="Feed your body before the world asks anything of it.">
          <p>
            The rhythm of eating shapes the rhythm of your hormones. Morning sunlight and sweetness set your thyroid and
            cortisol curve for the day. Stable meals protect your nervous system through every phase.
          </p>
          <Block title="Morning" defaultOpen>
            Eat within half an hour of waking. Orange juice with eggs or milk and honey sets your energy upright.
          </Block>
          <Block title="Midday">
            Frequent meals or snacks such as fruit and cheese or milk and honey or gelatin and juice every two to four
            hours.
          </Block>
          <Block title="Evening">Grounding dinner with protein and gentle fat. Avoid heavy sugars late.</Block>
          <Block title="Before bed">
            Warm milk with honey and salt quiets night cortisol and anxiety.
          </Block>
          <p className="mt-3">
            If you feel cold or shaky or irritable, you have simply gone too long without nourishment. Eat, breathe, and
            the body will settle again.
          </p>
        </SectionCard>

        {/* V */}
        <SectionCard indexLabel="V." title="When the Body Speaks">
          <SoftTable
            headers={["Signal", "What it is saying", "What to do"]}
            rows={[
              ["Cold hands or feet", "Glycogen or thyroid low", "Orange juice with salt, light movement, warmth", "🧊"],
              ["Cramps, PMS, tenderness", "Estrogen rising, progesterone low", "Carrot salad, magnesium, Vitamin E each second day", "🩸"],
              ["Fatigue after meals", "Too much fat or sluggish liver", "Choose fruit and dairy protein next, lighten fats", "😴"],
              ["Anxiety or irritability", "Blood sugar dip, adrenaline high", "Honey or juice with salt, magnesium glycinate at night", "😵‍💫"],
              ["Mid cycle headaches", "Serotonin or estrogen surge", "Sugar, salt, magnesium, rest early", "🤕"],
              ["Night waking", "Low liver glycogen, cortisol spike", "Warm milk with honey and a pinch of salt before bed", "🌙"],
              ["Water retention", "Sodium low, stress high", "Add salt to juice or meals, soften your schedule", "💧"],
              ["Constipation", "Low gelatin, magnesium, or fiber", "Carrot salad, broth, magnesium, warm tea", "🚿"],
              ["Hair shedding", "Low protein, low minerals", "Ensure ninety to one hundred ten grams protein daily, weekly liver, deep sleep", "💇‍♀️"],
            ]}
            iconCol
          />
          <p className="mt-3">The body is a gentle communicator. When you listen early, symptoms soften naturally.</p>
        </SectionCard>

        {/* VI */}
        <SectionCard indexLabel="VI." title="Craving Decoder">
          <SoftTable
            headers={["Craving", "What your body asks for", "How to respond"]}
            rows={[
              ["Sugar or sweets", "Liver glycogen low", "Fruit juice with a pinch of salt, milk with honey", "🍬"],
              ["Starches", "B vitamin need, comfort", "Fruit with honey and protein now, eggs or liver soon", "🥔"],
              ["Chocolate", "Magnesium need", "Cocoa with honey and milk, magnesium at night", "🍫"],
              ["Salt", "Sodium low, stress hormone rise", "Add salt to water or cheese, breathe deeper", "🧂"],
              ["High fat foods", "Energy instability", "Take fruit first, add a small butter or cheese", "🧈"],
              ["Pre period sweets", "Falling progesterone", "Honey, salt, and a little chocolate, pomegranate juice", "🍯"],
              ["Crunchy snacks", "Mineral desire, tension release", "Buttered potatoes or cheese with fruit", "🍟"],
              ["Coffee at night", "Exhaustion, low glycogen", "Replace with milk and honey, rest", "☕"],
            ]}
            iconCol
          />
          <p className="mt-3">
            Every craving has a purpose. Meeting it wisely builds trust between you and your metabolism.
          </p>
        </SectionCard>

        {/* VII */}
        <SectionCard indexLabel="VII." title="Eating Out, Softly">
          <p>
            Never starve yourself before a meal out. Have a small sugar and protein snack first, milk and honey or fruit
            with cheese.
          </p>
          <p className="mt-2">
            At restaurants, ask for butter only cooking, skip dressings and sauces made with oils, and choose simple
            foods such as eggs, steak, grilled chicken, potatoes, and cooked vegetables. If exposure to seed oils
            happens, let that be your only fat meal of the day. Have some Vitamin E with dinner, sip warm juice or broth
            later, and rest.
          </p>
          <p className="mt-2">
            Safety is not lost by one imperfect meal. What matters is returning to rhythm the next morning.
          </p>
        </SectionCard>

        {/* VIII */}
        <SectionCard indexLabel="VIII." title="Transitioning Gently">
          <p>If you are moving from a standard diet to this nourishing rhythm, go softly.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="1️⃣">Weeks one to two, add breakfast, eliminate seed oils, begin your daily carrot salad.</Bullet>
            <Bullet icon="2️⃣">
              Weeks three to four, replace snacks with fruit, juice, or dairy, keep starch only with dinner.
            </Bullet>
            <Bullet icon="3️⃣">
              Weeks five to six, reduce raw vegetables, add gelatin and broth, align exercise with your hormonal phase.
            </Bullet>
          </ul>
          <p className="mt-2">
            A few days of bloating or fatigue can appear while your metabolism relearns safety. Stay warm, keep salt
            near, and trust the process.
          </p>
        </SectionCard>

        {/* IX */}
        <SectionCard indexLabel="IX." title="Reading Your Body">
          <SoftTable
            headers={["What you notice", "Meaning", "Adjustment"]}
            rows={[
              ["Warmth and calm after eating", "Good glucose use", "Maintain rhythm", "🔥"],
              ["Afternoon slump", "Cortisol spike", "Add sugar and protein mid morning", "🌞"],
              ["Low morning temperature or pulse", "Slow thyroid", "Eat sooner, raise carbs", "🌡️"],
              ["PMS or spotting", "Estrogen dominance", "Carrot salad, Vitamin E, early sleep", "🩸"],
              ["Bloating after starch", "Endotoxin overload", "Swap for fruit, add broth", "💨"],
              ["Dull hair or skin", "Protein or micronutrient gap", "Add weekly liver, sunlight", "✨"],
            ]}
            iconCol
          />
          <p className="mt-3">
            Learning to interpret your own warmth, pulse, and energy is the truest form of body literacy.
          </p>
        </SectionCard>

        {/* X */}
        <SectionCard indexLabel="X." title="Gentle Stimulants and Treats">
          <p>Pleasure should never be an enemy.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="☕">
              <span className="font-medium">Coffee:</span> enjoy it only with milk, sugar, and salt, never fasted.
              Morning or midday only.
            </Bullet>
            <Bullet icon="🍫">
              <span className="font-medium">Chocolate:</span> a sensual source of magnesium, pair with sweetness or dairy.
            </Bullet>
            <Bullet icon="🍮">
              <span className="font-medium">Desserts:</span> best after movement or during ovulation high energy days.
              Keep fats pure and portions moderate.
            </Bullet>
          </ul>
          <p className="mt-2">When pleasure comes with safety and rhythm, it becomes nourishment.</p>
        </SectionCard>

        {/* XI */}
        <SectionCard indexLabel="XI." title="Restoring Metabolism, Not Cleansing It">
          <p>
            Cleanses and fasts promise renewal but often steal warmth. They lower thyroid output and raise stress
            hormones. Instead of cleansing, reset gently, eat small meals of fruit, juice, milk, or broth every two
            hours for a day or two. Rest, keep warm, and allow your liver to reset naturally.
          </p>
        </SectionCard>

        {/* XII */}
        <SectionCard indexLabel="XII." title="Seasonal and Circadian Flow">
          <p>Your metabolism listens to both sunlight and temperature.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="❄️">
              In colder months, eat more calories and warm textures such as cooked fruits, soups, cocoa, and butter at
              dinner.
            </Bullet>
            <Bullet icon="🌤️">
              In warmer months, lighten textures, hydrate with fruit and coconut water, and protect electrolytes with
              salt.
            </Bullet>
            <Bullet icon="🌞">
              Each morning, get sunlight within thirty minutes of waking. Each evening, lower light and screens. Rhythm
              and light matter as much as food.
            </Bullet>
          </ul>
        </SectionCard>

        {/* XIII */}
        <SectionCard indexLabel="XIII." title="Signs of Long Term Healing">
          <p>
            You will know this way of eating is taking root when warmth stays with you all day. Cycles lengthen to
            twenty six to thirty two days, PMS fades, and sleep feels deeper. Your skin softens, hair thickens, mood
            steadies, and training feels strong without exhaustion. Change comes quietly, through hundreds of small,
            gentle meals that say, you are safe.
          </p>
        </SectionCard>

        {/* XIV */}
        <SectionCard indexLabel="XIV." title="The Psychology of Nourishment">
          <p>
            Food is not a test, it is a form of care. When you eat with warmth and patience, your body stops bracing
            for famine. Sweetness soothes the nervous system. Salt anchors it. Regularity teaches safety. Healing
            happens not from rules but from rhythm. Metabolism is the physical language of trust.
          </p>
        </SectionCard>

        {/* XV */}
        <SectionCard indexLabel="XV." title="Supplements as Support, Not Substitutes">
          <p>Keep them few, gentle, and purposeful.</p>
          <ul className="mt-2 space-y-2">
            <Bullet icon="🌙">Magnesium glycinate, three hundred to four hundred mg nightly.</Bullet>
            <Bullet icon="🌞">Thiamine, one hundred mg with breakfast.</Bullet>
            <Bullet icon="🛡️">Vitamin E, one hundred to two hundred IU every second day.</Bullet>
            <Bullet icon="☀️">Vitamin D, sunlight first, supplement only if truly low.</Bullet>
            <Bullet icon="🥩">Liver, a small weekly serving.</Bullet>
            <Bullet icon="🧂">Salt with each meal, potassium from fruit, calcium from dairy.</Bullet>
          </ul>
        </SectionCard>

        {/* XVI */}
        <SectionCard indexLabel="XVI." title="Cycle Aware Nourishment Notes">
          <ul className="space-y-2">
            <Bullet icon="🩸">
              <span className="font-medium">Menstrual:</span> warm and soft foods, sugars over starches, broths, milk,
              honey. Avoid cold salads and caffeine excess.
            </Bullet>
            <Bullet icon="🌱">
              <span className="font-medium">Follicular:</span> frequent sugar and protein pairings, daily carrot salad,
              keep evenings light.
            </Bullet>
            <Bullet icon="🌕">
              <span className="font-medium">Ovulation:</span> fresh fruit and dairy, minimal starch. Rest if tension or
              headache arises.
            </Bullet>
            <Bullet icon="🌙">
              <span className="font-medium">Luteal:</span> sugar snacks by day, protein fat dinners, warm milk with
              honey before bed, lighten fats as the period nears.
            </Bullet>
          </ul>
        </SectionCard>

        {/* XVII */}
        <SectionCard indexLabel="XVII." title="The Forty Eight Hour Reset">
          <p>
            If your warmth fades, anxiety rises, or digestion falters, strip back to simplicity. Eat every two hours,
            juice, milk, broth, cheese, gelatin. Take magnesium at night, carrot salad daily, and rest early. Return to
            your usual rhythm when comfort returns.
          </p>
        </SectionCard>

        {/* Closing reflection */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mx-auto mt-12 w-full max-w-3xl rounded-3xl bg-gradient-to-b from-[#FFE4D9] to-[#FFF3EA] p-8 text-center shadow-[0_8px_30px_rgba(255,180,170,0.25)]"
        >
          <h3 className="mb-3 font-[var(--font-playfair,ui-serif)] italic text-[20px] text-[#7A5450]">
            🌺 Closing Reflection
          </h3>
          <p className="mx-auto max-w-2xl text-[16px] leading-8 text-[#5C3C35] font-[var(--font-poppins,ui-sans-serif)]">
            Soft Princess Nutrition is not a diet, it is a rhythm of safety. Through warmth, sweetness, and consistency,
            your metabolism remembers how to trust life again. Each balanced meal is a quiet promise, you no longer have
            to fight to survive.
          </p>
          <p className="text-center italic text-rose-700 mt-6">✨ Warmth is safety. Safety is beauty. ✨</p>
        </motion.section>
      </main>

      <ScrollTop />
    </PageWrap>
  );
}
