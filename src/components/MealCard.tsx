import { mealsSeed } from '@/lib/meals';
import { Phase } from '@/lib/phase';

export function MealCard({ phase }: { phase: Phase }) {
  const m = mealsSeed[phase];
  return (
    <div className="rounded p-3 border bg-white grid gap-2">
      <h4 className="font-semibold">Meals</h4>
      {Object.entries(m).map(([k, arr]) => (
        <div key={k}>
          <div className="font-medium capitalize">{k}</div>
          <ul className="list-disc pl-5 text-sm">
            {arr.map((x) => <li key={x}>{x}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
