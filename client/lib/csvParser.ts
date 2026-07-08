import Papa from "papaparse";
import { CsvPreview } from "../types/crm";

// Only used for the frontend preview table - no AI, no backend call.
// Caps the preview at 200 rows so huge files stay smooth in the browser;
// the full file is still sent to the backend on confirm.
const PREVIEW_ROW_LIMIT = 200;

export function parseCsvForPreview(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data;
        if (!data.length) {
          reject(new Error("This CSV file appears to be empty."));
          return;
        }
        const [headerRow, ...bodyRows] = data;
        resolve({
          headers: headerRow.map((h) => h.trim()),
          rows: bodyRows.slice(0, PREVIEW_ROW_LIMIT),
          totalRows: bodyRows.length,
        });
      },
      error: (err) => reject(err),
    });
  });
}
