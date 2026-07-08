import { ImportResult } from "../types/crm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function importCsv(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/api/import`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Import failed." }));
    throw new Error(body.error || "Import failed.");
  }

  return res.json();
}
