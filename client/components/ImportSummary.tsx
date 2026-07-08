interface ImportSummaryProps {
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
}

export default function ImportSummary({ totalRows, totalImported, totalSkipped }: ImportSummaryProps) {
  const stats = [
    { label: "Total Rows", value: totalRows, accent: "text-slate-800" },
    { label: "Imported", value: totalImported, accent: "text-teal-600" },
    { label: "Skipped", value: totalSkipped, accent: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {s.label}
          </p>
          <p className={`mt-1 font-mono text-2xl font-semibold ${s.accent}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
