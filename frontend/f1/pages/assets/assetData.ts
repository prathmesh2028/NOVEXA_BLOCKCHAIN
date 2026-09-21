import { Asset, ASSETS, LifecycleState, VerificationStatus, EvidenceStatus, CertStatus } from "../../data/mockData";
import { AssetResponse } from "../../services/assets";

export type MaintenanceStatus = 
  | "Operational" 
  | "Under Maintenance" 
  | "Quarantined" 
  | "Pre-Commissioning" 
  | "Routine Calibration" 
  | "Decommissioned";

export type SecurityClassification = 
  | "RESTRICTED" 
  | "CONFIDENTIAL" 
  | "SECRET" 
  | "TOP SECRET / DEFENCE";

export interface DefenceAsset extends Asset {
  name: string;
  department: string;
  location: string;
  maintenanceStatus: MaintenanceStatus;
  classification: SecurityClassification;
  weightKg?: number;
  specsSummary?: string;
  custodian?: string;
}

export const DEFENCE_LOCATIONS = [
  "Base Depot 4 - Bangalore",
  "Base Arsenal - Pune",
  "Naval Armament Depot - Vizag",
  "Ordnance Depot - Kanpur",
  "Air Force Station - Chandigarh",
  "Testing Range - Pokhran",
  "Depot 9 - Hyderabad",
  "Western Air Command - Jodhpur",
] as const;

export const DEFENCE_DEPARTMENTS = [
  "Ordnance & Armament",
  "Sensors & Avionics",
  "Missile Guidance",
  "Tactical Communications",
  "Propulsion Directorate",
  "Naval Defense Systems",
] as const;

export const DEFENCE_ASSET_TYPES = [
  "Electronic Fuze",
  "Pressure Transducer",
  "Ignition Module",
  "Actuator System",
  "Navigation Unit",
  "Tactical Communications",
  "Optical Sensor",
  "Radar System",
] as const;

export const DEFENCE_STATUSES = [
  { key: "ALL", label: "All Statuses" },
  { key: "ACTIVE", label: "Active / Operational" },
  { key: "MAINTENANCE", label: "Under Maintenance" },
  { key: "ACCEPTED_FOR_ASSEMBLY", label: "Accepted for Assembly" },
  { key: "INSPECTION_RECORDED", label: "In Inspection" },
  { key: "RECEIVED", label: "Received" },
  { key: "SUPPLIER_DECLARED", label: "Supplier Declared" },
  { key: "REJECTED_QUARANTINED", label: "Quarantined / Defective" },
  { key: "RETIRED", label: "Retired / Decommissioned" },
] as const;

export const INITIAL_DEFENCE_ASSETS: DefenceAsset[] = [
  {
    id: "EF-2026-00421",
    name: "Electronic Fuze Mk-IV Synth",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00421",
    department: "Ordnance & Armament",
    location: "Base Depot 4 - Bangalore",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    verification: "VERIFIED",
    maintenanceStatus: "Operational",
    classification: "RESTRICTED",
    evidenceCount: 4,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00089",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    custodian: "Capt. Arvind Nair (Ordnance Corps)",
    registeredAt: "2026-08-15T09:22:00Z",
    updatedAt: "2026-09-10T14:05:00Z",
    specsSummary: "Impact & proximity delay timer, hardened MIL-STD-810G casing, anti-jamming RF",
    description: "Synthetic Electronic Fuze unit, batch demonstrating full lifecycle from declaration to assembly acceptance. Non-classified demonstration record.",
  },
  {
    id: "EF-2026-00422",
    name: "Electronic Fuze Mk-IV Synth",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00422",
    department: "Ordnance & Armament",
    location: "Testing Range - Pokhran",
    lifecycle: "INSPECTION_RECORDED",
    verification: "REVIEW_REQUIRED",
    maintenanceStatus: "Under Maintenance",
    classification: "CONFIDENTIAL",
    evidenceCount: 2,
    evidenceStatus: "Processing",
    certStatus: "PENDING",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    custodian: "Maj. S. Venkat (Ballistics Lab)",
    registeredAt: "2026-08-15T09:25:00Z",
    updatedAt: "2026-09-11T08:30:00Z",
    specsSummary: "Shock-resistant telemetry testbed, high-g acceleration sensing sensor array",
    description: "Synthetic Electronic Fuze unit — inspection recorded, pending evidence review.",
  },
  {
    id: "EF-2026-00423",
    name: "Electronic Fuze Mk-IV Synth",
    batchId: "EF-BATCH-2026-017",
    type: "Electronic Fuze",
    model: "EF-MK4-SYNTH",
    serialNumber: "SN-EF-00423",
    department: "Ordnance & Armament",
    location: "Base Arsenal - Pune",
    lifecycle: "REJECTED_QUARANTINED",
    verification: "FAILED",
    maintenanceStatus: "Quarantined",
    classification: "SECRET",
    evidenceCount: 3,
    evidenceStatus: "Failed",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Procurement Div.",
    registeredBy: "Rajesh Kumar",
    custodian: "Lt. Col. Vikram Rao (QA Command)",
    registeredAt: "2026-08-15T09:28:00Z",
    updatedAt: "2026-09-09T11:00:00Z",
    specsSummary: "Quarantined due to cryptographic checksum mismatch on calibration firmwire",
    description: "Synthetic unit — rejected during inspection. Evidence fingerprint mismatch detected.",
  },
  {
    id: "PT-2026-00105",
    name: "Piezoelectric Pressure Transducer PT-80",
    batchId: "PT-BATCH-2026-004",
    type: "Pressure Transducer",
    model: "PT-SEN-SYNTH",
    serialNumber: "SN-PT-00105",
    department: "Sensors & Avionics",
    location: "Depot 9 - Hyderabad",
    lifecycle: "RECEIVED",
    verification: "PENDING",
    maintenanceStatus: "Pre-Commissioning",
    classification: "CONFIDENTIAL",
    evidenceCount: 1,
    evidenceStatus: "Uploading",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Sensors Div.",
    registeredBy: "Rajesh Kumar",
    custodian: "Sub. Manoj Patil (Avionics Storage)",
    registeredAt: "2026-09-01T10:00:00Z",
    updatedAt: "2026-09-12T07:45:00Z",
    specsSummary: "Dynamic range 0-500 bar, high thermal stability (-50C to +150C), CAN-bus output",
    description: "Synthetic pressure transducer — received, evidence upload in progress.",
  },
  {
    id: "IG-2026-00210",
    name: "High-Energy Solid Propellant Igniter",
    batchId: "IG-BATCH-2026-008",
    type: "Ignition Module",
    model: "IG-MOD-SYNTH",
    serialNumber: "SN-IG-00210",
    department: "Propulsion Directorate",
    location: "Ordnance Depot - Kanpur",
    lifecycle: "SUPPLIER_DECLARED",
    verification: "PENDING",
    maintenanceStatus: "Pre-Commissioning",
    classification: "SECRET",
    evidenceCount: 0,
    evidenceStatus: "Processing",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Synthetic Ignition Div.",
    registeredBy: "Rajesh Kumar",
    custodian: "Cmdr. K. Chawla (Ammunition Branch)",
    registeredAt: "2026-09-10T14:30:00Z",
    updatedAt: "2026-09-10T14:30:00Z",
    specsSummary: "Dual-bridgewire pyrotechnic initiator, hermetic ceramic seal, 1A/1W no-fire",
    description: "Synthetic ignition module — supplier declared, awaiting receipt and inspection.",
  },
  {
    id: "ACT-2026-00088",
    name: "Electromechanical Fin Actuator EM-400",
    batchId: "ACT-BATCH-2026-002",
    type: "Actuator System",
    model: "EM-ACT-400X",
    serialNumber: "SN-ACT-00088",
    department: "Missile Guidance",
    location: "Base Arsenal - Pune",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    verification: "VERIFIED",
    maintenanceStatus: "Operational",
    classification: "RESTRICTED",
    evidenceCount: 5,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00092",
    supplier: "HAL Dynamics Systems Division",
    registeredBy: "Sunita Menon",
    custodian: "Wing Cmdr. R. Deshmukh",
    registeredAt: "2026-08-20T11:00:00Z",
    updatedAt: "2026-09-14T16:20:00Z",
    specsSummary: "Brushless DC high-torque motor, 45 Nm stall torque, 120 deg/s slew rate",
    description: "High-precision aerodynamic fin control actuator for tactical missile systems with redundant resolvers.",
  },
  {
    id: "NV-2026-00312",
    name: "Ring Laser Gyro Navigation Unit RLG-9",
    batchId: "NV-BATCH-2026-011",
    type: "Navigation Unit",
    model: "RLG-NAV-09B",
    serialNumber: "SN-RLG-00312",
    department: "Sensors & Avionics",
    location: "Air Force Station - Chandigarh",
    lifecycle: "INSPECTION_RECORDED",
    verification: "VERIFIED",
    maintenanceStatus: "Under Maintenance",
    classification: "TOP SECRET / DEFENCE",
    evidenceCount: 3,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00095",
    supplier: "DRDO / RCI Inertial Systems",
    registeredBy: "Dr. K. Swaminathan",
    custodian: "Squadron Ldr. Anjali Roy",
    registeredAt: "2026-08-25T08:15:00Z",
    updatedAt: "2026-09-15T11:15:00Z",
    specsSummary: "Triaxial optical ring laser gyro, bias drift <0.005 deg/hr, GPS/NavIC integrated",
    description: "Inertial navigation unit under routine 6-month sensor drift recalibration and optical cavity cleaning.",
  },
  {
    id: "COM-2026-00504",
    name: "Tactical Encrypted SDR Transceiver",
    batchId: "COM-BATCH-2026-005",
    type: "Tactical Communications",
    model: "SDR-TAC-500",
    serialNumber: "SN-SDR-00504",
    department: "Tactical Communications",
    location: "Naval Armament Depot - Vizag",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    verification: "VERIFIED",
    maintenanceStatus: "Operational",
    classification: "SECRET",
    evidenceCount: 4,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00099",
    supplier: "ECIL Secure Defence Systems",
    registeredBy: "Rajesh Kumar",
    custodian: "Lt. Cmdr. Pradeep Varma",
    registeredAt: "2026-08-30T10:20:00Z",
    updatedAt: "2026-09-16T09:40:00Z",
    specsSummary: "Frequency-hopping 30-512 MHz, 256-bit Type-1 crypto hardware security module",
    description: "Ruggedized tactical IP-mesh software defined radio, ship-to-air authenticated link protocol.",
  },
  {
    id: "OPT-2026-00177",
    name: "Multispectral Targeting FLIR Sensor",
    batchId: "OPT-BATCH-2026-003",
    type: "Optical Sensor",
    model: "FLIR-EOTS-17",
    serialNumber: "SN-FLIR-00177",
    department: "Sensors & Avionics",
    location: "Western Air Command - Jodhpur",
    lifecycle: "REJECTED_QUARANTINED",
    verification: "REVIEW_REQUIRED",
    maintenanceStatus: "Decommissioned",
    classification: "CONFIDENTIAL",
    evidenceCount: 2,
    evidenceStatus: "Failed",
    certStatus: "NOT_CERTIFIED",
    supplier: "BEL Optronics Division",
    registeredBy: "Sunita Menon",
    custodian: "Capt. Devendra Rathore",
    registeredAt: "2026-07-14T09:00:00Z",
    updatedAt: "2026-08-28T13:10:00Z",
    specsSummary: "Mid-wave infrared 640x512 detector, dual-FOV cooled optics, laser designator receiver",
    description: "Unit retired from field evaluation following sensor focal plane array degradation during dust-chamber trials.",
  },
  {
    id: "RAD-2026-00620",
    name: "X-Band Active AESA Radar Subsystem",
    batchId: "RAD-BATCH-2026-009",
    type: "Radar System",
    model: "AESA-TRX-800",
    serialNumber: "SN-AESA-00620",
    department: "Naval Defense Systems",
    location: "Naval Armament Depot - Vizag",
    lifecycle: "ACCEPTED_FOR_ASSEMBLY",
    verification: "VERIFIED",
    maintenanceStatus: "Operational",
    classification: "RESTRICTED",
    evidenceCount: 6,
    evidenceStatus: "Complete",
    certStatus: "CONFIRMED",
    certId: "CERT-2026-00104",
    supplier: "LRDE / BEL Naval Radar Wing",
    registeredBy: "Rajesh Kumar",
    custodian: "Cmdr. T. S. Murthy (Weapon Directorate)",
    registeredAt: "2026-09-02T13:40:00Z",
    updatedAt: "2026-09-17T18:05:00Z",
    specsSummary: "GaN Transmit/Receive Multi-Module Array, electronic beam steering, low-RCS tracking",
    description: "Active electronically steered naval air-defence tracking radar subsystem ready for frigate integration.",
  },
];

/**
 * Merges backend API responses with our rich defence metadata schema.
 */
export function enrichAsset(raw: AssetResponse | Asset): DefenceAsset {
  const existing = INITIAL_DEFENCE_ASSETS.find(
    (a) => a.id === ('asset_id' in raw ? raw.asset_id : raw.id)
  );
  if (existing) {
    return {
      ...existing,
      lifecycle: ('lifecycle_state' in raw ? raw.lifecycle_state : raw.lifecycle) || existing.lifecycle,
      verification: ('verification_status' in raw ? raw.verification_status : raw.verification) || existing.verification,
      updatedAt: ('updated_at' in raw ? raw.updated_at : raw.updatedAt) || existing.updatedAt,
    };
  }

  const id = 'asset_id' in raw ? raw.asset_id : raw.id;
  const batchId = 'batch_id' in raw ? raw.batch_id : raw.batchId;
  const type = raw.type || "Defence Component";
  const model = raw.model || "MIL-STD-DEF";
  const serial = ('serial_number' in raw ? raw.serial_number : raw.serialNumber) || `SN-${id}`;
  const lifecycle = ('lifecycle_state' in raw ? raw.lifecycle_state : raw.lifecycle) || "UNREGISTERED";
  const verification = ('verification_status' in raw ? raw.verification_status : raw.verification) || "PENDING";
  const updatedAt = ('updated_at' in raw ? raw.updated_at : raw.updatedAt) || new Date().toISOString();

  // Derive department and location deterministically
  const deptIdx = Math.abs(id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DEFENCE_DEPARTMENTS.length;
  const locIdx = Math.abs(batchId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DEFENCE_LOCATIONS.length;

  return {
    id,
    name: `${type} (${model})`,
    batchId,
    type,
    model,
    serialNumber: serial,
    department: DEFENCE_DEPARTMENTS[deptIdx],
    location: DEFENCE_LOCATIONS[locIdx],
    lifecycle: lifecycle as LifecycleState,
    verification: verification as VerificationStatus,
    maintenanceStatus: lifecycle === "ACCEPTED_FOR_ASSEMBLY" ? "Operational" : lifecycle === "REJECTED_QUARANTINED" ? "Quarantined" : "Under Maintenance",
    classification: "CONFIDENTIAL",
    evidenceCount: ('evidence_count' in raw ? raw.evidence_count : raw.evidenceCount) || 1,
    evidenceStatus: ('evidence_status' in raw ? raw.evidence_status : raw.evidenceStatus) || "Complete",
    certStatus: (('cert_status' in raw ? raw.cert_status : raw.certStatus) as CertStatus) || "NOT_CERTIFIED",
    certId: ('cert_id' in raw ? raw.cert_id : raw.certId) || undefined,
    supplier: raw.supplier || "BEL Defence Systems",
    registeredBy: ('registered_by_name' in raw ? raw.registered_by_name : ('registeredBy' in raw ? raw.registeredBy : null)) || "Command Operator",
    registeredAt: ('created_at' in raw ? raw.created_at : ('registeredAt' in raw ? raw.registeredAt : updatedAt)),
    updatedAt,
    description: ('description' in raw ? raw.description : "") || `Defence asset record for ${id}.`,
  };
}
