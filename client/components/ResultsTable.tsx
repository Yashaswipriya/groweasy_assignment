"use client";

import { useState } from "react";
import { CrmRecord, SkippedRecord } from "../types/crm";

interface ResultsTableProps {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

const STATUS_STYLES: Record<string, string> = {
  GOOD_LEAD_FOLLOW_UP: "bg-teal-50 text-teal-700 ring-teal-600/20",
  DID_NOT_CONNECT: "bg-slate-100 text-slate-600 ring-slate-500/20",
  BAD_LEAD: "bg-red-50 text-red-700 ring-red-600/20",
  SALE_DONE: "bg-blue-50 text-blue-700 ring-blue-600/20",
  "": "bg-slate-50 text-slate-400 ring-slate-400/20",
};

function StatusBadge({ status }: { status: string }) {
  const label = status ? status.replaceAll("_", " ") : "Unmapped";
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status] ?? STATUS_STYLES[""]}`}
    >
      {label}
    </span>
  );
}

const IMPORTED_COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "mobile_without_country_code", label: "Mobile" },
  { key: "company", label: "Company" },
  { key: "city", label: "City" },
  { key: "crm_status", label: "Status" },
  { key: "data_source", label: "Source" },
  { key: "created_at", label: "Created" },
  { key: "crm_note", label: "Note" },
];

export default function ResultsTable({ imported, skipped }: ResultsTableProps) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-slate-100 px-3 pt-3">
        {(["imported", "skipped"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-teal-600 text-teal-700"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {t === "imported" ? `Imported (${imported.length})` : `Skipped (${skipped.length})`}
          </button>
        ))}
      </div>

      <div className="max-h-[480px] overflow-auto">
        {tab === "imported" ? (
          imported.length === 0 ? (
            <EmptyState message="No records were imported." />
          ) : (
            <table className="w-full min-w-max border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  {IMPORTED_COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {imported.map((record, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    {IMPORTED_COLUMNS.map((c) => (
                      <td key={c.key} className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                        {c.key === "crm_status" ? (
                          <StatusBadge status={record.crm_status} />
                        ) : (
                          record[c.key] || <span className="text-slate-300">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : skipped.length === 0 ? (
          <EmptyState message="Nothing was skipped - every row had an email or mobile number." />
        ) : (
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr>
                <th className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reason
                </th>
                <th className="whitespace-nowrap border-b border-slate-200 px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original Row
                </th>
              </tr>
            </thead>
            <tbody>
              {skipped.map((s, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 text-amber-700">{s.reason}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                    {JSON.stringify(s.row)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="px-5 py-10 text-center text-sm text-slate-400">{message}</p>;
}
