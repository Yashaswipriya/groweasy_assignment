import { Router } from "express";
import pLimit from "p-limit";
import { upload } from "../middleware/upload";
import { ApiError } from "../middleware/errorHandler";
import { parseCsvBuffer, chunkRecords } from "../services/csvParser";
import { extractBatch } from "../services/aiExtractor";
import { validateRecord } from "../services/validator";
import { CrmRecord, ImportResult, SkippedRecord } from "../types/crm";
import { BATCH_SIZE } from "../config/constants";

export const importRouter = Router();

// How many batches are sent to the AI concurrently. Keeps us within
// reasonable rate limits while still processing large files in parallel.
const BATCH_CONCURRENCY = 3;

importRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, "No file was uploaded.");
    }

    const rawRecords = parseCsvBuffer(req.file.buffer);
    const batches = chunkRecords(rawRecords, BATCH_SIZE);

    const imported: CrmRecord[] = [];
    const skipped: SkippedRecord[] = [];

    const limit = pLimit(BATCH_CONCURRENCY);

    const results = await Promise.all(
      batches.map((batch) =>
        limit(async () => {
          const mapped = await extractBatch(batch);
          if (!mapped) {
            // The whole batch failed even after retries - skip every row in it
            // rather than losing the request or crashing the import.
            return batch.map((row) => ({
              skipped: { row, reason: "AI extraction failed for this batch after retries." },
            }));
          }
          return mapped.map((m) => validateRecord(m, batch[m.row_index] ?? {}));
        })
      )
    );

    for (const batchResults of results) {
      for (const outcome of batchResults) {
        if ("record" in outcome) imported.push(outcome.record);
        else skipped.push(outcome.skipped);
      }
    }

    const response: ImportResult = {
      imported,
      skipped,
      totalImported: imported.length,
      totalSkipped: skipped.length,
      totalRows: rawRecords.length,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});