import { CrmRecord, CrmStatus, DataSource, RawRecord, SkippedRecord } from "../types/crm";
import { AiMappedRow } from "./aiExtractor";
import { CRM_STATUS_VALUES, DATA_SOURCE_VALUES } from "../config/constants";

const STATUS_SET = new Set<string>(CRM_STATUS_VALUES);
const SOURCE_SET = new Set<string>(DATA_SOURCE_VALUES);

function isValidDate(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/**
 * Applies GrowEasy's business rules to one AI-mapped row and decides whether
 * it belongs in the final import or should be skipped. This is deterministic
 * on purpose - the AI maps fields, this function enforces the rules, so a
 * flaky model response can never silently violate the CRM's constraints.
 */
export function validateRecord(
  mapped: AiMappedRow,
  originalRow: RawRecord
): { record: CrmRecord } | { skipped: SkippedRecord } {
  const email = (mapped.email || "").trim();
  const mobile = (mapped.mobile_without_country_code || "").trim();

  if (!email && !mobile) {
    return {
      skipped: {
        row: originalRow,
        reason: "No email or mobile number could be found for this row.",
      },
    };
  }

  const crm_status: CrmStatus = STATUS_SET.has(mapped.crm_status)
    ? (mapped.crm_status as CrmStatus)
    : "";

  const data_source: DataSource = SOURCE_SET.has(mapped.data_source)
    ? (mapped.data_source as DataSource)
    : "";

  const created_at = isValidDate(mapped.created_at) ? mapped.created_at : "";

  const record: CrmRecord = {
    created_at,
    name: mapped.name || "",
    email,
    country_code: mapped.country_code || "",
    mobile_without_country_code: mobile,
    company: mapped.company || "",
    city: mapped.city || "",
    state: mapped.state || "",
    country: mapped.country || "",
    lead_owner: mapped.lead_owner || "",
    crm_status,
    crm_note: (mapped.crm_note || "").replace(/\r?\n/g, "\\n"),
    data_source,
    possession_time: mapped.possession_time || "",
    description: mapped.description || "",
  };

  return { record };
}
