// NOVEXA Defence Asset Trust — Certifications Domain Model & Mock Data
// Strictly scoped within frontend/f1/pages/certifications/

export type CertificationType =
  | "Safety Certification"
  | "Operational Certification"
  | "Maintenance Certification"
  | "Quality Certification"
  | "Compliance Certification";

export type CertificationStatus = "Valid" | "Expiring" | "Expired";

export type CertVerificationStatus =
  | "Verified"
  | "Pending Verification"
  | "Verification Required";

export interface IssuingAuthorityInfo {
  name: string;
  code: string;
  signatoryOfficer: string;
  rank: string;
  accreditation: string;
  office: string;
  sealCode: string;
}

export interface AssociatedAssetInfo {
  assetId: string;
  assetName: string;
  category: string;
  department: string;
  status: "Active" | "Under Maintenance" | "Inactive" | "Decommissioned";
  serialNumber: string;
  location: string;
}

export interface DocumentReference {
  documentId: string;
  referenceNumber: string;
  format: string;
  fileSize: string;
  classification: "RESTRICTED" | "CONFIDENTIAL" | "SECRET";
  sealedAt: string;
  checksum: string;
}

export interface ProofReference {
  verificationStatus: string;
  certificateHash: string;
  proofHash: string;
  txHash: string;
  contractAddress: string;
  network: string;
  blockNumber: number;
  confirmations: number;
  timestamp: string;
  consensusSeal: string;
}

export interface CertTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  status: string;
  badge: string;
  performedBy: string;
}

export interface CertificationRecord {
  id: string; // e.g. "CERT-2026-00124"
  certificateNumber: string;
  type: CertificationType;
  status: CertificationStatus;
  verificationStatus: CertVerificationStatus;
  issueDate: string;
  expiryDate: string;
  validityDuration: string;
  standard: string;
  complianceScope: string;
  summary: string;
  authority: IssuingAuthorityInfo;
  asset: AssociatedAssetInfo;
  document: DocumentReference;
  proof: ProofReference;
  timeline: CertTimelineEvent[];
}

export const CERTIFICATION_TYPES: CertificationType[] = [
  "Safety Certification",
  "Operational Certification",
  "Maintenance Certification",
  "Quality Certification",
  "Compliance Certification",
];

export const CERTIFICATION_STATUSES: CertificationStatus[] = [
  "Valid",
  "Expiring",
  "Expired",
];

export const VERIFICATION_STATUSES: CertVerificationStatus[] = [
  "Verified",
  "Pending Verification",
  "Verification Required",
];

export const INITIAL_CERTIFICATIONS: CertificationRecord[] = [
  {
    id: "CERT-BEL-2026-001",
    certificateNumber: "BEL/QA/FUZE/2026-001-V",
    type: "Quality Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-15",
    expiryDate: "2027-02-14",
    validityDuration: "12 Months",
    standard: "MIL-STD-1316F Munition Fuze Safety & Functional Clearance",
    complianceScope: "Acceleration sensing threshold (25,000 g setback tolerance), electronic timing delay, and proximity sensor burst height accuracy",
    summary: "Production batch quality and functional assurance certification for Electronic Fuze Assembly.",
    authority: {
      name: "BEL Defence QA",
      code: "AUTH-BEL-QA-001",
      signatoryOfficer: "Col. R. K. Nair",
      rank: "Director, Quality Assurance & Reliability",
      accreditation: "Ministry of Defence, Department of Defence Production (DDP)",
      office: "BEL Central Quality Complex, Bangalore",
      sealCode: "SEAL-BEL-QA-2026-991",
    },
    asset: {
      assetId: "EF-2026-001",
      assetName: "Electronic Fuze Assembly",
      category: "Electronic Equipment",
      department: "Munitions & Armament Division",
      status: "Active",
      serialNumber: "BEL-FUZE-2026-0814",
      location: "Central Ordnance Depot, Jabalpur",
    },
    document: {
      documentId: "DOC-CERT-BEL-2026-001",
      referenceNumber: "FUZE-BATCH-2026-001",
      format: "PDF/A-1b Military Archive",
      fileSize: "3.4 MB",
      classification: "RESTRICTED",
      sealedAt: "2026-02-15T09:30:00Z",
      checksum: "0x4b7f9a2e1d0c8b3a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
      proofHash: "0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d",
      txHash: "0x8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      network: "BEL-TRUST-CHAIN (Private PoA)",
      blockNumber: 482930,
      confirmations: 120,
      timestamp: "2026-02-15T09:45:00Z",
      consensusSeal: "BFT-Seal-Validated-BEL-QA",
    },
    timeline: [
      {
        id: "TLE-BEL-01",
        timestamp: "2026-02-10T10:00:00Z",
        title: "Munitions Fuze Stress Analysis",
        description: "Batch samples cleared 25,000 g acceleration shock test with 100% arming circuit integrity.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "BEL Ordnance Quality Lab",
      },
      {
        id: "TLE-BEL-02",
        timestamp: "2026-02-15T09:30:00Z",
        title: "Formal Quality Certificate Issued",
        description: "Batch authorized for ordnance depot distribution under warrant BEL/QA/FUZE/2026-001.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. R. K. Nair",
      },
      {
        id: "TLE-BEL-03",
        timestamp: "2026-02-15T09:45:00Z",
        title: "Ledger State Anchored",
        description: "Committed to BEL-TRUST-CHAIN block #482,930.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00124",
    certificateNumber: "DGQA/ARMY/AFV/2026-0891-V",
    type: "Safety Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-01-14",
    expiryDate: "2027-01-13",
    validityDuration: "12 Months",
    standard: "MIL-STD-810H & DEF-STAN 23-09 Combat Survivability",
    complianceScope: "High-pressure NBC overpressure sealed crew compartment and ERA explosive blast deflection",
    summary: "Full ballistics safety and NBC filtration life extension certification for Main Battle Tank hull and turret assembly.",
    authority: {
      name: "Directorate General of Quality Assurance (DGQA)",
      code: "AUTH-DGQA-HV-042",
      signatoryOfficer: "Brig. Harpreet Singh Gill",
      rank: "Brigadier, Controller of Quality Assurance (Armoured Vehicles)",
      accreditation: "Ministry of Defence, Department of Defence Production (DDP)",
      office: "CQA (Heavy Vehicles), Avadi, Chennai",
      sealCode: "SEAL-IND-MOD-DGQA-9921",
    },
    asset: {
      assetId: "AST-IND-001",
      assetName: "T-90M Bhishma Main Battle Tank",
      category: "Vehicle",
      department: "43rd Armoured Regiment, Strike Corps",
      status: "Active",
      serialNumber: "IND-AFV-2024-9041",
      location: "Western Command Sector 4 Depot, Suratgarh",
    },
    document: {
      documentId: "DOC-CERT-2026-00124",
      referenceNumber: "DGQA/DOC/2026/0124-B",
      format: "PDF/A-1b Military Archive",
      fileSize: "4.8 MB",
      classification: "CONFIDENTIAL",
      sealedAt: "2026-01-14T09:30:00Z",
      checksum: "0x89f41a8624bc0192e457f920da67280d9c4456e7e1c8d5b7a32194f0689b12d4",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x3e18a93bc05f29910d54c8762ef490ab128d56b4f738012cc4917a8e29bf4821",
      proofHash: "0x51c728e0bb14a7905f132e6a9f023812dc57904e6c71825b410984da0762ab8f",
      txHash: "0x98b5a03426188fa90bc20147638dc5b8a09e377e11245a9094cbb468205f284e",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1842910,
      confirmations: 1420,
      timestamp: "2026-01-14T09:42:18Z",
      consensusSeal: "BFT-Seal-Validated-DGQA-Root",
    },
    timeline: [
      {
        id: "TLE-101",
        timestamp: "2026-01-08T10:00:00Z",
        title: "Technical Safety Inspection Initiated",
        description: "Physical audit of hull explosive reactive armour (ERA) tiles and fire suppression system conducted at Avadi.",
        status: "Completed",
        badge: "INSPECTION",
        performedBy: "Lead Inspector Col. K. Swaminathan (DGQA)",
      },
      {
        id: "TLE-102",
        timestamp: "2026-01-12T14:30:00Z",
        title: "Proof Testing & Pressure Seal Cleared",
        description: "Hydrostatic test passes 1.4x baseline pressure; zero leak threshold validated across chemical seals.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "CQA Combat Systems Assessment Unit",
      },
      {
        id: "TLE-103",
        timestamp: "2026-01-14T09:15:00Z",
        title: "Formal Certificate Endorsed",
        description: "Signed and officially authorized under military certification warrant DGQA/ARMY/AFV/2026-0891.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Brig. Harpreet Singh Gill",
      },
      {
        id: "TLE-104",
        timestamp: "2026-01-14T09:42:18Z",
        title: "Ledger State Anchored",
        description: "Cryptographic state hash committed to Novexa Defence Ledger block #1,842,910 with 100% consensus seal.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00125",
    certificateNumber: "CEMILAC/AERO/FIGHTER/2025-1044-A",
    type: "Operational Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2025-11-20",
    expiryDate: "2026-11-19",
    validityDuration: "12 Months",
    standard: "CEMILAC-DEF-AERO-CAT1 Military Airworthiness Specification",
    complianceScope: "Full envelope air combat clearance, BVR missile interface integration, and digital fly-by-wire flight control envelope",
    summary: "Airworthiness and operational envelope clearance certificate for multi-role lightweight fighter aircraft.",
    authority: {
      name: "Centre for Military Airworthiness and Certification (CEMILAC)",
      code: "AUTH-CEMILAC-BLR-011",
      signatoryOfficer: "Air Vice Marshal S. Ramanathan",
      rank: "Chief Executive (Airworthiness), DRDO/CEMILAC",
      accreditation: "Ministry of Defence, DRDO Apex Aviation Certification Body",
      office: "CEMILAC Headquarters, Marathahalli, Bengaluru",
      sealCode: "SEAL-IND-DRDO-CEMILAC-0081",
    },
    asset: {
      assetId: "AST-IND-002",
      assetName: "HAL Tejas Mk1A Multi-Role Fighter",
      category: "Aircraft",
      department: "No. 45 Squadron Flying Daggers, Western Air Command",
      status: "Active",
      serialNumber: "IND-AF-2024-LA5021",
      location: "Air Force Station Sulur, Forward Operating Base",
    },
    document: {
      documentId: "DOC-CERT-2025-00125",
      referenceNumber: "CEMILAC/DOC/2025/1044-F",
      format: "PDF/A-1b Military Archive",
      fileSize: "6.2 MB",
      classification: "SECRET",
      sealedAt: "2025-11-20T11:00:00Z",
      checksum: "0x67a91bf2e89d0458134bbce02498516da89012f5a3b7c891e457d89b12e34fa9",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x78901234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      proofHash: "0x8901234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
      txHash: "0xbcde1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1720845,
      confirmations: 3840,
      timestamp: "2025-11-20T11:15:42Z",
      consensusSeal: "BFT-Seal-Validated-CEMILAC-Apex",
    },
    timeline: [
      {
        id: "TLE-201",
        timestamp: "2025-11-10T08:00:00Z",
        title: "Avionics Bus & AESA Radar Flight Check",
        description: "Radar ground track and air-to-air sweep verified through 18 flight test hours across Pokhran range.",
        status: "Completed",
        badge: "TESTING",
        performedBy: "National Flight Test Centre (NFTC)",
      },
      {
        id: "TLE-202",
        timestamp: "2025-11-18T16:00:00Z",
        title: "Airworthiness Board Clearance",
        description: "CEMILAC technical review board unreservedly votes operational flight release endorsement.",
        status: "Passed",
        badge: "APPROVAL",
        performedBy: "Joint Aviation Airworthiness Committee",
      },
      {
        id: "TLE-203",
        timestamp: "2025-11-20T11:00:00Z",
        title: "Certificate Issued & Sealed",
        description: "Official Military Airworthiness certificate signed by Air Vice Marshal S. Ramanathan.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Air Vice Marshal S. Ramanathan",
      },
      {
        id: "TLE-204",
        timestamp: "2025-11-20T11:15:42Z",
        title: "Anchored to Defence Ledger",
        description: "Cryptographic state hash permanently anchored to Novexa Defence Ledger block #1,720,845.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00126",
    certificateNumber: "DRDL/MSL/AKASH/2026-0021-S",
    type: "Compliance Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-01",
    expiryDate: "2027-01-31",
    validityDuration: "12 Months",
    standard: "DRDO-SAM-SPEC-2023 Air Defence Weapon System Interface Standards",
    complianceScope: "Active RF seeker guidance telemetry, C4I tactical radar link, and dual-pulse solid rocket motor ignition safe envelope",
    summary: "Missile telemetry compliance and target intercept electronic counter-countermeasures (ECCM) validation certificate.",
    authority: {
      name: "Defence Research & Development Laboratory (DRDL)",
      code: "AUTH-DRDL-HYD-004",
      signatoryOfficer: "Dr. G. Venkatnarayanan",
      rank: "Distinguished Scientist & Programme Director, Air Defence",
      accreditation: "DRDO Missile Complex, Hyderabad",
      office: "DRDL Kanchanbagh, Hyderabad",
      sealCode: "SEAL-IND-DRDO-DRDL-1092",
    },
    asset: {
      assetId: "AST-IND-003",
      assetName: "Akash-NG Surface-to-Air Missile System",
      category: "Weapon System",
      department: "112 Air Defence Missile Regiment",
      status: "Active",
      serialNumber: "IND-SAM-2023-AK9912",
      location: "Forward Surface-to-Air Missile Base Alpha, Punjab Sector",
    },
    document: {
      documentId: "DOC-CERT-2026-00126",
      referenceNumber: "DRDL/DOC/2026/0021-M",
      format: "PDF/A-1b Military Archive",
      fileSize: "5.1 MB",
      classification: "SECRET",
      sealedAt: "2026-02-01T10:15:00Z",
      checksum: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
      proofHash: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      txHash: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1891040,
      confirmations: 920,
      timestamp: "2026-02-01T10:28:14Z",
      consensusSeal: "BFT-Seal-Validated-DRDL-Apex",
    },
    timeline: [
      {
        id: "TLE-301",
        timestamp: "2026-01-22T06:00:00Z",
        title: "Dynamic Live-Fire Intercept Assessment",
        description: "Target drone intercepted at 28km range; telemetry data confirmed 99.4% guidance lock fidelity.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "Integrated Test Range (ITR), Chandipur",
      },
      {
        id: "TLE-302",
        timestamp: "2026-02-01T10:15:00Z",
        title: "Compliance Certification Granted",
        description: "Official DRDL certification issued by Programme Director Dr. G. Venkatnarayanan.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Dr. G. Venkatnarayanan",
      },
      {
        id: "TLE-303",
        timestamp: "2026-02-01T10:28:14Z",
        title: "Cryptographic Proof Anchored",
        description: "Certificate hash committed to Novexa Defence Ledger block #1,891,040.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00127",
    certificateNumber: "WESEE/EW/RADAR/2025-0450-R",
    type: "Maintenance Certification",
    status: "Expiring",
    verificationStatus: "Verified",
    issueDate: "2025-04-12",
    expiryDate: "2026-04-11",
    validityDuration: "12 Months",
    standard: "WESEE Military Sensor Calibration & TR-Module Tolerance Code",
    complianceScope: "Transmit-Receive module phase alignment, rotary waveguide rotary joint RF leak threshold, and IFF interrogator accuracy",
    summary: "Periodic sensor overhaul and calibration certification for naval 3D medium-range surveillance radar.",
    authority: {
      name: "Weapons & Electronics Systems Engineering Establishment (WESEE)",
      code: "AUTH-WESEE-DEL-022",
      signatoryOfficer: "Commodore R. S. Kulkarni",
      rank: "Commodore, Superintendent WESEE (Systems Integration)",
      accreditation: "Ministry of Defence (Navy)",
      office: "WESEE Complex, West Block V, R.K. Puram, New Delhi",
      sealCode: "SEAL-IND-NAVY-WESEE-4401",
    },
    asset: {
      assetId: "AST-IND-005",
      assetName: "Revathi 3D Surveillance Radar",
      category: "Surveillance Equipment",
      department: "Naval Technical Group, Western Fleet",
      status: "Active",
      serialNumber: "IND-RAD-2023-REV019",
      location: "Naval Dockyard Mumbai, Electronics Warfare Division",
    },
    document: {
      documentId: "DOC-CERT-2025-00127",
      referenceNumber: "WESEE/DOC/2025/0450-N",
      format: "PDF/A-1b Military Archive",
      fileSize: "3.9 MB",
      classification: "SECRET",
      sealedAt: "2025-04-12T14:20:00Z",
      checksum: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
      proofHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      txHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1540112,
      confirmations: 8910,
      timestamp: "2025-04-12T14:45:10Z",
      consensusSeal: "BFT-Seal-Validated-WESEE-Naval",
    },
    timeline: [
      {
        id: "TLE-401",
        timestamp: "2025-04-05T09:00:00Z",
        title: "RF Calibration & Noise Figure Analysis",
        description: "Waveguide attenuation certified within 0.04 dB margin across all 128 active beamforming channels.",
        status: "Passed",
        badge: "CALIBRATION",
        performedBy: "Naval Radar Overhaul Facility",
      },
      {
        id: "TLE-402",
        timestamp: "2025-04-12T14:20:00Z",
        title: "Maintenance Certificate Issued",
        description: "Authorized for 12 months naval deployment pending scheduled 2026 recertification.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Commodore R. S. Kulkarni",
      },
      {
        id: "TLE-403",
        timestamp: "2025-04-12T14:45:10Z",
        title: "Recorded on Defence Ledger",
        description: "State anchored to Novexa Defence Ledger block #1,540,112.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00128",
    certificateNumber: "DGQA/ELECT/SDR/2026-0312-C",
    type: "Quality Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-01-20",
    expiryDate: "2027-01-19",
    validityDuration: "12 Months",
    standard: "ISO 9001:2015 Defence Addendum & SCA v4.2 Software Defined Radio Spec",
    complianceScope: "Post-quantum cryptographic key exchange, frequency-hopping jam resistance (FHSS), and IP67 immersion durability",
    summary: "High-grade tactical communications equipment quality and cryptographic resistance certification.",
    authority: {
      name: "Directorate General of Quality Assurance (DGQA)",
      code: "AUTH-DGQA-BEL-019",
      signatoryOfficer: "Col. Sanjeev Khurana",
      rank: "Colonel, Controller of Quality Assurance (Electronics)",
      accreditation: "Ministry of Defence, DDP",
      office: "CQA (Electronics), Jalahalli, Bengaluru",
      sealCode: "SEAL-IND-MOD-DGQA-3310",
    },
    asset: {
      assetId: "AST-IND-004",
      assetName: "BharOS Tactical Software Defined Radio",
      category: "Communication Equipment",
      department: "Corps of Signals, Electronic Warfare Battalion",
      status: "Active",
      serialNumber: "IND-COM-2024-SDR412",
      location: "Signals Base Workshop, Jabalpur",
    },
    document: {
      documentId: "DOC-CERT-2026-00128",
      referenceNumber: "DGQA/DOC/2026/0312-E",
      format: "PDF/A-1b Military Archive",
      fileSize: "3.2 MB",
      classification: "SECRET",
      sealedAt: "2026-01-20T08:50:00Z",
      checksum: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      proofHash: "0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a",
      txHash: "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1860220,
      confirmations: 1210,
      timestamp: "2026-01-20T09:05:32Z",
      consensusSeal: "BFT-Seal-Validated-DGQA-Signals",
    },
    timeline: [
      {
        id: "TLE-501",
        timestamp: "2026-01-15T11:00:00Z",
        title: "Cryptographic Waveform Security Audit",
        description: "Zero key leakage verified under simulated 40 GHz electronic warfare jamming environment.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "Joint Signals Testing Laboratory",
      },
      {
        id: "TLE-502",
        timestamp: "2026-01-20T08:50:00Z",
        title: "Quality Certification Endorsed",
        description: "Certified for frontline combat communication deployment.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Sanjeev Khurana",
      },
      {
        id: "TLE-503",
        timestamp: "2026-01-20T09:05:32Z",
        title: "Anchored to Novexa Ledger",
        description: "Committed to ledger block #1,860,220.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00129",
    certificateNumber: "DGQA/MUN/FUZE/2026-0901-Q",
    type: "Quality Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-10",
    expiryDate: "2027-02-09",
    validityDuration: "12 Months",
    standard: "DEF-STAN 13-182 Munitions Fuze Safety & Arming Mechanism Code",
    complianceScope: "Acceleration sensing threshold (25,000 g setback tolerance), proximity sensor burst height accuracy, and electronic self-destruct mechanism",
    summary: "Pre-deployment batch quality certification for electronic proximity artillery fuzes.",
    authority: {
      name: "Controllerate of Quality Assurance (Ammunition)",
      code: "AUTH-CQA-KIR-008",
      signatoryOfficer: "Col. Manavendra Roy",
      rank: "Colonel, Controller CQA (Ammunition)",
      accreditation: "Ministry of Defence, DDP",
      office: "CQA Ammunition Complex, Kirkee, Pune",
      sealCode: "SEAL-IND-MOD-CQAA-1109",
    },
    asset: {
      assetId: "AST-IND-006",
      assetName: "Electronic Proximity Fuze (Artillery)",
      category: "Electronic Equipment",
      department: "Central Ammunition Depot (CAD) Pulgaon",
      status: "Active",
      serialNumber: "IND-AMMO-2024-FZ8012",
      location: "CAD Pulgaon, High Security Magazine 14",
    },
    document: {
      documentId: "DOC-CERT-2026-00129",
      referenceNumber: "CQA/DOC/2026/0901-A",
      format: "PDF/A-1b Military Archive",
      fileSize: "2.8 MB",
      classification: "CONFIDENTIAL",
      sealedAt: "2026-02-10T12:00:00Z",
      checksum: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
      proofHash: "0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1910400,
      confirmations: 640,
      timestamp: "2026-02-10T12:18:45Z",
      consensusSeal: "BFT-Seal-Validated-CQA-Ammo",
    },
    timeline: [
      {
        id: "TLE-601",
        timestamp: "2026-02-05T09:00:00Z",
        title: "Random Lot Centrifuge & Drop Test",
        description: "50 samples from production lot subjected to 30,000 g acceleration shock; 100% arming circuit integrity.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "Ammunition Quality Control Laboratory",
      },
      {
        id: "TLE-602",
        timestamp: "2026-02-10T12:00:00Z",
        title: "Quality Certificate Issued",
        description: "Lot approved for ordnance distribution to field artillery batteries.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Manavendra Roy",
      },
      {
        id: "TLE-603",
        timestamp: "2026-02-10T12:18:45Z",
        title: "Committed to Defence Ledger",
        description: "Cryptographically anchored in block #1,910,400.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00130",
    certificateNumber: "MES/GRID/PWR/2025-0814-S",
    type: "Safety Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2025-08-14",
    expiryDate: "2026-08-13",
    validityDuration: "12 Months",
    standard: "IEEE 1547.4 & Military Standard Microgrid Islanding Safety Protocol",
    complianceScope: "Lithium iron phosphate (LFP) energy storage thermal runaway containment, microgrid seamless islanding, and sub-zero operation (-40°C)",
    summary: "High-altitude tactical microgrid and battery energy storage system electrical safety clearance.",
    authority: {
      name: "Military Engineer Services (MES)",
      code: "AUTH-MES-NZ-003",
      signatoryOfficer: "Col. Arvind Deshmukh",
      rank: "Colonel, Commander Works Engineers (CWE) Northern Command",
      accreditation: "Ministry of Defence, Corps of Engineers",
      office: "MES Northern Command Headquarters, Udhampur",
      sealCode: "SEAL-IND-ARMY-MES-9022",
    },
    asset: {
      assetId: "AST-IND-007",
      assetName: "Forward Operating Base Tactical Microgrid",
      category: "Infrastructure",
      department: "Northern Command Logistics & Infrastructure Group",
      status: "Active",
      serialNumber: "IND-INFRA-2023-MG04",
      location: "High Altitude Forward Operating Base, Eastern Ladakh",
    },
    document: {
      documentId: "DOC-CERT-2025-00130",
      referenceNumber: "MES/DOC/2025/0814-P",
      format: "PDF/A-1b Military Archive",
      fileSize: "4.1 MB",
      classification: "CONFIDENTIAL",
      sealedAt: "2025-08-14T15:00:00Z",
      checksum: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      proofHash: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
      txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1650340,
      confirmations: 5920,
      timestamp: "2025-08-14T15:22:10Z",
      consensusSeal: "BFT-Seal-Validated-MES-Infra",
    },
    timeline: [
      {
        id: "TLE-701",
        timestamp: "2025-08-08T10:00:00Z",
        title: "Cold Soak & Load Drop Evaluation",
        description: "Zero inverter glitch observed during 100% instantaneous base load disconnection under simulated -35°C conditions.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "High Altitude Engineering Team",
      },
      {
        id: "TLE-702",
        timestamp: "2025-08-14T15:00:00Z",
        title: "Safety Certificate Granted",
        description: "MES electrical safety warrant authorized for forward deployment.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Arvind Deshmukh",
      },
      {
        id: "TLE-703",
        timestamp: "2025-08-14T15:22:10Z",
        title: "Proof Anchored to Ledger",
        description: "Record committed to Novexa Defence Ledger block #1,650,340.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00131",
    certificateNumber: "CEMILAC/UAS/SEAGUARDIAN/2026-0044-A",
    type: "Operational Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-01-05",
    expiryDate: "2027-01-04",
    validityDuration: "12 Months",
    standard: "NATO STANAG 4671 & CEMILAC UAS Airworthiness Code",
    complianceScope: "High-altitude long-endurance (HALE) satellite control datalink, maritime surface search radar integration, and autonomous return-to-base",
    summary: "Airworthiness and blue-water maritime surveillance flight authorization for MQ-9B UAS.",
    authority: {
      name: "Centre for Military Airworthiness and Certification (CEMILAC)",
      code: "AUTH-CEMILAC-UAS-005",
      signatoryOfficer: "Air Commodore M. K. Narayanan",
      rank: "Director, Unmanned Aerial Systems Airworthiness",
      accreditation: "Ministry of Defence, DRDO Apex Aviation Certification Body",
      office: "CEMILAC Regional Centre, INS Rajali, Arakkonam",
      sealCode: "SEAL-IND-DRDO-CEMILAC-0099",
    },
    asset: {
      assetId: "AST-IND-008",
      assetName: "MQ-9B SeaGuardian High-Altitude UAS",
      category: "Aircraft",
      department: "Naval Air Squadron 312, Eastern Naval Command",
      status: "Active",
      serialNumber: "IND-UAS-2024-MQ901",
      location: "INS Rajali Naval Air Station, Arakkonam",
    },
    document: {
      documentId: "DOC-CERT-2026-00131",
      referenceNumber: "CEMILAC/DOC/2026/0044-U",
      format: "PDF/A-1b Military Archive",
      fileSize: "7.1 MB",
      classification: "SECRET",
      sealedAt: "2026-01-05T14:00:00Z",
      checksum: "0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      proofHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
      txHash: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1831004,
      confirmations: 1610,
      timestamp: "2026-01-05T14:18:22Z",
      consensusSeal: "BFT-Seal-Validated-CEMILAC-UAS",
    },
    timeline: [
      {
        id: "TLE-801",
        timestamp: "2025-12-28T05:00:00Z",
        title: "32-Hour Endurance Datalink Verification",
        description: "Zero SATCOM loss throughout 32 continuous hours of maritime pattern surveillance over Indian Ocean Region.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "Joint Naval Flight Test Unit",
      },
      {
        id: "TLE-802",
        timestamp: "2026-01-05T14:00:00Z",
        title: "Airworthiness Certificate Issued",
        description: "Operational flight release endorsed by Air Commodore M. K. Narayanan.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Air Commodore M. K. Narayanan",
      },
      {
        id: "TLE-803",
        timestamp: "2026-01-05T14:18:22Z",
        title: "Anchored to Novexa Ledger",
        description: "Cryptographically recorded on ledger block #1,831,004.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00132",
    certificateNumber: "DGQA/ARTY/SPH/2026-0412-M",
    type: "Maintenance Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-18",
    expiryDate: "2027-02-17",
    validityDuration: "12 Months",
    standard: "DGQA Military Artillery 155mm 52-Cal Gun Barrel Wear & Recoil Specification",
    complianceScope: "Chrome lining bore erosion check, hydropneumatic recoil cylinder replenishment, and muzzle velocity radar calibration",
    summary: "Annual 500-round major service overhaul and safety certification for self-propelled tracked howitzer.",
    authority: {
      name: "Directorate General of Quality Assurance (DGQA)",
      code: "AUTH-DGQA-ARTY-014",
      signatoryOfficer: "Col. Virendra Rawat",
      rank: "Colonel, Controller CQA (Weapons)",
      accreditation: "Ministry of Defence, DDP",
      office: "CQA (Weapons), Ordnance Factory Hazira Division",
      sealCode: "SEAL-IND-MOD-DGQA-4421",
    },
    asset: {
      assetId: "AST-IND-009",
      assetName: "K9 Vajra-T 155mm Tracked Self-Propelled Howitzer",
      category: "Weapon System",
      department: "51st Field Regiment, Strike Corps",
      status: "Active",
      serialNumber: "IND-ARTY-2023-K9104",
      location: "Desert Corps Artillery Base, Jodhpur",
    },
    document: {
      documentId: "DOC-CERT-2026-00132",
      referenceNumber: "DGQA/DOC/2026/0412-K",
      format: "PDF/A-1b Military Archive",
      fileSize: "4.5 MB",
      classification: "CONFIDENTIAL",
      sealedAt: "2026-02-18T11:00:00Z",
      checksum: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890a",
      proofHash: "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
      txHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1928400,
      confirmations: 410,
      timestamp: "2026-02-18T11:24:50Z",
      consensusSeal: "BFT-Seal-Validated-DGQA-Weapons",
    },
    timeline: [
      {
        id: "TLE-901",
        timestamp: "2026-02-14T08:00:00Z",
        title: "Bore Scoping & Muzzle Recoil Overhaul",
        description: "Gun barrel erosion measurement confirmed 0.12mm well below 0.85mm critical replacement threshold.",
        status: "Passed",
        badge: "MAINTENANCE",
        performedBy: "L&T Heavy Engineering Service Depot",
      },
      {
        id: "TLE-902",
        timestamp: "2026-02-18T11:00:00Z",
        title: "Maintenance Certificate Endorsed",
        description: "Authorized for frontline battery deployment for next 12 operational months.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Virendra Rawat",
      },
      {
        id: "TLE-903",
        timestamp: "2026-02-18T11:24:50Z",
        title: "Committed to Defence Ledger",
        description: "Hash permanently sealed on ledger block #1,928,400.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00133",
    certificateNumber: "ARDE/ROCKET/MBRL/2026-0118-C",
    type: "Compliance Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-01-28",
    expiryDate: "2027-01-27",
    validityDuration: "12 Months",
    standard: "DRDO-ARDE Rocket Launch Pod Electronic Safe-Arm & Ignition Code",
    complianceScope: "Salvo ripple-fire timing jitter under 40 microseconds, digital launcher elevation gyro stability, and tactical data terminal integration",
    summary: "Multi-barrel rocket launcher firing electronics and fire-control computer compliance certification.",
    authority: {
      name: "Armament Research & Development Establishment (ARDE)",
      code: "AUTH-ARDE-PUN-002",
      signatoryOfficer: "Dr. Pratibha Nair",
      rank: "Outstanding Scientist & Director, ARDE Pune",
      accreditation: "Ministry of Defence, DRDO Armament Cluster",
      office: "ARDE Pashan Complex, Pune",
      sealCode: "SEAL-IND-DRDO-ARDE-3012",
    },
    asset: {
      assetId: "AST-IND-010",
      assetName: "Pinaka Multi-Barrel Rocket Launcher (MBRL)",
      category: "Weapon System",
      department: "189th Pinaka Rocket Regiment",
      status: "Active",
      serialNumber: "IND-ROCKET-2024-PK8801",
      location: "Desert Sector Launch Complex Delta, Pokhran",
    },
    document: {
      documentId: "DOC-CERT-2026-00133",
      referenceNumber: "ARDE/DOC/2026/0118-P",
      format: "PDF/A-1b Military Archive",
      fileSize: "4.2 MB",
      classification: "SECRET",
      sealedAt: "2026-01-28T16:00:00Z",
      checksum: "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
      proofHash: "0xef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
      txHash: "0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1878900,
      confirmations: 1050,
      timestamp: "2026-01-28T16:21:40Z",
      consensusSeal: "BFT-Seal-Validated-ARDE-Root",
    },
    timeline: [
      {
        id: "TLE-1001",
        timestamp: "2026-01-24T06:30:00Z",
        title: "Full 12-Rocket Salvo Test at Range",
        description: "All 12 rockets successfully launched within 44 seconds; zero ignition delay observed.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "Pokhran Field Artillery Proving Grounds",
      },
      {
        id: "TLE-1002",
        timestamp: "2026-01-28T16:00:00Z",
        title: "Compliance Certification Granted",
        description: "Official ARDE certification issued by Director Dr. Pratibha Nair.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Dr. Pratibha Nair",
      },
      {
        id: "TLE-1003",
        timestamp: "2026-01-28T16:21:40Z",
        title: "Anchored to Defence Ledger",
        description: "State committed to Novexa Defence Ledger block #1,878,900.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00134",
    certificateNumber: "IRDE/OPT/TARGETING/2026-0204-Q",
    type: "Quality Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-14",
    expiryDate: "2027-02-13",
    validityDuration: "12 Months",
    standard: "IRDE Electro-Optics Thermal Imaging & Laser Designation Standard",
    complianceScope: "Mid-wave infrared (MWIR) cooled sensor resolution, laser spot tracker boresight alignment, and gimbal gyro stabilization under 8 micro-radians",
    summary: "Airborne electro-optical/infrared laser designator pod optical alignment and sensor quality clearance.",
    authority: {
      name: "Instruments Research & Development Establishment (IRDE)",
      code: "AUTH-IRDE-DDN-001",
      signatoryOfficer: "Dr. Alok Kumar Bhatnagar",
      rank: "Distinguished Scientist & Director, IRDE Dehradun",
      accreditation: "Ministry of Defence, DRDO Electro-Optics Cluster",
      office: "IRDE Complex, Raipur, Dehradun",
      sealCode: "SEAL-IND-DRDO-IRDE-7714",
    },
    asset: {
      assetId: "AST-IND-011",
      assetName: "Airborne Electro-Optical / Infrared Targeting Pod",
      category: "Surveillance Equipment",
      department: "Western Air Command Electronic Warfare Depot",
      status: "Active",
      serialNumber: "IND-SURV-2024-EO902",
      location: "Air Force Station Ambala, Avionics Bay 2",
    },
    document: {
      documentId: "DOC-CERT-2026-00134",
      referenceNumber: "IRDE/DOC/2026/0204-O",
      format: "PDF/A-1b Military Archive",
      fileSize: "3.6 MB",
      classification: "SECRET",
      sealedAt: "2026-02-14T10:00:00Z",
      checksum: "0xf1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      proofHash: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
      txHash: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1919800,
      confirmations: 530,
      timestamp: "2026-02-14T10:19:15Z",
      consensusSeal: "BFT-Seal-Validated-IRDE-Optics",
    },
    timeline: [
      {
        id: "TLE-1101",
        timestamp: "2026-02-10T14:00:00Z",
        title: "Optical Collimation & Boresight Alignment",
        description: "Laser beam divergence certified under 0.2 mrad across full continuous zoom range.",
        status: "Passed",
        badge: "CALIBRATION",
        performedBy: "IRDE Electro-Optics Testing Laboratory",
      },
      {
        id: "TLE-1102",
        timestamp: "2026-02-14T10:00:00Z",
        title: "Quality Certificate Issued",
        description: "Authorized for frontline fighter aircraft targeting pod integration.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Dr. Alok Kumar Bhatnagar",
      },
      {
        id: "TLE-1103",
        timestamp: "2026-02-14T10:19:15Z",
        title: "Recorded on Defence Ledger",
        description: "Block #1,919,800 committed with validated consensus seal.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00135",
    certificateNumber: "DGQA/CYBER/SEC/2026-0012-P",
    type: "Compliance Certification",
    status: "Valid",
    verificationStatus: "Verified",
    issueDate: "2026-02-08",
    expiryDate: "2027-02-07",
    validityDuration: "12 Months",
    standard: "Defence Cyber Agency (DCA) Level-4 Sovereign Cryptographic Standard",
    complianceScope: "Indigenously fabricated 28nm ASIC hardware security module (HSM), side-channel attack resistance, and post-quantum digital signature verification",
    summary: "Cryptographic coprocessor hardware security validation and sovereign root-of-trust certification.",
    authority: {
      name: "Defence Quality Assurance Authority (Cyber Systems)",
      code: "AUTH-DGQA-CYBER-001",
      signatoryOfficer: "Major Gen. Ananthakrishnan Nair",
      rank: "Additional Director General, Cyber Systems Quality Assurance",
      accreditation: "Ministry of Defence, DCA & DDP",
      office: "DGQA Cyber Cell, Integrated Defence Staff, New Delhi",
      sealCode: "SEAL-IND-DCA-DGQA-9901",
    },
    asset: {
      assetId: "AST-IND-012",
      assetName: "Defence Fast Cryptographic Coprocessor DFCC-20",
      category: "Electronic Equipment",
      department: "Defence Cyber Agency (DCA) Core Network Ops",
      status: "Active",
      serialNumber: "IND-ELEC-2024-CC088",
      location: "DCA Secure Command Data Centre, New Delhi",
    },
    document: {
      documentId: "DOC-CERT-2026-00135",
      referenceNumber: "DGQA/DOC/2026/0012-C",
      format: "PDF/A-1b Military Archive",
      fileSize: "5.4 MB",
      classification: "SECRET",
      sealedAt: "2026-02-08T11:30:00Z",
      checksum: "0x234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1",
    },
    proof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      certificateHash: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
      proofHash: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
      txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1904100,
      confirmations: 780,
      timestamp: "2026-02-08T11:48:20Z",
      consensusSeal: "BFT-Seal-Validated-DCA-CyberRoot",
    },
    timeline: [
      {
        id: "TLE-1201",
        timestamp: "2026-02-03T10:00:00Z",
        title: "Side-Channel Differential Power Analysis (DPA)",
        description: "Zero side-channel key leakage across 5,000,000 hardware cryptographic trace samples.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "DCA Hardware Security Evaluation Facility",
      },
      {
        id: "TLE-1202",
        timestamp: "2026-02-08T11:30:00Z",
        title: "Cryptographic Level-4 Certificate Endorsed",
        description: "Sovereign hardware cryptographic compliance certified by Major Gen. Ananthakrishnan Nair.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Major Gen. Ananthakrishnan Nair",
      },
      {
        id: "TLE-1203",
        timestamp: "2026-02-08T11:48:20Z",
        title: "Anchored to Defence Ledger",
        description: "State committed to Novexa Defence Ledger block #1,904,100.",
        status: "Anchored",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
  {
    id: "CERT-2026-00136",
    certificateNumber: "DGQA/MECH/RECOV/2024-0319-E",
    type: "Safety Certification",
    status: "Expired",
    verificationStatus: "Verification Required",
    issueDate: "2024-03-20",
    expiryDate: "2025-03-19",
    validityDuration: "12 Months",
    standard: "DGQA Heavy Combat Engineering & Winch Line Pull Safety Standard",
    complianceScope: "45-tonne main recovery winch load test, boom crane deflection under 20-tonne payload, and hydraulic stabilizer ground pressure",
    summary: "Annual heavy recovery crane and hydraulic line pull load safety certification.",
    authority: {
      name: "Directorate General of Quality Assurance (DGQA)",
      code: "AUTH-DGQA-HV-042",
      signatoryOfficer: "Col. Hemant Bakshi",
      rank: "Colonel, CQA Heavy Vehicles Division",
      accreditation: "Ministry of Defence, DDP",
      office: "CQA (Heavy Vehicles), Avadi, Chennai",
      sealCode: "SEAL-IND-MOD-DGQA-1090",
    },
    asset: {
      assetId: "AST-IND-013",
      assetName: "Armored Recovery Vehicle WZT-3M",
      category: "Vehicle",
      department: "Strike Corps Engineering Brigade",
      status: "Inactive",
      serialNumber: "IND-AFV-2022-ARV091",
      location: "Central Base Workshop 510, Meerut",
    },
    document: {
      documentId: "DOC-CERT-2024-00136",
      referenceNumber: "DGQA/DOC/2024/0319-W",
      format: "PDF/A-1b Military Archive",
      fileSize: "3.5 MB",
      classification: "RESTRICTED",
      sealedAt: "2024-03-20T14:00:00Z",
      checksum: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    },
    proof: {
      verificationStatus: "Requires Recertification Verification",
      certificateHash: "0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123",
      proofHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      txHash: "0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1210940,
      confirmations: 19400,
      timestamp: "2024-03-20T14:35:10Z",
      consensusSeal: "BFT-Seal-Expired-Audit-Required",
    },
    timeline: [
      {
        id: "TLE-1301",
        timestamp: "2024-03-15T11:00:00Z",
        title: "Load Deflection Testing Completed",
        description: "Crane certified for 20-tonne dynamic lift capacity.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "CQA Heavy Testing Facility",
      },
      {
        id: "TLE-1302",
        timestamp: "2024-03-20T14:00:00Z",
        title: "Safety Certificate Issued",
        description: "Authorized for 12 months engineering deployment.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Hemant Bakshi",
      },
      {
        id: "TLE-1303",
        timestamp: "2025-03-19T23:59:59Z",
        title: "Certificate Validity Expired",
        description: "Asset flag set to Inactive; requires full winch recertification before operational redeployment.",
        status: "Expired",
        badge: "EXPIRED",
        performedBy: "Novexa Automated Lifecycle Daemon",
      },
    ],
  },
  {
    id: "CERT-2026-00137",
    certificateNumber: "DGQA/RADAR/LOW/2026-0220-P",
    type: "Operational Certification",
    status: "Valid",
    verificationStatus: "Pending Verification",
    issueDate: "2026-02-22",
    expiryDate: "2027-02-21",
    validityDuration: "12 Months",
    standard: "Military Air Defence Radar Tactical Sensor Field Standard",
    complianceScope: "Low-level radar horizon coverage detection (50m - 3,000m altitude), clutter rejection in mountainous terrain, and quick-mast deployment (under 15 minutes)",
    summary: "Battlefield low-level 3D surveillance radar field operation clearance pending final blockchain anchor consensus.",
    authority: {
      name: "Directorate General of Quality Assurance (DGQA)",
      code: "AUTH-DGQA-RADAR-009",
      signatoryOfficer: "Col. Vikramjeet Randhawa",
      rank: "Colonel, CQA Radar & Optical Division",
      accreditation: "Ministry of Defence, DDP",
      office: "CQA Radar Complex, Ghaziabad",
      sealCode: "SEAL-IND-MOD-DGQA-7720",
    },
    asset: {
      assetId: "AST-IND-014",
      assetName: "Bharani Low-Level Lightweight 2D/3D Radar",
      category: "Surveillance Equipment",
      department: "Mountain Air Defence Battery, Eastern Sector",
      status: "Active",
      serialNumber: "IND-RAD-2024-BHR09",
      location: "Mountain Air Defence Base, Tawang Forward Sector",
    },
    document: {
      documentId: "DOC-CERT-2026-00137",
      referenceNumber: "DGQA/DOC/2026/0220-B",
      format: "PDF/A-1b Military Archive",
      fileSize: "4.0 MB",
      classification: "CONFIDENTIAL",
      sealedAt: "2026-02-22T09:00:00Z",
      checksum: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    },
    proof: {
      verificationStatus: "Awaiting Final Consensus Confirmation",
      certificateHash: "0x67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345",
      proofHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      txHash: "0x890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567",
      contractAddress: "0x71C568903B42C5F4060893198AcB28E61994e49A",
      network: "Novexa Defence Subnet (Private PoA)",
      blockNumber: 1941200,
      confirmations: 12,
      timestamp: "2026-02-22T09:15:00Z",
      consensusSeal: "BFT-Pending-Threshold-3/5",
    },
    timeline: [
      {
        id: "TLE-1401",
        timestamp: "2026-02-18T10:00:00Z",
        title: "Mountain Clutter Suppression Verified",
        description: "Successfully tracked micro-UAV radar cross-section (0.01 m²) against alpine terrain background.",
        status: "Passed",
        badge: "TESTING",
        performedBy: "High Altitude Radar Proving Unit",
      },
      {
        id: "TLE-1402",
        timestamp: "2026-02-22T09:00:00Z",
        title: "Operational Certificate Issued",
        description: "Official certificate endorsed by Col. Vikramjeet Randhawa.",
        status: "Authorized",
        badge: "ISSUED",
        performedBy: "Col. Vikramjeet Randhawa",
      },
      {
        id: "TLE-1403",
        timestamp: "2026-02-22T09:15:00Z",
        title: "Submitted for Ledger Anchoring",
        description: "Transaction broadcast to Novexa Defence validator nodes; accumulating confirmations.",
        status: "Pending",
        badge: "BLOCKCHAIN",
        performedBy: "Novexa Automated Ledger Gateway",
      },
    ],
  },
];

export interface CertificationFilterOptions {
  search?: string;
  type?: string;
  status?: string;
  verification?: string;
}

export function getCertifications(filters?: CertificationFilterOptions): CertificationRecord[] {
  let list = [...INITIAL_CERTIFICATIONS];

  if (!filters) return list;

  const { search, type, status, verification } = filters;

  if (search && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.certificateNumber.toLowerCase().includes(q) ||
        c.asset.assetName.toLowerCase().includes(q) ||
        c.asset.assetId.toLowerCase().includes(q) ||
        c.authority.name.toLowerCase().includes(q) ||
        c.authority.code.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.standard.toLowerCase().includes(q)
    );
  }

  if (type && type !== "ALL") {
    list = list.filter((c) => c.type.toLowerCase() === type.toLowerCase());
  }

  if (status && status !== "ALL") {
    list = list.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  if (verification && verification !== "ALL") {
    list = list.filter((c) => c.verificationStatus.toLowerCase() === verification.toLowerCase());
  }

  return list;
}

export function getCertificationById(id: string): CertificationRecord | undefined {
  if (!id) return undefined;
  const direct = INITIAL_CERTIFICATIONS.find((c) => c.id.toLowerCase() === id.toLowerCase());
  if (direct) return direct;

  // Fallback by certificate number or asset ID
  return INITIAL_CERTIFICATIONS.find(
    (c) =>
      c.certificateNumber.toLowerCase() === id.toLowerCase() ||
      c.id.toLowerCase().endsWith(id.toLowerCase()) ||
      c.asset.assetId.toLowerCase() === id.toLowerCase()
  );
}

export function getCertificationStats() {
  const total = INITIAL_CERTIFICATIONS.length;
  const valid = INITIAL_CERTIFICATIONS.filter((c) => c.status === "Valid").length;
  const expiring = INITIAL_CERTIFICATIONS.filter((c) => c.status === "Expiring").length;
  const expired = INITIAL_CERTIFICATIONS.filter((c) => c.status === "Expired").length;
  const verified = INITIAL_CERTIFICATIONS.filter((c) => c.verificationStatus === "Verified").length;
  const pending = INITIAL_CERTIFICATIONS.filter((c) => c.verificationStatus === "Pending Verification").length;

  return {
    total,
    valid,
    expiring,
    expired,
    verified,
    pending,
  };
}

export function getDemoCertifications() {
  return INITIAL_CERTIFICATIONS.map((c) => ({
    ...c,
    cert_id: c.id,
    asset_id: c.asset?.assetId || "",
    batch_id: (c as any).document?.referenceNumber || "FUZE-BATCH-2026-001",
    tx_hash: c.proof?.txHash || "0x0000000000000000000000000000000000000000",
  }));
}
