"use client";

import { useCallback, useRef, useState } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  error?: string | null;
}

export default function FileUpload({ onFileSelected, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith(".csv")) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
          isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-teal-600">
            <path
              d="M12 16V4M12 4L7 9M12 4l5 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-slate-800">
          Drop your CSV file here
        </p>
        <p className="mt-1 text-sm text-slate-500">or click to browse files</p>
        <p className="mt-4 font-mono text-xs text-slate-400">.csv only &middot; max 5MB</p>
      </div>
      {error && (
        <p className="mt-3 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
