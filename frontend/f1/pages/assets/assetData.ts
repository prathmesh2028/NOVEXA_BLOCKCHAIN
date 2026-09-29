export type AssetCategory =
  | "Vehicle"
  | "Aircraft"
  | "Weapon System"
  | "Communication Equipment"
  | "Surveillance Equipment"
  | "Electronic Equipment"
  | "Infrastructure";

export type AssetStatus =
  | "Active"
  | "Under Maintenance"
  | "Inactive"
  | "Decommissioned";

export type VerificationStatus =
  | "Verified"
  | "Pending Verification"
  | "Verification Required";

export type BlockchainProofStatus =
  | "Anchored"
  | "Pending"
  | "Verification Required";

export type SecurityClassification =
  | "RESTRICTED"
  | "CONFIDENTIAL"
  | "SECRET"
  | "TOP SECRET / DEFENCE";

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  performedBy: string;
  status: "Completed" | "In Progress" | "Scheduled";
  notes: string;
}

export interface BlockchainProof {
  verificationStatus: string;
  assetHash: string;
  transactionId: string;
  blockNumber: number;
  confirmations: number;
  timestamp: string;
  network: string;
  consensusSeal: string;
  proofStandard: string;
}

export interface CertificationInfo {
  certificateId: string;
  type: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: "Valid" | "Active" | "Expired" | "Under Review";
  verificationStatus: "Verified" | "Pending" | "Unverified";
  digitalSignature: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: "registration" | "acquisition" | "assignment" | "certification" | "maintenance" | "verification" | "blockchain";
  referenceBadge?: string;
  status?: string;
}

export interface DefenceAsset {
  id: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  department: string;
  location: string;
  lastMaintenanceDate: string;
  verificationStatus: VerificationStatus;
  proofStatus: BlockchainProofStatus;
  manufacturer: string;
  model: string;
  acquisitionDate: string;
  acquisitionMethod: string;
  classification: SecurityClassification;
  custodian: string;
  specsSummary: string;
  description: string;
  maintenanceHistory: MaintenanceRecord[];
  blockchainProof: BlockchainProof;
  certification: CertificationInfo | null;
  timeline: TimelineEvent[];

  // Legacy/cross-compatibility fields for F1 components:
  batchId: string;
  type: string;
  lifecycle: string;
  supplier: string;
  registeredBy: string;
  registeredAt: string;
  updatedAt: string;
  evidenceCount: number;
  certId?: string;
  maintenanceStatus?: string;
  verification?: string;
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  "Vehicle",
  "Aircraft",
  "Weapon System",
  "Communication Equipment",
  "Surveillance Equipment",
  "Electronic Equipment",
  "Infrastructure",
];

export const ASSET_STATUSES: AssetStatus[] = [
  "Active",
  "Under Maintenance",
  "Inactive",
  "Decommissioned",
];

export const VERIFICATION_STATUSES: VerificationStatus[] = [
  "Verified",
  "Pending Verification",
  "Verification Required",
];

export const INITIAL_DEFENCE_ASSETS: DefenceAsset[] = [
  {
    id: "DEF-VEH-2026-0042",
    name: "T-90M Bhishma Main Battle Tank",
    serialNumber: "SN-T90M-0042-IND",
    category: "Vehicle",
    status: "Active",
    department: "Armoured Corps / Western Command",
    location: "Base Arsenal - Pune",
    lastMaintenanceDate: "2026-08-14",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Heavy Vehicles Factory (HVF) Avadi",
    model: "T-90M Bhishma Mk-III",
    acquisitionDate: "2024-03-15",
    acquisitionMethod: "MoD Strategic Indigenous Production Corridor (IDDM)",
    classification: "SECRET",
    custodian: "Col. R. S. Shekhawat (Armoured Regt)",
    specsSummary: "125mm 2A46M-5 Smoothbore Gun, Relikt ERA reactive armor, Kalina Hunter-Killer FCS, 1130hp diesel engine",
    description: "Third-generation main battle tank fitted with domestic composite armor, digital tactical networking, and thermal panoramic commander sight.",
    batchId: "BATCH-ARM-2024-08",
    type: "Vehicle",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "HVF Avadi / Armoured Vehicles Nigam Ltd",
    registeredBy: "Directorate General of Mechanised Forces",
    registeredAt: "2024-03-20T09:30:00Z",
    updatedAt: "2026-08-14T11:45:00Z",
    evidenceCount: 7,
    certId: "CERT-DEF-2026-00109",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x8fa92be167d4f9012e88a3194dc6778f13b692341209eef458aa912c01928374",
      transactionId: "TX-NOV-2026-99412-ARM",
      blockNumber: 1489203,
      confirmations: 1280,
      timestamp: "2026-08-14T12:00:00Z",
      network: "Novexa Private Permissioned Subnet (Hyperledger Fabric)",
      consensusSeal: "BFT-Defence-MultiSig-Verified",
      proofStandard: "MIL-STD-810G Ledger Immutability Anchor",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00109",
      type: "Combat Vehicle Ballistic & Tactical Acceptance",
      issuingAuthority: "Directorate General of Quality Assurance (DGQA)",
      issueDate: "2024-04-01",
      expiryDate: "2028-04-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x98f41c09ab723efd681289bca714ec00",
    },
    maintenanceHistory: [
      {
        id: "MNT-001",
        date: "2026-08-14",
        type: "Scheduled Level-3 Armament Overhaul",
        performedBy: "512 Army Base Workshop, Kirkee",
        status: "Completed",
        notes: "Bore clearance measured within 0.02mm tolerance. Gun stabilization gyroscopes calibrated with zero drift.",
      },
      {
        id: "MNT-002",
        date: "2026-02-10",
        type: "Thermal Imager & FCS Sensor Alignment",
        performedBy: "Armoured Static Depot, Pune",
        status: "Completed",
        notes: "Replaced cryogenic cooler assembly on commander sight. Digital laser rangefinder synchronized.",
      },
      {
        id: "MNT-003",
        date: "2025-07-22",
        type: "Powerpack & Transmission Diagnostics",
        performedBy: "HVF Technical Field Support Team",
        status: "Completed",
        notes: "Automated transmission control unit flashed with MIL-STD firmware v4.12. Oil spectral analysis normal.",
      },
    ],
    timeline: [
      {
        id: "TL-01",
        timestamp: "2024-03-15T08:00:00Z",
        title: "Asset Acquired",
        description: "Formally inducted under Strategic Defence Corridor Phase-II from HVF Avadi.",
        category: "acquisition",
        referenceBadge: "PO-HVF-2024-91",
      },
      {
        id: "TL-02",
        timestamp: "2024-03-20T09:30:00Z",
        title: "Asset Registered in Registry",
        description: "Digital identity anchored with MIL-STD serial verification and cryptographic key assignment.",
        category: "registration",
        referenceBadge: "REG-IND-8812",
      },
      {
        id: "TL-03",
        timestamp: "2024-04-01T14:00:00Z",
        title: "DGQA Tactical Certification Issued",
        description: "Official Ballistic & Armor integrity certificate awarded following Pokhran field trials.",
        category: "certification",
        referenceBadge: "CERT-DEF-2026-00109",
      },
      {
        id: "TL-04",
        timestamp: "2024-05-10T10:15:00Z",
        title: "Asset Assigned to Western Command",
        description: "Deployed to Armoured Corps Base Arsenal, Pune under Captive Maintenance protocol.",
        category: "assignment",
        referenceBadge: "DEP-PUNE-01",
      },
      {
        id: "TL-05",
        timestamp: "2026-08-14T11:45:00Z",
        title: "Maintenance Completed",
        description: "Level-3 Armament overhaul completed by 512 Army Base Workshop.",
        category: "maintenance",
        status: "Completed",
      },
      {
        id: "TL-06",
        timestamp: "2026-08-14T12:00:00Z",
        title: "Blockchain Proof Anchored",
        description: "Maintenance log and state hash anchored on Novexa Defence Ledger block #1,489,203.",
        category: "blockchain",
        referenceBadge: "TX-NOV-2026-99412-ARM",
      },
    ],
  },
  {
    id: "DEF-AIR-2026-0088",
    name: "HAL Tejas Mk-1A Multirole Fighter",
    serialNumber: "SN-LCA-1088-IAF",
    category: "Aircraft",
    status: "Active",
    department: "Western Air Command / No. 45 Flying Daggers",
    location: "Air Force Station - Chandigarh",
    lastMaintenanceDate: "2026-09-02",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Hindustan Aeronautics Limited (HAL)",
    model: "Tejas Mk-1A Advanced Multirole",
    acquisitionDate: "2024-07-28",
    acquisitionMethod: "MoD Direct Capital Aviation Procurement",
    classification: "TOP SECRET / DEFENCE",
    custodian: "Wing Cmdr. Tarun Mathur (Squadron Commander)",
    specsSummary: "EL/M-2052 AESA Radar, Unified Electronic Warfare Suite (UEWS), In-flight Refuelling Probe, Astra BVR Capable",
    description: "Fourth-generation supersonic lightweight single-engine tactical multirole combat aircraft featuring composite airframe and quadruple fly-by-wire flight control.",
    batchId: "BATCH-LCA-2024-03",
    type: "Aircraft",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "Hindustan Aeronautics Limited - Aircraft Division",
    registeredBy: "Air Headquarters Maintenance Branch",
    registeredAt: "2024-08-01T10:00:00Z",
    updatedAt: "2026-09-02T16:20:00Z",
    evidenceCount: 9,
    certId: "CERT-DEF-2026-00214",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x3e71d49a008c2bf894120dfa19456209bca74391ea2803b90429f55e0031dc71",
      transactionId: "TX-NOV-2026-88312-AIR",
      blockNumber: 1494118,
      confirmations: 820,
      timestamp: "2026-09-02T16:30:00Z",
      network: "Novexa Air Defense Partitioned Network",
      consensusSeal: "DGAQA-IAF-Consensus-Attested",
      proofStandard: "Airworthiness MIL-STD-1553B Digital Trust",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00214",
      type: "Full Military Airworthiness Type Certificate",
      issuingAuthority: "Center for Military Airworthiness and Certification (CEMILAC)",
      issueDate: "2024-08-10",
      expiryDate: "2027-08-10",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x78ab312cd894ef99a801b723cd89e110",
    },
    maintenanceHistory: [
      {
        id: "MNT-004",
        date: "2026-09-02",
        type: "AESA Radar RF Emission & Antenna Recalibration",
        performedBy: "Base Repair Depot (3 BRD), Chandigarh",
        status: "Completed",
        notes: "AESA gallium-arsenide T/R modules inspected; transmit gain within 0.1dB spec. Jammer pod ECCM validated.",
      },
      {
        id: "MNT-005",
        date: "2026-04-18",
        type: "Fly-by-Wire Quadruple Redundancy Flight Check",
        performedBy: "HAL Technical Liaison Unit",
        status: "Completed",
        notes: "Actuator response latency verified <12ms across all primary control surfaces. Digital flight log synchronized.",
      },
    ],
    timeline: [
      {
        id: "TL-07",
        timestamp: "2024-07-28T09:00:00Z",
        title: "Asset Acquired from HAL",
        description: "Rollout acceptance flight passed at HAL Bangalore facilities.",
        category: "acquisition",
        referenceBadge: "HAL-AC-2024-088",
      },
      {
        id: "TL-08",
        timestamp: "2024-08-01T10:00:00Z",
        title: "Asset Registered",
        description: "Official tail number and flight cryptokey provisioned in NOVEXA Trust Registry.",
        category: "registration",
        referenceBadge: "SN-LCA-1088",
      },
      {
        id: "TL-09",
        timestamp: "2024-08-10T11:30:00Z",
        title: "CEMILAC Airworthiness Certification Issued",
        description: "Unrestricted tactical envelope clearance issued by CEMILAC.",
        category: "certification",
        referenceBadge: "CERT-DEF-2026-00214",
      },
      {
        id: "TL-10",
        timestamp: "2026-09-02T16:20:00Z",
        title: "Periodic Avionics Inspection Complete",
        description: "Completed 200-hour airframe & AESA sensor calibration check.",
        category: "maintenance",
        status: "Completed",
      },
      {
        id: "TL-11",
        timestamp: "2026-09-02T16:30:00Z",
        title: "Blockchain State Anchored",
        description: "Flight certificate and engine cycle metrics anchored to block #1,494,118.",
        category: "blockchain",
        referenceBadge: "TX-NOV-2026-88312-AIR",
      },
    ],
  },
  {
    id: "DEF-WPN-2026-0105",
    name: "Akash-NG Surface-to-Air Missile Launcher",
    serialNumber: "SN-AKNG-0105-BDL",
    category: "Weapon System",
    status: "Active",
    department: "Air Defence Directorate / Southern Command",
    location: "Base Depot 4 - Bangalore",
    lastMaintenanceDate: "2026-07-30",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Bharat Dynamics Limited (BDL) / DRDO",
    model: "Akash-NG Mobile Transporter Erector Launcher",
    acquisitionDate: "2024-11-12",
    acquisitionMethod: "Indigenous Defence Manufacturing & Induction Scheme",
    classification: "SECRET",
    custodian: "Col. Sanjeev Nair (Air Defence Artillery)",
    specsSummary: "Dual-pulse solid rocket motor, Active RF seeker, 70km interception ceiling, multi-target engagement capability",
    description: "Next-generation surface-to-air missile system on 8x8 heavy mobility vehicle, integrated with command guidance link and phased array radar.",
    batchId: "BATCH-BDL-2024-11",
    type: "Weapon System",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "Bharat Dynamics Limited",
    registeredBy: "Directorate General of Air Defence",
    registeredAt: "2024-11-20T14:00:00Z",
    updatedAt: "2026-07-30T10:15:00Z",
    evidenceCount: 6,
    certId: "CERT-DEF-2026-00305",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x5d90184afbc891100234ac6912384fe901237a89bc441209eef01489ac870192",
      transactionId: "TX-NOV-2026-77102-WPN",
      blockNumber: 1478902,
      confirmations: 2410,
      timestamp: "2026-07-30T10:30:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "DRDO-BDL-Joint-Validation",
      proofStandard: "Missile Systems Ordnance Standard MIL-STD-1901A",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00305",
      type: "Tactical Ordnance & Pyrotechnic Safety Clearance",
      issuingAuthority: "Directorate General of Aeronautical Quality Assurance (DGAQA)",
      issueDate: "2024-12-05",
      expiryDate: "2027-12-05",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x12fa9841bcd897e41103bc89a7123ef0",
    },
    maintenanceHistory: [
      {
        id: "MNT-006",
        date: "2026-07-30",
        type: "Hydraulic Erector & Launch Rail Alignment Check",
        performedBy: "Southern Command Ordnance Depot",
        status: "Completed",
        notes: "Elevation and azimuth hydraulic actuators serviced; optical line-of-sight test completed within 0.05 mil tolerance.",
      },
      {
        id: "MNT-007",
        date: "2026-01-14",
        type: "Seeker Cryptographic Key Card Replacement",
        performedBy: "DRDO Ballistics Field Unit",
        status: "Completed",
        notes: "Hardware security module (HSM) seed refreshed with updated encrypted friend-or-foe (IFF) response tables.",
      },
    ],
    timeline: [
      {
        id: "TL-12",
        timestamp: "2024-11-12T08:30:00Z",
        title: "Asset Acquired",
        description: "Delivered from BDL Bhanur plant following simulated interception test runs.",
        category: "acquisition",
      },
      {
        id: "TL-13",
        timestamp: "2024-11-20T14:00:00Z",
        title: "Asset Registered in Registry",
        description: "Assigned ID DEF-WPN-2026-0105 with serial telemetry pairing.",
        category: "registration",
      },
      {
        id: "TL-14",
        timestamp: "2024-12-05T09:00:00Z",
        title: "Certification Issued",
        description: "DGAQA Ordnance Safety & Deployment Certificate officially approved.",
        category: "certification",
      },
      {
        id: "TL-15",
        timestamp: "2026-07-30T10:30:00Z",
        title: "Blockchain Proof Recorded",
        description: "Maintenance log cryptographic digest committed to block #1,478,902.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-COM-2026-0210",
    name: "BharOS Tactical Encrypted SDR Transceiver",
    serialNumber: "SN-SDR-2026-0210-BEL",
    category: "Communication Equipment",
    status: "Active",
    department: "Tactical Communications / Signals Directorate",
    location: "Western Air Command - Jodhpur",
    lastMaintenanceDate: "2026-08-25",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Bharat Electronics Limited (BEL)",
    model: "SDR-TAC-500 Secure IP-Mesh",
    acquisitionDate: "2025-01-10",
    acquisitionMethod: "Make in India Strategic Defence Electronics Initiative",
    classification: "SECRET",
    custodian: "Maj. Priya Sharma (Signals Division)",
    specsSummary: "Frequency-hopping 30-512 MHz, 256-bit Type-1 crypto hardware security module, MANET IP voice/video data mesh",
    description: "Ruggedized tactical combat net radio with high-grade indigenous encryption, software-defined waveform reconfigurability, and satellite gateway bridging.",
    batchId: "BATCH-BEL-2025-01",
    type: "Communication Equipment",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "Bharat Electronics Limited - Military Communications",
    registeredBy: "Signals Directorate General",
    registeredAt: "2025-01-15T11:00:00Z",
    updatedAt: "2026-08-25T14:40:00Z",
    evidenceCount: 5,
    certId: "CERT-DEF-2026-00402",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x7890123fabc458901237ef123490abcde8912347890123bcdae8901245789012",
      transactionId: "TX-NOV-2026-66401-COM",
      blockNumber: 1488104,
      confirmations: 1640,
      timestamp: "2026-08-25T15:00:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "BEL-Signals-HSM-Attested",
      proofStandard: "Cryptographic Hardware Security FIPS-140-3 Level 4",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00402",
      type: "High-Grade Cryptographic Evaluation & TEMPEST Seal",
      issuingAuthority: "Scientific Analysis Group (SAG) / DRDO",
      issueDate: "2025-02-01",
      expiryDate: "2028-02-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x44fa7812bc8901de33918abce7145009",
    },
    maintenanceHistory: [
      {
        id: "MNT-008",
        date: "2026-08-25",
        type: "Cryptographic Algorithm Suite & Firmware Integrity Audit",
        performedBy: "Signals Field Security Workshop, Jodhpur",
        status: "Completed",
        notes: "Zero firmware tampering detected. Side-channel power analysis showed no leakages. Key vault checksums matched registry.",
      },
    ],
    timeline: [
      {
        id: "TL-16",
        timestamp: "2025-01-10T09:00:00Z",
        title: "Asset Acquired",
        description: "Procured under indigenized software radio replacement program.",
        category: "acquisition",
      },
      {
        id: "TL-17",
        timestamp: "2025-01-15T11:00:00Z",
        title: "Asset Registered",
        description: "Cryptographic root certificates provisioned in hardware security module.",
        category: "registration",
      },
      {
        id: "TL-18",
        timestamp: "2025-02-01T10:00:00Z",
        title: "TEMPEST Certification Issued",
        description: "Awarded TEMPEST Grade A RF emission containment certificate.",
        category: "certification",
      },
      {
        id: "TL-19",
        timestamp: "2026-08-25T15:00:00Z",
        title: "Blockchain Proof Recorded",
        description: "Firmware hash state anchored to Novexa block #1,488,104.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-SUR-2026-0312",
    name: "Revathi 3D Central Acquisition Radar",
    serialNumber: "SN-REV3D-0312-LRDE",
    category: "Surveillance Equipment",
    status: "Under Maintenance",
    department: "Naval Defense Systems / Eastern Fleet",
    location: "Naval Armament Depot - Vizag",
    lastMaintenanceDate: "2026-09-12",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Electronics and Radar Development Establishment (LRDE) / BEL",
    model: "CAR Revathi 3D Naval Phased Array",
    acquisitionDate: "2023-09-18",
    acquisitionMethod: "Naval Capital Indigenization Plan",
    classification: "CONFIDENTIAL",
    custodian: "Lt. Cmdr. Pradeep Varma (Naval Electronics)",
    specsSummary: "S-band multi-beam 3D surveillance radar, 180km detection range, automated target tracking for up to 150 air/surface tracks",
    description: "Shipborne medium-range 3D tactical radar providing air defense coverage, low-altitude sea skimmer missile detection, and gun fire control designation.",
    batchId: "BATCH-LRDE-2023-04",
    type: "Surveillance Equipment",
    lifecycle: "INSPECTION_RECORDED",
    supplier: "Bharat Electronics Limited - Radar Wing",
    registeredBy: "Directorate of Naval Armament Inspection",
    registeredAt: "2023-10-01T10:00:00Z",
    updatedAt: "2026-09-12T14:10:00Z",
    evidenceCount: 4,
    certId: "CERT-DEF-2026-00508",
    maintenanceStatus: "Under Maintenance",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x11894a0098bcdefa12903847aef901237890123490123847aef9012347890123",
      transactionId: "TX-NOV-2026-55201-SUR",
      blockNumber: 1498820,
      confirmations: 310,
      timestamp: "2026-09-12T14:30:00Z",
      network: "Novexa Naval Security Enclave",
      consensusSeal: "Naval-Dockyard-Vizag-Seal",
      proofStandard: "Naval Maritime Ruggedization Standard JSS-55555",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00508",
      type: "Naval Electromagnetic Compatibility & Sea Trials Approval",
      issuingAuthority: "Directorate of Naval Armament Inspection (DNAI)",
      issueDate: "2023-11-01",
      expiryDate: "2026-11-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x889123feac019234891240abc9012345",
    },
    maintenanceHistory: [
      {
        id: "MNT-009",
        date: "2026-09-12",
        type: "Rotary Joint Waveguide Inspection & Phase Shifter Calibration",
        performedBy: "Naval Dockyard Electronics Shop, Vizag",
        status: "In Progress",
        notes: "Currently replacing slip-ring assembly and testing receiver noise floor. Expected completion in 48 hours.",
      },
      {
        id: "MNT-010",
        date: "2026-03-05",
        type: "Clutter Rejection Filter Overhaul",
        performedBy: "BEL Naval Systems Service Team",
        status: "Completed",
        notes: "Doppler filter bank upgraded; sea clutter attenuation improved by 6dB.",
      },
    ],
    timeline: [
      {
        id: "TL-20",
        timestamp: "2023-09-18T10:00:00Z",
        title: "Asset Acquired",
        description: "Delivered for Eastern Fleet Destroyer integration testing.",
        category: "acquisition",
      },
      {
        id: "TL-21",
        timestamp: "2023-10-01T10:00:00Z",
        title: "Asset Registered",
        description: "Enrolled in NOVEXA trust registry with naval hull pairing.",
        category: "registration",
      },
      {
        id: "TL-22",
        timestamp: "2023-11-01T12:00:00Z",
        title: "Certification Issued",
        description: "DNAI Maritime Operability Seal authorized.",
        category: "certification",
      },
      {
        id: "TL-23",
        timestamp: "2026-09-12T14:10:00Z",
        title: "Maintenance Logged",
        description: "Scheduled dry-dock radar maintenance initiated.",
        category: "maintenance",
        status: "In Progress",
      },
      {
        id: "TL-24",
        timestamp: "2026-09-12T14:30:00Z",
        title: "Blockchain Proof Recorded",
        description: "In-maintenance state confirmed and recorded on blockchain block #1,498,820.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-ELC-2026-0421",
    name: "Electronic Fuze Mk-IV Guidance Module",
    serialNumber: "SN-EF4-0421-SYNTH",
    category: "Electronic Equipment",
    status: "Active",
    department: "Ordnance Directorate / Eastern Command",
    location: "Depot 9 - Hyderabad",
    lastMaintenanceDate: "2026-09-10",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "BEL Electronic Warfare & Guidance Division",
    model: "EF-MK4-PRECISION",
    acquisitionDate: "2025-05-20",
    acquisitionMethod: "Direct Ordnance Factory Procurement",
    classification: "RESTRICTED",
    custodian: "Capt. Arvind Nair (Ordnance Corps)",
    specsSummary: "Impact & proximity delay timer, hardened MIL-STD-810G casing, anti-jamming RF, micro-electro-mechanical safing",
    description: "State-of-the-art solid-state electronic fuze unit with precision time-delay triggering for artillery and airborne munitions.",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Equipment",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "BEL Defence Systems",
    registeredBy: "Directorate General of Ordnance Services",
    registeredAt: "2025-05-25T08:00:00Z",
    updatedAt: "2026-09-10T14:05:00Z",
    evidenceCount: 4,
    certId: "CERT-DEF-2026-00612",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x9812409abcef89123478901234fe8901248901237a890123bc45890123789012",
      transactionId: "TX-NOV-2026-44109-ELC",
      blockNumber: 1496200,
      confirmations: 610,
      timestamp: "2026-09-10T14:20:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "OFB-BEL-Joint-Signature",
      proofStandard: "Ordnance Arming MIL-STD-1316F Verification",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00612",
      type: "Precision Munition Electronic Safety & Arming Seal",
      issuingAuthority: "Directorate of Ordnance Safety Inspection",
      issueDate: "2025-06-01",
      expiryDate: "2028-06-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x5590123bc457890123891240abce7890",
    },
    maintenanceHistory: [
      {
        id: "MNT-011",
        date: "2026-09-10",
        type: "Thermal Vacuum Chamber Delay Timer Testing",
        performedBy: "Ordnance Testing Facility, Hyderabad",
        status: "Completed",
        notes: "Tested across -40C to +70C range. Microsecond precision timer verified within ±0.01ms specification.",
      },
    ],
    timeline: [
      {
        id: "TL-25",
        timestamp: "2025-05-20T08:00:00Z",
        title: "Asset Acquired",
        description: "Lot delivered to Depot 9 Hyderabad.",
        category: "acquisition",
      },
      {
        id: "TL-26",
        timestamp: "2025-05-25T08:00:00Z",
        title: "Asset Registered",
        description: "Identity and batch serial indexed in NOVEXA trust network.",
        category: "registration",
      },
      {
        id: "TL-27",
        timestamp: "2025-06-01T10:00:00Z",
        title: "Certification Issued",
        description: "Ordnance Safety Seal validated.",
        category: "certification",
      },
      {
        id: "TL-28",
        timestamp: "2026-09-10T14:20:00Z",
        title: "Blockchain Proof Recorded",
        description: "Lot inspection pass cryptographic proof verified.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-INF-2026-0504",
    name: "Tactical FOB Hybrid Microgrid & Power Node",
    serialNumber: "SN-FOB-PWR-0504-BHEL",
    category: "Infrastructure",
    status: "Active",
    department: "Corps of Engineers / Northern Command",
    location: "Testing Range - Pokhran",
    lastMaintenanceDate: "2026-08-19",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Bharat Heavy Electricals Limited (BHEL) / DRDO",
    model: "FOB-GRID-500KVA Ruggedized",
    acquisitionDate: "2024-09-10",
    acquisitionMethod: "Border Infrastructure Modernization Program",
    classification: "RESTRICTED",
    custodian: "Maj. S. K. Rathore (Combat Engineers)",
    specsSummary: "500kVA multi-source containerized power system, solar-diesel hybrid, lithium iron phosphate battery storage, EMP shielded",
    description: "Self-deployable tactical microgrid providing uninterruptible mission-critical power to forward operating bases, radar posts, and surgical communication hubs.",
    batchId: "BATCH-INF-2024-09",
    type: "Infrastructure",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "BHEL Industrial Systems Group",
    registeredBy: "Engineer-in-Chief's Branch",
    registeredAt: "2024-09-15T12:00:00Z",
    updatedAt: "2026-08-19T11:00:00Z",
    evidenceCount: 3,
    certId: "CERT-DEF-2026-00719",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x2234567890123456789012345678901234567890123456789012345678901234",
      transactionId: "TX-NOV-2026-33901-INF",
      blockNumber: 1485901,
      confirmations: 1950,
      timestamp: "2026-08-19T11:30:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "Military-Engineer-Services-Consensus",
      proofStandard: "EMP Hardening MIL-STD-188-125-1 Protocol",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00719",
      type: "High-Altitude & EMP Hardened Infrastructure Certificate",
      issuingAuthority: "Military Engineer Services (MES) Quality Wing",
      issueDate: "2024-10-01",
      expiryDate: "2029-10-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x11029384756473829102938475647382",
    },
    maintenanceHistory: [
      {
        id: "MNT-012",
        date: "2026-08-19",
        type: "Inverter Harmonic Distortion & Battery Bank Capacity Test",
        performedBy: "Field Engineering Workshop, Northern Command",
        status: "Completed",
        notes: "LiFePO4 battery modules retained 98.4% nominal capacity after 1,200 discharge cycles. Microgrid automatic transfer switch operated under 8ms.",
      },
    ],
    timeline: [
      {
        id: "TL-29",
        timestamp: "2024-09-10T10:00:00Z",
        title: "Asset Acquired",
        description: "Delivered to High Altitude Field Testing Post.",
        category: "acquisition",
      },
      {
        id: "TL-30",
        timestamp: "2024-09-15T12:00:00Z",
        title: "Asset Registered",
        description: "Registered as critical base infrastructure asset.",
        category: "registration",
      },
      {
        id: "TL-31",
        timestamp: "2024-10-01T10:00:00Z",
        title: "Certification Issued",
        description: "MES Quality Wing issued 5-year operational license.",
        category: "certification",
      },
      {
        id: "TL-32",
        timestamp: "2026-08-19T11:30:00Z",
        title: "Blockchain Proof Recorded",
        description: "Power reliability and battery health state anchored.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-AIR-2026-0620",
    name: "MQ-9B SeaGuardian RPAS Aircraft",
    serialNumber: "SN-MQ9B-0620-IN",
    category: "Aircraft",
    status: "Under Maintenance",
    department: "Naval Aviation / Naval Air Squadron 312",
    location: "Naval Armament Depot - Vizag",
    lastMaintenanceDate: "2026-09-15",
    verificationStatus: "Pending Verification",
    proofStatus: "Pending",
    manufacturer: "General Atomics / HAL Maintenance Facility",
    model: "MQ-9B High Altitude Long Endurance Maritime",
    acquisitionDate: "2025-08-01",
    acquisitionMethod: "Intergovernmental Foreign Military Sales (FMS) Scheme",
    classification: "TOP SECRET / DEFENCE",
    custodian: "Cmdr. K. Chawla (Naval Air Arm)",
    specsSummary: "40-hour endurance, 40,000 ft operational ceiling, 360-degree maritime surface search radar, SATCOM sensor suite",
    description: "High-altitude long-endurance unmanned aircraft system specialized in broad-area maritime surveillance, anti-submarine warfare cueing, and search-and-rescue.",
    batchId: "BATCH-UAS-2025-02",
    type: "Aircraft",
    lifecycle: "INSPECTION_RECORDED",
    supplier: "General Atomics Aeronautical Systems",
    registeredBy: "Directorate of Naval Aviation",
    registeredAt: "2025-08-05T09:00:00Z",
    updatedAt: "2026-09-15T16:00:00Z",
    evidenceCount: 2,
    certId: undefined,
    maintenanceStatus: "Under Maintenance",
    blockchainProof: {
      verificationStatus: "Verification in Progress",
      assetHash: "0x778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
      transactionId: "TX-NOV-2026-PENDING-AIR",
      blockNumber: 0,
      confirmations: 0,
      timestamp: "2026-09-15T16:00:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "Awaiting-Tripartite-Naval-Signoff",
      proofStandard: "MIL-STD-1760 Aircraft Interoperability",
    },
    certification: null,
    maintenanceHistory: [
      {
        id: "MNT-013",
        date: "2026-09-15",
        type: "Electro-Optical Turret & Synthetic Aperture Radar Recalibration",
        performedBy: "Naval RPAS Service Center, Vizag",
        status: "In Progress",
        notes: "Replacing optical focal plane array sensor module following saline atmosphere salt-spray exposure.",
      },
    ],
    timeline: [
      {
        id: "TL-33",
        timestamp: "2025-08-01T09:00:00Z",
        title: "Asset Acquired",
        description: "Received at Naval Air Station INS Rajali.",
        category: "acquisition",
      },
      {
        id: "TL-34",
        timestamp: "2025-08-05T09:00:00Z",
        title: "Asset Registered",
        description: "Registered into NOVEXA Trust framework.",
        category: "registration",
      },
      {
        id: "TL-35",
        timestamp: "2026-09-15T16:00:00Z",
        title: "Maintenance Initiated",
        description: "Entered depot maintenance cycle for optical sensor replacement.",
        category: "maintenance",
        status: "In Progress",
      },
    ],
  },
  {
    id: "DEF-VEH-2026-0715",
    name: "K9 Vajra-T 155mm Self-Propelled Howitzer",
    serialNumber: "SN-K9V-0715-LT",
    category: "Vehicle",
    status: "Active",
    department: "Artillery Directorate / Western Command",
    location: "Testing Range - Pokhran",
    lastMaintenanceDate: "2026-08-10",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Larsen & Toubro (L&T) Heavy Engineering",
    model: "K9 Vajra-T 155mm/52 Calibre Tracked",
    acquisitionDate: "2024-02-14",
    acquisitionMethod: "Make in India Strategic Artillery Partnership",
    classification: "CONFIDENTIAL",
    custodian: "Lt. Col. Vikram Rao (Artillery Regt)",
    specsSummary: "155mm 52-cal gun, 38km maximum strike range, automated ammunition loading system, 3 rounds in 15 seconds burst rate",
    description: "Tracked self-propelled howitzer designed for desert and arid terrain operations with automated fire-control system and digital ballistic computer.",
    batchId: "BATCH-ART-2024-05",
    type: "Vehicle",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    supplier: "Larsen & Toubro Defence Systems",
    registeredBy: "Directorate General of Artillery",
    registeredAt: "2024-02-20T10:00:00Z",
    updatedAt: "2026-08-10T13:40:00Z",
    evidenceCount: 5,
    certId: "CERT-DEF-2026-00812",
    maintenanceStatus: "Operational",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger",
      assetHash: "0x4455667788990011223344556677889900112233445566778899001122334455",
      transactionId: "TX-NOV-2026-22105-VEH",
      blockNumber: 1482110,
      confirmations: 2310,
      timestamp: "2026-08-10T14:00:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "DGQA-L&T-Verified-Ledger",
      proofStandard: "Ballistic Ordnance Standard STANAG 4351",
    },
    certification: {
      certificateId: "CERT-DEF-2026-00812",
      type: "Artillery System Firing Acceptance & Accuracy Clearance",
      issuingAuthority: "Directorate General of Quality Assurance (DGQA)",
      issueDate: "2024-03-01",
      expiryDate: "2028-03-01",
      status: "Valid",
      verificationStatus: "Verified",
      digitalSignature: "0x99001122334455667788990011223344",
    },
    maintenanceHistory: [
      {
        id: "MNT-014",
        date: "2026-08-10",
        type: "Gun Barrel Erosion Profiling & Recoil Brake Fluid Renewal",
        performedBy: "Pokhran Field Artillery Workshop",
        status: "Completed",
        notes: "Muzzle velocity indicator calibrated against radar telemetry; bore wear index measured at 18% of lifecycle limit.",
      },
    ],
    timeline: [
      {
        id: "TL-36",
        timestamp: "2024-02-14T09:00:00Z",
        title: "Asset Acquired",
        description: "Formally handed over at L&T Armoured Systems Complex, Hazira.",
        category: "acquisition",
      },
      {
        id: "TL-37",
        timestamp: "2024-02-20T10:00:00Z",
        title: "Asset Registered",
        description: "Enrolled in trust network with full gun barrel telemetry.",
        category: "registration",
      },
      {
        id: "TL-38",
        timestamp: "2024-03-01T11:00:00Z",
        title: "Certification Issued",
        description: "DGQA issued official tactical firing clearance.",
        category: "certification",
      },
      {
        id: "TL-39",
        timestamp: "2026-08-10T14:00:00Z",
        title: "Blockchain Proof Recorded",
        description: "Artillery calibration audit committed to block #1,482,110.",
        category: "blockchain",
      },
    ],
  },
  {
    id: "DEF-WPN-2026-0830",
    name: "Pinaka Multi-Barrel Rocket Launcher Mk-II",
    serialNumber: "SN-PIN2-0830-BEML",
    category: "Weapon System",
    status: "Inactive",
    department: "Artillery Directorate / Eastern Command",
    location: "Ordnance Depot - Kanpur",
    lastMaintenanceDate: "2026-05-18",
    verificationStatus: "Verification Required",
    proofStatus: "Verification Required",
    manufacturer: "Tata Power SED / BEML / Armament Research (ARDE)",
    model: "Pinaka MBRL Mk-II Guided Extended Range",
    acquisitionDate: "2023-11-05",
    acquisitionMethod: "Indigenous Defence Corridor Capital Program",
    classification: "CONFIDENTIAL",
    custodian: "Capt. Devendra Rathore (Kanpur Depot)",
    specsSummary: "12-tube 214mm launcher, 75km range with aerodynamic trajectory correction, salvos fired in 44 seconds",
    description: "Heavy rocket artillery system mounted on Tatra 8x8 chassis, currently in scheduled reserve status awaiting battery key rotation.",
    batchId: "BATCH-MBRL-2023-02",
    type: "Weapon System",
    lifecycle: "REJECTED_QUARANTINED",
    supplier: "BEML / Tata Power SED",
    registeredBy: "Directorate General of Ordnance Services",
    registeredAt: "2023-11-10T10:00:00Z",
    updatedAt: "2026-05-18T12:00:00Z",
    evidenceCount: 2,
    certId: undefined,
    maintenanceStatus: "Quarantined",
    blockchainProof: {
      verificationStatus: "Audit Required Before Ledger Sealing",
      assetHash: "0x00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      transactionId: "TX-NOV-REV-REQUIRED",
      blockNumber: 0,
      confirmations: 0,
      timestamp: "2026-05-18T12:00:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "Pending-Cryptographic-Recertification",
      proofStandard: "Rocket Artillery Safety Standard MIL-STD-1901A",
    },
    certification: null,
    maintenanceHistory: [
      {
        id: "MNT-015",
        date: "2026-05-18",
        type: "Scheduled Preservation & Desiccant Check",
        performedBy: "Kanpur Ordnance Workshop",
        status: "Completed",
        notes: "Placed in strategic depot storage. Rocket canister seals inspected; electrical launch contacts greased.",
      },
    ],
    timeline: [
      {
        id: "TL-40",
        timestamp: "2023-11-05T10:00:00Z",
        title: "Asset Acquired",
        description: "Received from BEML Bangalore.",
        category: "acquisition",
      },
      {
        id: "TL-41",
        timestamp: "2023-11-10T10:00:00Z",
        title: "Asset Registered",
        description: "Registered in system inventory.",
        category: "registration",
      },
      {
        id: "TL-42",
        timestamp: "2026-05-18T12:00:00Z",
        title: "Transferred to Strategic Reserve",
        description: "Status changed to Inactive; requires cryptographic recertification before field redeployment.",
        category: "assignment",
      },
    ],
  },
  {
    id: "DEF-SUR-2026-0945",
    name: "EO/IR Airborne Target Designation Pod",
    serialNumber: "SN-EOIR-0945-BEL",
    category: "Surveillance Equipment",
    status: "Active",
    department: "Sensors & Avionics / Central Command",
    location: "Western Air Command - Jodhpur",
    lastMaintenanceDate: "2026-06-22",
    verificationStatus: "Verification Required",
    proofStatus: "Verification Required",
    manufacturer: "BEL Optronics / Instruments Research (IRDE)",
    model: "LITENING-IND Precision Targeting Pod",
    acquisitionDate: "2024-05-12",
    acquisitionMethod: "Licensed Indigenous Production",
    classification: "CONFIDENTIAL",
    custodian: "Squadron Ldr. Anjali Roy (Targeting Systems)",
    specsSummary: "Dual-wave FLIR sensor, CCD daytime camera, laser designator/ranger, automated video tracker, INS integration",
    description: "Multisensor airborne targeting pod mounted on combat aircraft for precision-guided munition delivery and real-time battle damage assessment.",
    batchId: "BATCH-OPT-2024-04",
    type: "Surveillance Equipment",
    lifecycle: "INSPECTION_RECORDED",
    supplier: "BEL Optronics Division",
    registeredBy: "Air Force Technical Directorate",
    registeredAt: "2024-05-18T11:00:00Z",
    updatedAt: "2026-06-22T15:30:00Z",
    evidenceCount: 3,
    certId: undefined,
    maintenanceStatus: "Routine Calibration",
    blockchainProof: {
      verificationStatus: "Verification Required",
      assetHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      transactionId: "TX-NOV-PENDING-AUDIT",
      blockNumber: 0,
      confirmations: 0,
      timestamp: "2026-06-22T15:30:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "DGAQA-Audit-Required",
      proofStandard: "Electro-Optical Airworthiness JSS-55555",
    },
    certification: null,
    maintenanceHistory: [
      {
        id: "MNT-016",
        date: "2026-06-22",
        type: "Laser Boresight & Cryogenic Detector Servicing",
        performedBy: "Jodhpur Avionics Maintenance Section",
        status: "Completed",
        notes: "Laser output energy measured at 98mJ. Optical collimation verified on test bench.",
      },
    ],
    timeline: [
      {
        id: "TL-43",
        timestamp: "2024-05-12T09:00:00Z",
        title: "Asset Acquired",
        description: "Delivered from BEL Optronics.",
        category: "acquisition",
      },
      {
        id: "TL-44",
        timestamp: "2024-05-18T11:00:00Z",
        title: "Asset Registered",
        description: "Registered in target designation registry.",
        category: "registration",
      },
      {
        id: "TL-45",
        timestamp: "2026-06-22T15:30:00Z",
        title: "Maintenance Completed",
        description: "Laser boresight servicing completed.",
        category: "maintenance",
      },
    ],
  },
  {
    id: "DEF-ELC-2026-1052",
    name: "Digital Flight Control Computer DFCC-20",
    serialNumber: "SN-DFCC-1052-ADE",
    category: "Electronic Equipment",
    status: "Decommissioned",
    department: "Aeronautical Development / Air Command",
    location: "Base Depot 4 - Bangalore",
    lastMaintenanceDate: "2026-01-10",
    verificationStatus: "Verified",
    proofStatus: "Anchored",
    manufacturer: "Aeronautical Development Establishment (ADE) / DRDO",
    model: "DFCC Mark-I Quad-Processor Architecture",
    acquisitionDate: "2020-04-10",
    acquisitionMethod: "Prototype Flight Test Evaluation Batch",
    classification: "RESTRICTED",
    custodian: "Dr. K. Swaminathan (Avionics Lab)",
    specsSummary: "Quadruple redundant 32-bit fail-op/fail-safe processor, Ada compiler validated, radiation-hardened memory",
    description: "Early-generation fly-by-wire flight control computer retired after completing 5,000 simulated flight hours during supersonic aerodynamic characterization tests.",
    batchId: "BATCH-DFCC-2020-01",
    type: "Electronic Equipment",
    lifecycle: "RETIRED",
    supplier: "Aeronautical Development Establishment",
    registeredBy: "Aeronautical Quality Assurance",
    registeredAt: "2020-04-15T10:00:00Z",
    updatedAt: "2026-01-10T11:00:00Z",
    evidenceCount: 4,
    certId: "CERT-DEF-2020-00012",
    maintenanceStatus: "Decommissioned",
    blockchainProof: {
      verificationStatus: "Anchored on Novexa Defence Ledger (Archived)",
      assetHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      transactionId: "TX-NOV-2026-00012-DECOM",
      blockNumber: 1390102,
      confirmations: 12400,
      timestamp: "2026-01-10T11:30:00Z",
      network: "Novexa Private Permissioned Subnet",
      consensusSeal: "CEMILAC-Retirement-Seal",
      proofStandard: "DO-178B Level A Decommissioning Protocol",
    },
    certification: {
      certificateId: "CERT-DEF-2020-00012",
      type: "Decommissioning & Safe Cryptographic Wipe Certification",
      issuingAuthority: "Center for Military Airworthiness and Certification (CEMILAC)",
      issueDate: "2020-05-01",
      expiryDate: "2025-05-01",
      status: "Expired",
      verificationStatus: "Verified",
      digitalSignature: "0xabcdefabcdefabcdefabcdefabcdefab",
    },
    maintenanceHistory: [
      {
        id: "MNT-017",
        date: "2026-01-10",
        type: "Cryptographic Key Zeroization & Decommissioning Disposal Check",
        performedBy: "ADE Avionics Decommissioning Committee",
        status: "Completed",
        notes: "Cryptographic memory vaults successfully sanitized in accordance with military security guidelines. Unit archived.",
      },
    ],
    timeline: [
      {
        id: "TL-46",
        timestamp: "2020-04-10T09:00:00Z",
        title: "Asset Acquired",
        description: "Inducted for avionics test bench trials.",
        category: "acquisition",
      },
      {
        id: "TL-47",
        timestamp: "2020-04-15T10:00:00Z",
        title: "Asset Registered",
        description: "Registered into evaluation inventory.",
        category: "registration",
      },
      {
        id: "TL-48",
        timestamp: "2026-01-10T11:00:00Z",
        title: "Asset Formally Decommissioned",
        description: "Completed operational testing lifecycle; cryptographic keys wiped.",
        category: "maintenance",
        status: "Completed",
      },
      {
        id: "TL-49",
        timestamp: "2026-01-10T11:30:00Z",
        title: "Blockchain Decommissioning Anchored",
        description: "Final retired state committed to block #1,390,102.",
        category: "blockchain",
      },
    ],
  },
];

export interface DefenceAssetFilters {
  search?: string;
  category?: string;
  status?: string;
  verification?: string;
}

export function getDefenceAssets(filters: DefenceAssetFilters = {}): DefenceAsset[] {
  let list = [...INITIAL_DEFENCE_ASSETS];

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.model.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  if (filters.category && filters.category !== "ALL") {
    list = list.filter((a) => a.category === filters.category);
  }

  if (filters.status && filters.status !== "ALL") {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters.verification && filters.verification !== "ALL") {
    list = list.filter((a) => a.verificationStatus === filters.verification);
  }

  return list;
}

export function getDefenceAssetById(id: string): DefenceAsset | undefined {
  if (!id) return undefined;
  const direct = INITIAL_DEFENCE_ASSETS.find((a) => a.id.toLowerCase() === id.toLowerCase());
  if (direct) return direct;

  // Fallback match by partial ID or serial
  return INITIAL_DEFENCE_ASSETS.find(
    (a) => a.serialNumber.toLowerCase() === id.toLowerCase() || a.id.endsWith(id)
  );
}

export function getDefenceAssetStats() {
  const total = INITIAL_DEFENCE_ASSETS.length;
  const active = INITIAL_DEFENCE_ASSETS.filter((a) => a.status === "Active").length;
  const underMaintenance = INITIAL_DEFENCE_ASSETS.filter((a) => a.status === "Under Maintenance").length;
  const verified = INITIAL_DEFENCE_ASSETS.filter((a) => a.verificationStatus === "Verified").length;
  const anchored = INITIAL_DEFENCE_ASSETS.filter((a) => a.proofStatus === "Anchored").length;

  return {
    total,
    active,
    underMaintenance,
    verified,
    anchored,
  };
}
