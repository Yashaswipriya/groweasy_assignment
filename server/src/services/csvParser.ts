import { parse } from "csv-parse/sync";
import { RawRecord } from "../types/crm";

/**
 * Parses a raw CSV buffer into an array of row objects, keyed by whatever
 * column headers the file actually has. We never assume fixed column names -
 * the AI extraction step is what makes sense of them later.
 */
export function parseCsvBuffer(buffer: Buffer): RawRecord[] {
  // Strip a UTF-8 BOM if present - common in CSVs exported from Excel.
  let content = buffer.toString("utf-8");
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  if (!content.trim()) {
    throw new Error("The CSV file is empty.");
  }

  let records: RawRecord[];
  try {
    records = parse(content, {
      columns: (headers: string[]) => headers.map((h) => h.trim()),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // some real-world exports have ragged rows
    });
  } catch (err) {
    throw new Error(
      "Could not parse this file as CSV. Please check the formatting and try again."
    );
  }

  if (records.length === 0) {
    throw new Error("No data rows found in the CSV.");
  }

  return records;
}

/** Splits an array into fixed-size chunks, preserving order. */
export function chunkRecords<T>(records: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < records.length; i += size) {
    chunks.push(records.slice(i, i + size));
  }
  return chunks;
}
