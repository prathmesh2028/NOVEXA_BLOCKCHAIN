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

export interface Asset {
  id: string;
  batchId: string;
  type: string;
  model: string;
  serialNumber: string;
  lifecycle: LifecycleState;
  verification: VerificationStatus;
  evidenceCount: number;
  evidenceStatus: EvidenceStatus;
  certStatus: CertStatus | "NOT_CERTIFIED";
  certId?: string;
  supplier: string;
  registeredBy: string;
  registeredAt: string;
  updatedAt: string;
  description: string;
}

export interface Evidence {
  id: string;
  assetId: string;
  filename: string;
  type: string;
  mimeType: string;
  sizeKb: number;
  status: EvidenceStatus;
  hash: string;
  uploadedBy: string;
  uploadedByRole: string;
  uploadedAt: string;
  event: string;
  integrityVerified: boolean;
  blockchainTx?: string;
}

export interface Certification {
  id: string;
  assetId: string;
  batchId: string;
  tokenId: string;
  contractAddress: string;
  network: string;
  txHash: string;
  blockNumber: number;
  status: CertStatus;
  issuedBy: string;
  issuedByDid: string;
  issuedAt: string;
  confirmedAt?: string;
  confirmations: number;
  certType?: string;
  assetName?: string;
  expiryDate?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedByDid?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorDid: string;
  actorRole: string;
  action: string;
  assetId?: string;
  evidenceId?: string;
  certId?: string;
  timestamp: string;
  result: "SUCCESS" | "WARNING" | "FAILED";
  blockchainTx?: string;
  details: string;
}

export interface BlockchainTx {
  hash: string;
  network: string;
  blockNumber: number;
  status: TxStatus;
  action: string;
  assetId?: string;
  certId?: string;
  confirmations: number;
  gasUsed: number;
  from: string;
  contractAddress: string;
  tokenId?: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  did: string;
  status: "ACTIVE" | "DISABLED" | "PENDING";
  identityStatus: "VERIFIED" | "PENDING" | "REVOKED";
  lastActive: string;
  createdAt: string;
}

export const ASSETS: Asset[] = [
  {
    id: "EF-2026-00421",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00421",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    verification: "VERIFIED",
    evidenceCount: 4,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00089",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    registeredAt: "2026-08-15T09:22:00Z",
    updatedAt: "2026-09-10T14:05:00Z",
    description: "Synthetic Electronic Fuze unit, batch demonstrating full lifecycle from declaration to assembly acceptance. Non-classified demonstration record.",
  },
  {
    id: "EF-2026-00422",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00422",
    lifecycle: "INSPECTION_RECORDED",
    verification: "REVIEW_REQUIRED",
    evidenceCount: 2,
    evidenceStatus: "Processing",
    certStatus: "PENDING",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    registeredAt: "2026-08-15T09:25:00Z",
    updatedAt: "2026-09-11T08:30:00Z",
    description: "Synthetic Electronic Fuze unit — inspection recorded, pending evidence review.",
  },
  {
    id: "EF-2026-00423",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00423",
    lifecycle: "REJECTED_QUARANTINED",
    verification: "FAILED",
    evidenceCount: 3,
    evidenceStatus: "Failed",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    registeredAt: "2026-08-15T09:28:00Z",
    updatedAt: "2026-09-09T11:00:00Z",
    description: "Synthetic unit — rejected during inspection. Evidence fingerprint mismatch detected.",
  },
  {
    id: "PT-2026-00105",
    batchId: "PT-BATCH-2026-004",
    type: "Pressure Transducer",
    model: "PT-SEN-SYNTH",
    serialNumber: "SN-PT-00105",
    lifecycle: "RECEIVED",
    verification: "PENDING",
    evidenceCount: 1,
    evidenceStatus: "Uploading",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Sensors Div.",
    registeredBy: "Rajesh Kumar",
    registeredAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-12T07:45:00Z",
    description: "Synthetic pressure transducer — received, evidence upload in progress.",
  },
  {
    id: "IG-2026-00210",
    batchId: "IG-BATCH-2026-008",
    type: "Ignition Module",
    model: "IG-MOD-SYNTH",
    serialNumber: "SN-IG-00210",
    lifecycle: "SUPPLIER_DECLARED",
    verification: "PENDING",
    evidenceCount: 0,
    evidenceStatus: "Processing",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Ignition Div.",
    registeredBy: "Rajesh Kumar",
    registeredAt: "2026-09-10T14:30:00Z",
    updatedAt: "2026-09-10T14:30:00Z",
    description: "Synthetic ignition module — supplier declared, awaiting receipt and inspection.",
  },
];

export const EVIDENCE_LIST: Evidence[] = [
  {
    id: "EVD-2026-001",
    assetId: "EF-2026-00421",
    filename: "inspection_report_EF00421.pdf",
    type: "Inspection Report",
    mimeType: "application/pdf",
    sizeKb: 248,
    status: "Complete",
    hash: "a3f8c2d1e9b7...4c2f",
    uploadedBy: "Rajesh Kumar",
    uploadedByRole: "Technician",
    uploadedAt: "2026-09-05T10:14:00Z",
    event: "INSPECTION_RECORDED",
    integrityVerified: true,
    blockchainTx: "0x8A42b3...19F2",
  },
  {
    id: "EVD-2026-002",
    assetId: "EF-2026-00421",
    filename: "supplier_declaration_BATCH017.pdf",
    type: "Supplier Declaration",
    mimeType: "application/pdf",
    sizeKb: 112,
    status: "Complete",
    hash: "d7e4a1c3f2b8...9a1e",
    uploadedBy: "Rajesh Kumar",
    uploadedByRole: "Technician",
    uploadedAt: "2026-08-15T09:30:00Z",
    event: "SUPPLIER_DECLARED",
    integrityVerified: true,
    blockchainTx: "0x3C77f4...A4D1",
  },
  {
    id: "EVD-2026-003",
    assetId: "EF-2026-00421",
    filename: "receipt_confirmation_EF00421.jpg",
    type: "Receipt Confirmation",
    mimeType: "image/jpeg",
    sizeKb: 890,
    status: "Complete",
    hash: "b2c9d4e6f1a5...7f3b",
    uploadedBy: "Rajesh Kumar",
    uploadedByRole: "Technician",
    uploadedAt: "2026-08-22T14:45:00Z",
    event: "RECEIVED",
    integrityVerified: true,
  },
  {
    id: "EVD-2026-004",
    assetId: "EF-2026-00421",
    filename: "qa_approval_EF00421.pdf",
    type: "QA Approval",
    mimeType: "application/pdf",
    sizeKb: 176,
    status: "Complete",
    hash: "e5f2a8c7d3b1...6e9a",
    uploadedBy: "Rajesh Kumar",
    uploadedByRole: "Technician",
    uploadedAt: "2026-09-08T11:20:00Z",
    event: "ACCEPTED_FOR_ASSEMBLY",
    integrityVerified: true,
    blockchainTx: "0x1B8Ae9...C3F7",
  },
  {
    id: "EVD-2026-005",
    assetId: "EF-2026-00423",
    filename: "inspection_report_EF00423.pdf",
    type: "Inspection Report",
    mimeType: "application/pdf",
    sizeKb: 198,
    status: "Failed",
    hash: "f1c3a7e2b9d4...2d8c",
    uploadedBy: "Rajesh Kumar",
    uploadedByRole: "Technician",
    uploadedAt: "2026-09-09T10:50:00Z",
    event: "INSPECTION_RECORDED",
    integrityVerified: false,
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    id: "CERT-2026-00088",
    assetId: "EF-2026-00422",
    assetName: "Electronic Fuze MK4",
    certType: "Pre-Assembly QC & Arming Circuit Validation",
    batchId: "EF-BATCH-2026-017",
    tokenId: "TKN-00088",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x2F61c4d7e9a0b2c5f8...7A3E",
    blockNumber: 0,
    status: "PENDING",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-12T09:00:00Z",
    expiryDate: "2028-09-12T09:00:00Z",
    confirmations: 0,
    reviewNotes: "Lifecycle state: INSPECTION_RECORDED. 2 evidence documents verified. Awaiting final NFT Creator sign-off to initiate on-chain minting.",
  },
  {
    id: "CERT-2026-00089",
    assetId: "EF-2026-00421",
    assetName: "Electronic Fuze MK4",
    certType: "Pre-Assembly QC & Arming Circuit Validation",
    batchId: "EF-BATCH-2026-017",
    tokenId: "TKN-00089",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x8A42b3c5d1e7f2a9...19F2",
    blockNumber: 19842317,
    status: "CONFIRMED",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-10T11:05:00Z",
    confirmedAt: "2026-09-10T11:07:34Z",
    expiryDate: "2028-09-10T11:05:00Z",
    confirmations: 47,
    reviewNotes: "All 4 evidence items matched SHA-256 fingerprint. Lifecycle verified as ACCEPTED_FOR_ASSEMBLY. Minted successfully.",
    reviewedBy: "Priya Sharma",
    reviewedByDid: "did:bel:actor:002",
    reviewedAt: "2026-09-10T11:05:00Z",
  },
  {
    id: "CERT-2026-00092",
    assetId: "PT-2026-00105",
    assetName: "Pressure Transducer",
    certType: "Sensor Calibration & Tolerance Verification",
    batchId: "PT-BATCH-2026-004",
    tokenId: "TKN-00092",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x5D82a7f1e4b3c9d0...8B21",
    blockNumber: 0,
    status: "PENDING",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-14T14:20:00Z",
    expiryDate: "2028-09-14T14:20:00Z",
    confirmations: 0,
    reviewNotes: "Sensor telemetry checks completed in Cleanroom B. Ready for batch certification review.",
  },
  {
    id: "CERT-2026-00090",
    assetId: "EF-2026-00423",
    assetName: "Electronic Fuze MK4",
    certType: "Pre-Assembly QC & Arming Circuit Validation",
    batchId: "EF-BATCH-2026-017",
    tokenId: "TKN-00090",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x7B91e2c4d8a0f3b5...9E10",
    blockNumber: 0,
    status: "FAILED",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-09T15:30:00Z",
    expiryDate: "2028-09-09T15:30:00Z",
    confirmations: 0,
    rejectionReason: "Hermetic seal integrity leak test failed. Evidence fingerprint mismatch detected on file EVD-2026-005. Quarantined.",
    reviewedBy: "Deepa Nair",
    reviewedByDid: "did:bel:actor:004",
    reviewedAt: "2026-09-09T16:00:00Z",
  },
  {
    id: "CERT-2026-00085",
    assetId: "PT-2026-00105",
    assetName: "Pressure Transducer",
    certType: "Hydrostatic Tolerance & Thermal Drift Certificate",
    batchId: "PT-BATCH-2026-004",
    tokenId: "TKN-00085",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x4A19b2c8e3d7f0a1...2C44",
    blockNumber: 19839410,
    status: "CONFIRMED",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-02T10:00:00Z",
    confirmedAt: "2026-09-02T10:03:12Z",
    expiryDate: "2028-09-02T10:00:00Z",
    confirmations: 182,
    reviewNotes: "Hydrostatic test report approved by BEL Bangalore QA team.",
    reviewedBy: "Priya Sharma",
    reviewedByDid: "did:bel:actor:002",
    reviewedAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "CERT-2026-00079",
    assetId: "IG-2026-00210",
    assetName: "Ignition Module",
    certType: "Ballistic Pyrotechnic Standard NFT",
    batchId: "IG-BATCH-2026-008",
    tokenId: "TKN-00079",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x9E33f1a2c5b8d7e0...1F5A",
    blockNumber: 19821054,
    status: "REVOKED",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-08-10T09:15:00Z",
    expiryDate: "2027-08-10T09:15:00Z",
    confirmations: 540,
    rejectionReason: "Superseded by updated BEL Pyrotechnic Specification Rev 4. Token marked non-transferable and revoked.",
    reviewedBy: "Arjun Mehta",
    reviewedByDid: "did:bel:actor:001",
    reviewedAt: "2026-08-25T11:00:00Z",
  },
];

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "AE-2026-0441",
    actor: "Priya Sharma",
    actorDid: "did:bel:actor:002",
    actorRole: "NFT Creator",
    action: "Certification confirmed on-chain",
    assetId: "EF-2026-00421",
    certId: "CERT-2026-00089",
    timestamp: "2026-09-10T11:07:34Z",
    result: "SUCCESS",
    blockchainTx: "0x8A42b3...19F2",
    details: "Certification CERT-2026-00089 confirmed. Block 19842317. 47 confirmations.",
  },
  {
    id: "AE-2026-0440",
    actor: "Priya Sharma",
    actorDid: "did:bel:actor:002",
    actorRole: "NFT Creator",
    action: "Certification minting initiated",
    assetId: "EF-2026-00421",
    certId: "CERT-2026-00089",
    timestamp: "2026-09-10T11:05:00Z",
    result: "SUCCESS",
    blockchainTx: "0x8A42b3...19F2",
    details: "NFT Creator reviewed evidence and initiated minting for asset EF-2026-00421.",
  },
  {
    id: "AE-2026-0439",
    actor: "Rajesh Kumar",
    actorDid: "did:bel:actor:003",
    actorRole: "Technician",
    action: "Evidence uploaded — QA Approval",
    assetId: "EF-2026-00421",
    evidenceId: "EVD-2026-004",
    timestamp: "2026-09-08T11:20:00Z",
    result: "SUCCESS",
    details: "Evidence fingerprint generated: e5f2a8c7...6e9a. Integrity verified.",
  },
  {
    id: "AE-2026-0438",
    actor: "Rajesh Kumar",
    actorDid: "did:bel:actor:003",
    actorRole: "Technician",
    action: "Lifecycle transitioned to ACCEPTED_FOR_ASSEMBLY",
    assetId: "EF-2026-00421",
    timestamp: "2026-09-08T11:25:00Z",
    result: "SUCCESS",
    details: "Asset EF-2026-00421 accepted for assembly after successful inspection.",
  },
  {
    id: "AE-2026-0437",
    actor: "Rajesh Kumar",
    actorDid: "did:bel:actor:003",
    actorRole: "Technician",
    action: "Evidence uploaded — Inspection Report",
    assetId: "EF-2026-00421",
    evidenceId: "EVD-2026-001",
    timestamp: "2026-09-05T10:14:00Z",
    result: "SUCCESS",
    details: "Inspection report fingerprint: a3f8c2d1...4c2f. Anchored on-chain.",
  },
  {
    id: "AE-2026-0433",
    actor: "Deepa Nair",
    actorDid: "did:bel:actor:004",
    actorRole: "Auditor",
    action: "Evidence integrity verified",
    assetId: "EF-2026-00423",
    evidenceId: "EVD-2026-005",
    timestamp: "2026-09-09T14:30:00Z",
    result: "FAILED",
    details: "Fingerprint mismatch detected. Stored: f1c3a7e2...2d8c vs Computed: 9b2e5f1c...8a4d. Asset quarantined.",
  },
  {
    id: "AE-2026-0430",
    actor: "Arjun Mehta",
    actorDid: "did:bel:actor:001",
    actorRole: "Administrator",
    action: "User role assigned",
    timestamp: "2026-09-01T08:00:00Z",
    result: "SUCCESS",
    details: "Role NFT Creator assigned to Priya Sharma (did:bel:actor:002).",
  },
];

export const BLOCKCHAIN_TXS: BlockchainTx[] = [
  {
    hash: "0x8A42b3c5d1e7f2a9b4c6d8e0f1a3c5e7...19F2",
    network: "BEL-TRUST-CHAIN",
    blockNumber: 19842317,
    status: "CONFIRMED",
    action: "Certification Mint",
    assetId: "EF-2026-00421",
    certId: "CERT-2026-00089",
    confirmations: 47,
    gasUsed: 94231,
    from: "0x3C77f4...A4D1",
    contractAddress: "0x742d35Cc6634...SYNTH",
    tokenId: "TKN-00089",
    timestamp: "2026-09-10T11:05:00Z",
  },
  {
    hash: "0x3C77f4a2b8c1d5e9f0a3...A4D1",
    network: "BEL-TRUST-CHAIN",
    blockNumber: 19838201,
    status: "CONFIRMED",
    action: "Evidence Anchor",
    assetId: "EF-2026-00421",
    confirmations: 312,
    gasUsed: 48820,
    from: "0x3C77f4...A4D1",
    contractAddress: "0x742d35Cc6634...SYNTH",
    timestamp: "2026-09-05T10:16:00Z",
  },
  {
    hash: "0x2F61c4d7e9a0b2c5f8...7A3E",
    network: "BEL-TRUST-CHAIN",
    blockNumber: 0,
    status: "PENDING",
    action: "Certification Mint",
    assetId: "EF-2026-00422",
    certId: "CERT-2026-00088",
    confirmations: 0,
    gasUsed: 0,
    from: "0x3C77f4...A4D1",
    contractAddress: "0x742d35Cc6634...SYNTH",
    tokenId: "TKN-00088",
    timestamp: "2026-09-12T09:00:00Z",
  },
];

export const USERS_LIST: User[] = [
  {
    id: "USR-001",
    name: "Arjun Mehta",
    email: "a.mehta@bel-defence.in",
    role: "Administrator",
    did: "did:bel:actor:001",
    status: "ACTIVE",
    identityStatus: "VERIFIED",
    lastActive: "2026-09-12T09:45:00Z",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "USR-002",
    name: "Priya Sharma",
    email: "p.sharma@bel-defence.in",
    role: "NFT Creator",
    did: "did:bel:actor:002",
    status: "ACTIVE",
    identityStatus: "VERIFIED",
    lastActive: "2026-09-12T11:05:00Z",
    createdAt: "2026-01-10T08:15:00Z",
  },
  {
    id: "USR-003",
    name: "Rajesh Kumar",
    email: "r.kumar@bel-defence.in",
    role: "Technician",
    did: "did:bel:actor:003",
    status: "ACTIVE",
    identityStatus: "VERIFIED",
    lastActive: "2026-09-12T10:30:00Z",
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "USR-004",
    name: "Deepa Nair",
    email: "d.nair@bel-defence.in",
    role: "Auditor",
    did: "did:bel:actor:004",
    status: "ACTIVE",
    identityStatus: "VERIFIED",
    lastActive: "2026-09-11T16:20:00Z",
    createdAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "USR-005",
    name: "Vikram Singh",
    email: "v.singh@bel-defence.in",
    role: "Technician",
    did: "did:bel:actor:005",
    status: "PENDING",
    identityStatus: "PENDING",
    lastActive: "—",
    createdAt: "2026-09-10T14:00:00Z",
  },
];

export function formatDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " • " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
  );
}

export function shortHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return hash.slice(0, chars) + "..." + hash.slice(-4);
}

// ---------------------------------------------------------------------------
// Defence Asset Inspection Types & Dataset (BEL Standard Inspired)
// ---------------------------------------------------------------------------

export type InspectionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "ATTENTION_REQUIRED";
export type InspectionPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "STANDARD";
export type ChecklistItemState = "Pass" | "Fail" | "Not Checked";
export type EvidenceRequirement = "Required" | "Attached" | "Missing" | "Not Required";

export interface ChecklistItem {
  id: string;
  criterion: string;
  description: string;
  standardRef: string;
  state: ChecklistItemState;
  notes?: string;
  mandatory: boolean;
}

export interface InspectionHistoryEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface Inspection {
  id: string;
  assetId: string;
  assetName: string;
  assetModel: string;
  assetSerial: string;
  batchId: string;
  type: string;
  assignedTechnician: string;
  technicianDid: string;
  scheduledDate: string;
  updatedAt: string;
  status: InspectionStatus;
  priority: InspectionPriority;
  location: string;
  evidenceStatus: EvidenceRequirement;
  evidenceId?: string;
  evidenceFilename?: string;
  checklist: ChecklistItem[];
  findings: string;
  recommendation?: string;
  history: InspectionHistoryEntry[];
}

export const INSPECTIONS_LIST: Inspection[] = [
  {
    id: "INSP-2026-0088",
    assetId: "PT-2026-00105",
    assetName: "Pressure Transducer",
    assetModel: "PT-SEN-SYNTH",
    assetSerial: "SN-PT-00105",
    batchId: "PT-BATCH-2026-004",
    type: "Sensor Calibration & Tolerance Verification",
    assignedTechnician: "Rajesh Kumar",
    technicianDid: "did:bel:actor:003",
    scheduledDate: "2026-09-14T09:00:00Z",
    updatedAt: "2026-09-14T11:45:00Z",
    status: "IN_PROGRESS",
    priority: "HIGH",
    location: "BEL Bengaluru - Bay 04 / Cleanroom B",
    evidenceStatus: "Required",
    findings: "Initial zero-offset pressure check is within nominal ±0.02 bar. Physical casing integrity confirmed without micro-fractures. Electrical pin impedance conforms to BEL-QC-SEN-12.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "Physical Enclosure & Seal Integrity",
        description: "Verify absence of casing fissures, thread stripping, and hermetic O-ring degradation.",
        standardRef: "MIL-STD-810H Cl 5.2",
        state: "Pass",
        notes: "Passed visual microscopy. O-ring seated correctly.",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "Zero-Offset Voltage Calibration",
        description: "Measure baseline differential voltage output at 101.3 kPa ambient pressure (target 0.00V ± 15mV).",
        standardRef: "BEL-STD-SEN-401",
        state: "Pass",
        notes: "Measured offset: +4.2mV (well within tolerance).",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Tamper-Evident Barcode & Serial Match",
        description: "Scan physical 2D matrix on housing and confirm exact match against asset ledger SN-PT-00105.",
        standardRef: "DEF-AERO-UID-09",
        state: "Pass",
        notes: "Serial matched cryptographically with batch manifest.",
        mandatory: true,
      },
      {
        id: "CHK-04",
        criterion: "High-Pressure Hydraulic Ramp (300 Bar)",
        description: "Sustain 300 Bar hydrostatic pressure for 180 seconds with less than 0.05% pressure decay.",
        standardRef: "MIL-STD-202G Meth 112",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-05",
        criterion: "Thermal Drift Coefficient (-20°C to +70°C)",
        description: "Measure sensor drift across operating temperature delta; thermal coefficient must remain < 0.02%/°C.",
        standardRef: "BEL-QC-ENV-08",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
    ],
    history: [
      {
        id: "IH-001",
        timestamp: "2026-09-12T08:00:00Z",
        actor: "Arjun Mehta",
        actorRole: "Administrator",
        action: "Inspection task scheduled and assigned to Rajesh Kumar",
        details: "Assigned per batch PT-BATCH-2026-004 receiving protocol.",
      },
      {
        id: "IH-002",
        timestamp: "2026-09-14T09:30:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Inspection commenced — Workstation Bay 04 Cleanroom B",
        details: "Checks CHK-01, CHK-02, and CHK-03 passed without deviation.",
      },
    ],
  },
  {
    id: "INSP-2026-0085",
    assetId: "EF-2026-00421",
    assetName: "Electronic Fuze",
    assetModel: "EF-MK4-SYNTH",
    assetSerial: "SN-EF-00421",
    batchId: "EF-BATCH-2026-017",
    type: "Pre-Assembly QC & Arming Circuit Validation",
    assignedTechnician: "Rajesh Kumar",
    technicianDid: "did:bel:actor:003",
    scheduledDate: "2026-09-05T08:30:00Z",
    updatedAt: "2026-09-05T10:15:00Z",
    status: "COMPLETED",
    priority: "CRITICAL",
    location: "BEL Bengaluru - Ordnance Test Facility 2",
    evidenceStatus: "Attached",
    evidenceId: "EVD-2026-001",
    evidenceFilename: "inspection_report_EF00421.pdf",
    findings: "All mechanical, electrical, and environmental tests passed with zero non-conformances. Arming circuit delay calibrated to precisely 1.450s ± 0.005s. Asset cleared for assembly integration.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "Ordnance Housing Hermetic Seal",
        description: "Helium leak detection at 10^-8 atm cc/s threshold.",
        standardRef: "MIL-STD-331D Test A1",
        state: "Pass",
        notes: "Helium rate: 1.2x10^-8 atm cc/s. Passed.",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "Arming Switch Safety Interlock Circuit",
        description: "Verify dual-path redundant safety interlock failsafe operation.",
        standardRef: "BEL-ORD-FUZE-202",
        state: "Pass",
        notes: "Both paths opened in < 2.1 ms under simulated fault.",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Capacitor Discharge Voltage Curve",
        description: "Verify detonation pulse discharge reaches 28.5V within 12 microseconds.",
        standardRef: "DEF-STAN-07-85",
        state: "Pass",
        notes: "Peak voltage 28.8V reached at 10.4 microseconds.",
        mandatory: true,
      },
      {
        id: "CHK-04",
        criterion: "Cryptographic Identity Chip Ping",
        description: "Authenticate on-board cryptographic chip and verify ECDSA key signature against registry.",
        standardRef: "BEL-CRYPTO-FIPS-140-3",
        state: "Pass",
        notes: "Key verified against BEL Central PKI Root.",
        mandatory: true,
      },
    ],
    history: [
      {
        id: "IH-010",
        timestamp: "2026-09-04T15:00:00Z",
        actor: "Arjun Mehta",
        actorRole: "Administrator",
        action: "Inspection task created",
        details: "Mandatory pre-assembly inspection scheduled.",
      },
      {
        id: "IH-011",
        timestamp: "2026-09-05T08:30:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Inspection commenced",
        details: "Tested on calibrated test rack TR-09.",
      },
      {
        id: "IH-012",
        timestamp: "2026-09-05T10:14:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Inspection marked COMPLETED",
        details: "All criteria satisfied. PDF report uploaded to evidence store.",
      },
    ],
  },
  {
    id: "INSP-2026-0087",
    assetId: "EF-2026-00423",
    assetName: "Electronic Fuze",
    assetModel: "EF-MK4-SYNTH",
    assetSerial: "SN-EF-00423",
    batchId: "EF-BATCH-2026-017",
    type: "Pre-Assembly QC & Arming Circuit Validation",
    assignedTechnician: "Rajesh Kumar",
    technicianDid: "did:bel:actor:003",
    scheduledDate: "2026-09-08T13:00:00Z",
    updatedAt: "2026-09-08T15:10:00Z",
    status: "ATTENTION_REQUIRED",
    priority: "CRITICAL",
    location: "BEL Bengaluru - Ordnance Test Facility 2",
    evidenceStatus: "Missing",
    findings: "CRITICAL DEFECT DETECTED: Housing hermetic seal failed pressure integrity check. Internal pressure dropped by 0.45 bar during the 60s hold test. Asset quarantined immediately.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "Ordnance Housing Hermetic Seal",
        description: "Helium leak detection at 10^-8 atm cc/s threshold.",
        standardRef: "MIL-STD-331D Test A1",
        state: "Fail",
        notes: "FAILED: Major pressure loss observed at rear cap weld.",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "Arming Switch Safety Interlock Circuit",
        description: "Verify dual-path redundant safety interlock failsafe operation.",
        standardRef: "BEL-ORD-FUZE-202",
        state: "Pass",
        notes: "Interlocks operational.",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Capacitor Discharge Voltage Curve",
        description: "Verify detonation pulse discharge reaches 28.5V within 12 microseconds.",
        standardRef: "DEF-STAN-07-85",
        state: "Pass",
        notes: "Capacitor curve acceptable.",
        mandatory: true,
      },
      {
        id: "CHK-04",
        criterion: "Cryptographic Identity Chip Ping",
        description: "Authenticate on-board cryptographic chip and verify ECDSA key signature against registry.",
        standardRef: "BEL-CRYPTO-FIPS-140-3",
        state: "Pass",
        notes: "Chip response valid.",
        mandatory: true,
      },
    ],
    history: [
      {
        id: "IH-020",
        timestamp: "2026-09-08T13:00:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Inspection commenced",
        details: "Testing batch unit 00423 on test rack TR-09.",
      },
      {
        id: "IH-021",
        timestamp: "2026-09-08T14:45:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Status transitioned to ATTENTION_REQUIRED",
        details: "Hermetic seal failed leak threshold. Quarantined for QA review.",
      },
    ],
  },
  {
    id: "INSP-2026-0089",
    assetId: "IG-2026-00210",
    assetName: "Ignition Module",
    assetModel: "IG-MOD-SYNTH",
    assetSerial: "SN-IG-00210",
    batchId: "IG-BATCH-2026-008",
    type: "Ballistic Ignition Continuity & Pulse Integrity",
    assignedTechnician: "Vikram Singh",
    technicianDid: "did:bel:actor:005",
    scheduledDate: "2026-09-20T10:30:00Z",
    updatedAt: "2026-09-10T14:30:00Z",
    status: "SCHEDULED",
    priority: "MEDIUM",
    location: "BEL Pune - Pyrotechnic Analysis Lab 1",
    evidenceStatus: "Required",
    findings: "Asset scheduled for initial intake inspection following supplier declaration.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "Bridgewire Resistance Check (1.05Ω ± 0.05Ω)",
        description: "Measure resistance of primary pyrotechnic bridgewire at 20°C.",
        standardRef: "MIL-DTL-23659",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "High-Voltage Static Sensitivity Shielding",
        description: "Verify ESD shielding resistance to 25kV static discharge.",
        standardRef: "BEL-PYRO-ESD-02",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Physical Dimensions & Mounting Thread Check",
        description: "Gauge threading with go/no-go ring gauges per ISO 965-2.",
        standardRef: "ISO-965-2 M14x1.5",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-04",
        criterion: "Supplier Batch Certificate Conformity",
        description: "Cross-examine lot certificate against chemical purity requirements.",
        standardRef: "BEL-PUR-SPEC-711",
        state: "Not Checked",
        notes: "",
        mandatory: false,
      },
    ],
    history: [
      {
        id: "IH-030",
        timestamp: "2026-09-10T14:30:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Inspection task created upon supplier declaration",
        details: "Assigned to Vikram Singh for pyrotechnic testing in Pune facility.",
      },
    ],
  },
  {
    id: "INSP-2026-0091",
    assetId: "EF-2026-00422",
    assetName: "Electronic Fuze",
    assetModel: "EF-MK4-SYNTH",
    assetSerial: "SN-EF-00422",
    batchId: "EF-BATCH-2026-017",
    type: "Firmware Hash & Cryptochip Key Verification",
    assignedTechnician: "Rajesh Kumar",
    technicianDid: "did:bel:actor:003",
    scheduledDate: "2026-09-15T11:00:00Z",
    updatedAt: "2026-09-15T13:20:00Z",
    status: "IN_PROGRESS",
    priority: "HIGH",
    location: "BEL Bengaluru - Avionics Integration Bay 1",
    evidenceStatus: "Required",
    findings: "Firmware binary extracted via JTAG interface. Cryptographic hash matches certified golden build. Awaiting secure boot signature verification.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "JTAG Port Secure Lockdown State",
        description: "Confirm physical fuse blowing or hardware lock preventing debug access.",
        standardRef: "BEL-SEC-HW-303",
        state: "Pass",
        notes: "Hardware security fuse blown as expected.",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "Firmware SHA-256 Checksum Matching",
        description: "Compare on-chip flash memory SHA-256 against authorized build catalog.",
        standardRef: "DEF-AERO-SW-SEC",
        state: "Pass",
        notes: "Checksum: 8d2e...44a1 matches golden image 100%.",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Hardware Random Number Generator Entropy Test",
        description: "Execute NIST SP 800-22 statistical test suite on internal TRNG.",
        standardRef: "NIST SP 800-22",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-04",
        criterion: "Anti-Tamper Active Mesh Voltage",
        description: "Verify active sensor mesh monitors enclosure removal under battery backup.",
        standardRef: "FIPS 140-3 Level 4",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
    ],
    history: [
      {
        id: "IH-040",
        timestamp: "2026-09-11T09:00:00Z",
        actor: "Arjun Mehta",
        actorRole: "Administrator",
        action: "Firmware security inspection scheduled",
        details: "Scheduled as stage 2 verification for asset EF-2026-00422.",
      },
      {
        id: "IH-041",
        timestamp: "2026-09-15T11:15:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "JTAG verification and ROM dump completed",
        details: "ROM checksum confirmed against master release manifest.",
      },
    ],
  },
  {
    id: "INSP-2026-0094",
    assetId: "PT-2026-00105",
    assetName: "Pressure Transducer",
    assetModel: "PT-SEN-SYNTH",
    assetSerial: "SN-PT-00105",
    batchId: "PT-BATCH-2026-004",
    type: "Vibration & Multi-Axis Shock Stress",
    assignedTechnician: "Rajesh Kumar",
    technicianDid: "did:bel:actor:003",
    scheduledDate: "2026-09-22T14:00:00Z",
    updatedAt: "2026-09-12T07:45:00Z",
    status: "SCHEDULED",
    priority: "STANDARD",
    location: "BEL Bengaluru - Environmental Testing Center",
    evidenceStatus: "Required",
    findings: "Scheduled for stage 2 shock and vibration testing after baseline calibration.",
    checklist: [
      {
        id: "CHK-01",
        criterion: "Random Vibration Profile (20Hz - 2000Hz, 12.5 Grms)",
        description: "Apply 3-axis continuous random vibration for 60 minutes per axis.",
        standardRef: "MIL-STD-810H Meth 514",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-02",
        criterion: "Mechanical Shock Pulse (100G, 6ms Half-Sine)",
        description: "Subject unit to 18 total shock impacts (3 shocks per direction along 3 orthogonal axes).",
        standardRef: "MIL-STD-202G Meth 213",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
      {
        id: "CHK-03",
        criterion: "Post-Shock Output Voltage Stability",
        description: "Verify sensor output does not shift by more than ±0.1% FS after shock.",
        standardRef: "BEL-SEN-QUAL-19",
        state: "Not Checked",
        notes: "",
        mandatory: true,
      },
    ],
    history: [
      {
        id: "IH-050",
        timestamp: "2026-09-12T08:00:00Z",
        actor: "Rajesh Kumar",
        actorRole: "Technician",
        action: "Vibration test protocol scheduled",
        details: "Linked to sensor batch PT-BATCH-2026-004.",
      },
    ],
  },
];

