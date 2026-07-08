"use client";

interface CsvPreviewTableProps {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export default function CsvPreviewTable({ headers, rows, totalRows }: CsvPreviewTableProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-medium text-slate-700">Preview</p>
        <p className="font-mono text-xs text-slate-400">
          showing {rows.length} of {totalRows} rows
        </p>
      </div>
      <div className="max-h-[420px] overflow-auto rounded-b-2xl">
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h || `column_${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                {headers.map((_, ci) => (
                  <td key={ci} className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {row[ci] || <span className="text-slate-300">&mdash;</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
