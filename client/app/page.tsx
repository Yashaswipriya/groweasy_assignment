"use client";

import { useCallback, useState } from "react";
import FileUpload from "../components/FileUpload";
import CsvPreviewTable from "../components/CsvPreviewTable";
import ResultsTable from "../components/ResultsTable";
import ImportSummary from "../components/ImportSummary";
import Stepper, { StepIndex } from "../components/Stepper";
import { parseCsvForPreview } from "../lib/csvParser";
import { importCsv } from "../lib/api";
import { CsvPreview, ImportResult } from "../types/crm";

type Stage = "upload" | "preview" | "processing" | "results";

const STAGE_TO_STEP: Record<Stage, StepIndex> = {
  upload: 0,
  preview: 1,
  processing: 2,
  results: 3,
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback(async (selected: File) => {
    setError(null);
    try {
      const parsed = await parseCsvForPreview(selected);
      setFile(selected);
      setPreview(parsed);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read this CSV file.");
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!file) return;
    setStage("processing");
    setError(null);
    try {
      const res = await importCsv(file);
      setResult(res);
      setStage("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed. Please try again.");
      setStage("preview");
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStage("upload");
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 font-mono text-sm font-bold text-white">
              G
            </div>
            <span className="text-sm font-semibold tracking-wide text-slate-800">GrowEasy</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">CSV Lead Importer</h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload any CSV export and let AI map it into your CRM format.
          </p>
        </header>

        <div className="mb-10">
          <Stepper current={STAGE_TO_STEP[stage]} />
        </div>

        {stage === "upload" && (
          <section>
            <FileUpload onFileSelected={handleFileSelected} error={error} />
          </section>
        )}

        {stage === "preview" && preview && (
          <section className="space-y-5">
            <CsvPreviewTable
              headers={preview.headers}
              rows={preview.rows}
              totalRows={preview.totalRows}
            />
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleConfirm}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Confirm Import
              </button>
              <button
                onClick={handleReset}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Choose a different file
              </button>
            </div>
          </section>
        )}

        {stage === "processing" && (
          <section className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-24 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
            <p className="mt-4 text-sm font-medium text-slate-600">
              Mapping your leads into CRM format&hellip;
            </p>
            <p className="mt-1 font-mono text-xs text-slate-400">
              this can take a moment for larger files
            </p>
          </section>
        )}

        {stage === "results" && result && (
          <section className="space-y-5">
            <ImportSummary
              totalRows={result.totalRows}
              totalImported={result.totalImported}
              totalSkipped={result.totalSkipped}
            />
            <ResultsTable imported={result.imported} skipped={result.skipped} />
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Import another file
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
