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
    id: "CERT-2026-00089",
    assetId: "EF-2026-00421",
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
    confirmations: 47,
  },
  {
    id: "CERT-2026-00088",
    assetId: "EF-2026-00422",
    batchId: "EF-BATCH-2026-017",
    tokenId: "TKN-00088",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH",
    network: "BEL-TRUST-CHAIN (Synthetic Demo)",
    txHash: "0x2F61c4...7A3E",
    blockNumber: 0,
    status: "PENDING",
    issuedBy: "Priya Sharma",
    issuedByDid: "did:bel:actor:002",
    issuedAt: "2026-09-12T09:00:00Z",
    confirmations: 0,
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
