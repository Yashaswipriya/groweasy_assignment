const STEPS = ["Upload", "Preview", "Confirm", "Result"] as const;

export type StepIndex = 0 | 1 | 2 | 3;

export default function Stepper({ current }: { current: StepIndex }) {
  return (
    <ol className="flex items-center">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors ${
                  state === "done"
                    ? "bg-teal-600 text-white"
                    : state === "active"
                    ? "bg-teal-600 text-white ring-4 ring-teal-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {state === "done" ? "✓" : i + 1}
              </span>
              <span
                className={`text-sm font-medium ${
                  state === "upcoming" ? "text-slate-400" : "text-slate-800"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-3 h-px flex-1 transition-colors ${
                  i < current ? "bg-teal-600" : "bg-slate-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
