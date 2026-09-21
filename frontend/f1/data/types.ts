export type LifecycleState =
  | "UNREGISTERED"
  | "SUPPLIER_DECLARED"
  | "RECEIVED"
  | "INSPECTION_RECORDED"
  | "ACCEPTED_FOR_ASSEMBLY"
  | "REJECTED_QUARANTINED";

export type VerificationStatus = "VERIFIED" | "REVIEW_REQUIRED" | "FAILED" | "UNAVAILABLE" | "PENDING";

export type EvidenceStatus = "Complete" | "Processing" | "Hashing" | "Failed" | "Invalid" | "Duplicate" | "Uploading";

export type CertStatus = "CONFIRMED" | "PENDING" | "FAILED" | "REVOKED";

export type TxStatus = "CONFIRMED" | "PENDING" | "FAILED" | "REJECTED";
