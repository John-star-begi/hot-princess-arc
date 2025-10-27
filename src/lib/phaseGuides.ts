export type PhaseKey = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

type MacroSpec = {
  protein: string; // e.g. "80–90g"
  sugars: string;  // e.g. "150–200g"
  starch: string;  // e.g. "30–60g" or "none"
  fat: string;     // e.g. "35–45g"
};

type MealExample = {
  time: 'morning' | 'lunch' | 'evening' | 'snack';
  label: string;
};

type TrainingPlan = {
  focus: string;
  frequency: string; // e.g. "Rest, walking", "3x/week", "3–4x/week"
  notes?: string[];
};

type Guide = {
  name: string;
  focus: string;
  hormones: { estrogen: string; progesterone: string };
  bodyTemp: 'lowest' | 'moderate' | 'rising' | 'high';
  nutrition: {
    goal: string;
    macros: MacroSpec;
    examples: MealExample[];
    notes?: string[];
  };
  supportiveFoods: string[];
  supplements: string[];
  training: TrainingPlan;
  lifestyle?: {
    sleep?: string;
    warmth?: string;
    light?: string;
    tips?: string[];
  };
  rules?: string[];
};

export const phaseGuides: Record<PhaseKey, Guide> = {
  menstrual: {
    name: 'Menstrual',
    focus: 'Reduce inflammation, restore glycogen, rebuild thyroid balance.',
    hormones: { estrogen: 'low', progesterone: 'low' },
    bodyTemp: 'lowest',
    nutrition: {
      goal: 'Gentle digestion, anti-inflammatory, thyroid supportive.',
      macros: {
        protein: '80–90g',
        sugars: '150–200g (fruit, juice, honey)',
        starch: '30–60g (white rice or potatoes only if needed)',
        fat: '35–45g (coconut oil, butter)'
      },
      examples: [
        { time: 'morning', label: 'Warm milk + honey + cocoa OR OJ + cheese' },
        { time: 'lunch',   label: 'Eggs or chicken breast + fruit / juice' },
        { time: 'evening', label: 'Oxtail soup or chicken thigh + small rice/potato' },
        { time: 'snack',   label: 'Carrot salad; OJ sips' }
      ],
      notes: [
        'Avoid heavy fat + sugar combos in the same meal',
        'Daytime: sugar + protein, low fat',
        'Evening: fat + protein, no sugar'
      ]
    },
    supportiveFoods: ['Orange juice', 'Carrot salad', 'Bone broth / Oxtail soup'],
    supplements: ['Magnesium glycinate 300mg', 'Thiamine 100mg', 'Vitamin E (qod)'],
    training: {
      focus: 'Rest, walking, gentle Pilates',
      frequency: 'Low',
      notes: ['Prioritize warmth and recovery']
    },
    lifestyle: {
      sleep: 'Earlier bedtime, consistent wake',
      warmth: 'Keep body warm; avoid cold foods/drinks'
    }
  },

  follicular: {
    name: 'Follicular',
    focus: 'Detox estrogen, boost thyroid/liver, build energy for ovulation.',
    hormones: { estrogen: 'rising', progesterone: 'low' },
    bodyTemp: 'moderate',
    nutrition: {
      goal: 'Liver + thyroid support; estrogen control.',
      macros: {
        protein: '90–100g',
        sugars: '200–250g (honey, juice, fruit)',
        starch: 'Low 30–50g (occasional rice/potato, not daily)',
        fat: '40–50g'
      },
      examples: [
        { time: 'morning', label: 'Milk + honey + salt + boiled eggs' },
        { time: 'lunch',   label: 'Chicken breast + fruit + carrot salad' },
        { time: 'evening', label: 'Oxtail soup + rice noodles + buttered veggies' },
        { time: 'snack',   label: 'Pomegranate juice sips' }
      ],
      notes: [
        'Daytime carbs from honey/fruit/dairy',
        '4h gap (fast), then fat+protein dinner; no carbs at dinner'
      ]
    },
    supportiveFoods: ['Carrot salad (daily)', 'Oxtail/broth', 'Tiny liver once weekly', 'Pomegranate juice'],
    supplements: ['Magnesium', 'Thiamine'],
    training: {
      focus: 'Light weights / Pilates; build momentum',
      frequency: '3x/week',
      notes: ['Glute activation, posture, form']
    }
  },

  ovulation: {
    name: 'Ovulation',
    focus: 'Control inflammation, support ovulation, avoid endotoxin/starch.',
    hormones: { estrogen: 'highest', progesterone: 'rising' },
    bodyTemp: 'rising',
    nutrition: {
      goal: 'Avoid starch; use honey + fruit for energy + antioxidants.',
      macros: {
        protein: '100–110g',
        sugars: '250–300g (fruit, juice, honey)',
        starch: 'none',
        fat: '30–40g'
      },
      examples: [
        { time: 'morning', label: 'Fruits + honey only' },
        { time: 'lunch',   label: 'Fruit plate + low-fat dairy (milkshake: milk + honey + salt)' },
        { time: 'evening', label: 'Oxtail soup / buttered omelet + cooked veggies (no carbs)' },
        { time: 'snack',   label: 'Fruit juices throughout day' }
      ],
      notes: [
        'Day: honey, fruits, milk, cheese',
        '4h fast then fat+protein dinner (no carbs)'
      ]
    },
    supportiveFoods: ['Pomegranate juice', 'Dairy calcium', 'Carrot salad', 'Oxtail broth'],
    supplements: ['Magnesium (cramps)', 'Thiamine'],
    training: {
      focus: 'Peak strength (glute/legs/back)',
      frequency: '3–4x/week',
      notes: ['Post-workout: OJ + honey + salt to blunt cortisol']
    }
  },

  luteal: {
    name: 'Luteal',
    focus: 'Maintain progesterone, calm stress hormones, balance carbs & fats.',
    hormones: { estrogen: 'moderate', progesterone: 'high' },
    bodyTemp: 'high',
    nutrition: {
      goal: 'Support progesterone, ease digestion, control cravings.',
      macros: {
        protein: '90–100g',
        sugars: '180–220g (fruit, honey)',
        starch: '50–70g (rice/potato ok)',
        fat: '45–55g'
      },
      examples: [
        { time: 'morning', label: 'Low-fat dairy + honey + fruit' },
        { time: 'lunch',   label: 'Animal protein + starch + carrot salad' },
        { time: 'evening', label: 'Oxtail or meat + small starch' },
        { time: 'snack',   label: 'Fruit juice/fruit + dark chocolate / simple ice cream' }
      ],
      notes: [
        'Day: sugar meals (fruit, honey, juice, dairy)',
        'Evening: fat + protein (meat, butter, oxtail, eggs)'
      ]
    },
    supportiveFoods: ['Warm milk + honey', 'Pomegranate juice', 'Oxtail soup', 'Dark chocolate'],
    supplements: ['Magnesium', 'Thiamine', 'Vit E (optional, qod)'],
    training: {
      focus: 'Pilates, yoga, walking',
      frequency: 'Gentle, frequent movement',
      notes: ['Avoid overtraining to protect progesterone']
    }
  }
};
