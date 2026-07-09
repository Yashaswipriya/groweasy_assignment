import { GoogleGenAI } from "@google/genai";
import { RawRecord } from "../types/crm";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES, MAX_BATCH_RETRIES } from "../config/constants";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in the environment.");
}

const ai = new GoogleGenAI({ apiKey });

const MODEL = "gemini-2.5-flash";

// What the AI is allowed to hand back for one row. Deliberately permissive -
// business-rule enforcement (skip logic, enum whitelisting, date checks)
// happens afterwards in validator.ts. The AI's only job is field mapping.
export interface AiMappedRow {
  row_index: number;
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

function buildPrompt(batch: RawRecord[]): string {
  const numbered = batch.map((row, i) => ({ row_index: i, ...row }));

  return `You are a data-mapping engine for a CRM importer. You will receive an array of raw CSV rows, exported from unknown sources (Facebook Lead Ads, Google Ads, Excel, other CRMs, manual spreadsheets). Column names and layouts vary and are not fixed.

Map each row into this exact CRM field set:
created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

Rules:
1. crm_status must be exactly one of: ${CRM_STATUS_VALUES.join(", ")}. If nothing matches confidently, use an empty string.
2. data_source must be exactly one of: ${DATA_SOURCE_VALUES.join(", ")}. If nothing matches confidently, use an empty string.
3. created_at must be a value JavaScript's "new Date()" can parse. Prefer "YYYY-MM-DD HH:mm:ss" format when a source date is available. If no date exists in the row, use an empty string - do not invent one.
4. Put remarks, follow-up notes, extra comments, extra phone numbers, and extra email addresses into crm_note.
5. If a row has multiple email addresses, use the first as "email" and append the rest into crm_note. Same rule for multiple mobile numbers: first goes to mobile_without_country_code, the rest go into crm_note.
6. country_code should be a phone dialing code (e.g. "+91"). Infer it from the number or country when possible; otherwise leave it blank.
7. Never fabricate a value for any field. If a field is not present or cannot be inferred from the row, return an empty string for it.
8. crm_note must stay on a single line - use "\\n" (escaped) instead of a literal line break if you need to separate multiple notes.
9. Return every row you were given, in the same order, one output object per input row_index. Do not skip rows yourself - if a row looks unusable, still return your best-effort mapping for it; a downstream system decides whether to keep or skip it.

Input rows (JSON array, each with its row_index and original columns):
${JSON.stringify(numbered)}

Respond with ONLY a JSON array of length ${batch.length}, one object per row, each shaped exactly like:
{"row_index": number, "created_at": string, "name": string, "email": string, "country_code": string, "mobile_without_country_code": string, "company": string, "city": string, "state": string, "country": string, "lead_owner": string, "crm_status": string, "crm_note": string, "data_source": string, "possession_time": string, "description": string}`;
}

/** Strips markdown code fences if the model wraps its JSON in them anyway. */
function cleanJsonResponse(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1] : trimmed;
}

async function extractBatchOnce(batch: RawRecord[]): Promise<AiMappedRow[]> {
  const result = await ai.models.generateContent({
    model: MODEL,
    contents: buildPrompt(batch),
    config: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });
  const text = result.text ?? "";
  const parsed = JSON.parse(cleanJsonResponse(text));

  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not a JSON array.");
  }

  return parsed as AiMappedRow[];
}

/**
 * Extracts one batch of raw CSV rows into mapped CRM fields, retrying on
 * transient failures (bad JSON, API errors). If every attempt fails, returns
 * null so the caller can mark the whole batch as skipped rather than crash
 * the entire import.
 */
export async function extractBatch(batch: RawRecord[]): Promise<AiMappedRow[] | null> {
  for (let attempt = 0; attempt <= MAX_BATCH_RETRIES; attempt++) {
    const start = Date.now();
    try {
      const mapped = await extractBatchOnce(batch);
      const elapsed = Date.now() - start;
      if (mapped.length === batch.length) {
        console.log(`[extractBatch] success on attempt ${attempt + 1}, ${elapsed}ms, ${batch.length} rows`);
        return mapped;
      }
      console.warn(
        `[extractBatch] length mismatch on attempt ${attempt + 1} (${elapsed}ms): expected ${batch.length}, got ${mapped.length}`
      );
    } catch (err) {
      const elapsed = Date.now() - start;
      console.error(`[extractBatch] error on attempt ${attempt + 1} (${elapsed}ms):`, err);
      if (attempt === MAX_BATCH_RETRIES) {
        return null;
      }
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  return null;
}
