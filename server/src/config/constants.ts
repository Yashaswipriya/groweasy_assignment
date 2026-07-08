export const CRM_STATUS_VALUES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE",
] as const;

export const DATA_SOURCE_VALUES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots",
] as const;

// How many raw CSV rows get sent to the AI in a single request.
// Small enough to keep the prompt reliable, large enough to stay fast.
export const BATCH_SIZE = 15;

// How many times a failed batch gets retried before its rows are marked skipped.
export const MAX_BATCH_RETRIES = 2;

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
