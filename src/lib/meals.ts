import type { Phase } from './phase';
export const mealsSeed: Record<Phase, { [k: string]: string[] }> = {
  menstrual: { breakfast: ["Warm milk + honey", "OJ + cheese", "Yogurt + stewed apples"], lunch: ["Scrambled eggs + potatoes", "Chicken + rice noodles", "Cottage cheese + rice + compote"], dinner: ["Oxtail soup + mash", "Chicken thigh + rice", "Ricotta + baked apples"] },
  follicular: { breakfast: ["Milk + honey + eggs", "Ricotta pancakes (rice flour)", "Yogurt + honey + banana"], lunch: ["Chicken breast + carrot salad + fruit", "Lean beef + white rice", "Cottage cheese + pineapple + rice"], dinner: ["Oxtail soup + rice noodles + veggies", "Liver (tiny) + potatoes", "Chicken soup + rice + parmesan"] },
  ovulation: { breakfast: ["OJ + milk + honey", "Yogurt + grapes + cocoa", "Ricotta + banana smoothie"], lunch: ["Cheese plate + stewed pears", "Chicken + carrot salad + fruit puree", "Lean beef + zucchini ribbons"], dinner: ["Oxtail soup (no starch)", "Buttered omelet + cooked veggies", "Frittata + fruit compote"] },
  luteal: { breakfast: ["Milk + honey + banana", "Yogurt + cocoa + berries", "Ricotta pancakes (rice flour)"], lunch: ["Omelet + mashed potatoes + carrot salad", "Roast chicken + rice + apples", "Beef chili (mild) + rice"], dinner: ["Oxtail/rice bowl", "Cottage cheese + fruit + small potato", "Chicken broth + rice + parmesan"] }
};
