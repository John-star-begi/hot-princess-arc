import { trainingSeed } from '@/lib/training';
import { Phase } from '@/lib/phase';

export function TrainingCard({ phase }: { phase: Phase }) {
  const list = trainingSeed[phase];
  return (
    <div className="rounded p-3 border bg-white grid gap-2">
      <h4 className="font-semibold">Training</h4>
      <ul className="list-disc pl-5 text-sm">
        {list.map((x) => <li key={x}>{x}</li>)}
      </ul>
    </div>
  );
}
