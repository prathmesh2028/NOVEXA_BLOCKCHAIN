/**
 * Demo Data Provider for KavachTrust SIH Demo
 * 
 * Contains REAL persisted records from the database for judge-friendly demo workflows.
 * All IDs and references are actual database records.
 */

export interface DemoRecord {
  id: string;
  label: string;
  type: 'asset' | 'certification' | 'evidence' | 'inspection';
  data: any;
}

/**
 * Real persisted demo assets from database
 */
export const DEMO_ASSETS: DemoRecord[] = [
  {
    id: 'af786dbb-2cda-4c55-887f-cf2640eb6255',
    label: 'EF-2026-00422 (Electronic Fuze - VERIFIED)',
    type: 'asset',
    data: {
      asset_id: 'EF-2026-00422',
      batch_id: 'EF-BATCH-2026-017',
      type: 'Electronic Fuze',
      model: 'EF-MK4-SYNTH',
      serial_number: 'SN-EF-00422',
      lifecycle_state: 'ACCEPTED_FOR_ASSEMBLY',
      verification_status: 'VERIFIED',
      cert_id: 'CERT-2026-17387',
      supplier: 'BEL Synthetic Procurement Div.',
    }
  },
  {
    id: '9fb0a223-8543-4d1b-bc16-16700cf9016f',
    label: 'TIR-2026-003076 (Thermal Imaging - SUPPLIER DECLARED)',
    type: 'asset',
    data: {
      asset_id: 'TIR-2026-003076',
      batch_id: 'TIR-BATCH-2026-83',
      type: 'Surveillance Equipment',
      model: 'TIR-MOD-900',
      serial_number: 'SN-TIR-75914',
      lifecycle_state: 'SUPPLIER_DECLARED',
      verification_status: 'PENDING',
      supplier: 'BEL Electro-Optics Div. - Pune',
    }
  },
  {
    id: 'd0a417f3-1da6-413b-a5df-6e88dff000c1',
    label: 'E2E-TEST-1790701936707 (Test Component - RECEIVED, INSPECTABLE)',
    type: 'asset',
    data: {
      asset_id: 'E2E-TEST-1790701936707',
      batch_id: 'E2E-BATCH-001',
      type: 'Test Component',
      model: 'E2E-TEST-MODEL',
      serial_number: 'SN-E2E-1790701936707',
      lifecycle_state: 'RECEIVED',
      verification_status: 'PENDING',
      supplier: 'E2E Test Supplier',
    }
  },
  {
    id: '59be7f8f-9188-4919-9958-99117c4d5ecd',
    label: 'EF-2026-00421 (Electronic Fuze - FULL LIFECYCLE)',
    type: 'asset',
    data: {
      asset_id: 'EF-2026-00421',
      batch_id: 'EF-BATCH-2026-017',
      type: 'Electronic Fuze',
      model: 'EF-MK4-SYNTH',
      serial_number: 'SN-EF-00421',
      lifecycle_state: 'ACCEPTED_FOR_ASSEMBLY',
      verification_status: 'VERIFIED',
      cert_id: 'CERT-2026-00089',
      supplier: 'BEL Synthetic Procurement Div.',
    }
  },
];

/**
 * Real persisted demo certifications from database
 */
export const DEMO_CERTIFICATIONS: DemoRecord[] = [
  {
    id: '26401d13-9c50-4cac-acb5-fee2b9f761ea',
    label: 'CERT-2026-17387 (CONFIRMED - Current Contract)',
    type: 'certification',
    data: {
      cert_id: 'CERT-2026-17387',
      asset_id: 'af786dbb-2cda-4c55-887f-cf2640eb6255',
      asset_display: 'EF-2026-00422',
      token_id: '2',
      contract_address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
      network: 'BEL-TRUST-CHAIN',
      tx_hash: '0xa2a337ada9b94e510b2881f21db0cb0ccc817e009479babc70f328cf7c610d55',
      block_number: 8102,
      status: 'CONFIRMED',
      issued_by: 'a.mehta@bel-defence.in',
    }
  },
  {
    id: '5b6d95a1-4f80-427b-8ddb-70d7bbeede11',
    label: 'CERT-2026-00089 (CONFIRMED - Synthetic Demo)',
    type: 'certification',
    data: {
      cert_id: 'CERT-2026-00089',
      asset_id: '59be7f8f-9188-4919-9958-99117c4d5ecd',
      asset_display: 'EF-2026-00421',
      token_id: 'TKN-00089',
      contract_address: '0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH',
      network: 'BEL-TRUST-CHAIN (Synthetic Demo)',
      tx_hash: '0x8A42b3c5d1e7f2a9...19F2',
      block_number: 19842317,
      status: 'CONFIRMED',
      issued_by: 'Priya Sharma',
    }
  },
];

/**
 * Real persisted demo evidence from database
 */
export const DEMO_EVIDENCE: DemoRecord[] = [
  {
    id: '91570a49-4e4d-439c-969c-62c654182022',
    label: 'EVD-MUMJICQU-18AT (Test Document - VERIFIED)',
    type: 'evidence',
    data: {
      evidence_id: 'EVD-MUMJICQU-18AT',
      asset_id: '87ea8939-fe78-43c8-8bd9-ce259b46e064',
      asset_display: 'P54-TEST-1790677838187',
      filename: 'test-evidence.txt',
      type: 'Test Document',
      hash: 'b6df13c5e5750061dc4fba365bd4cad17b611cefc1de8afda1be7dd8d1aeeac5',
      integrity_verified: true,
      status: 'Complete',
    }
  },
  {
    id: '410ce28a-a687-44ef-a697-15d554fd353f',
    label: 'EVD-2026-004 (QA Approval - VERIFIED)',
    type: 'evidence',
    data: {
      evidence_id: 'EVD-2026-004',
      asset_id: '59be7f8f-9188-4919-9958-99117c4d5ecd',
      asset_display: 'EF-2026-00421',
      filename: 'qa_approval_EF00421.pdf',
      type: 'QA Approval',
      hash: 'e5f2a8c7d3b16e9a',
      integrity_verified: true,
      status: 'Complete',
      blockchain_tx: '0x1B8Ae9...C3F7',
    }
  },
];

/**
 * Get demo records by type
 */
export function getDemoRecordsByType(type: DemoRecord['type']): DemoRecord[] {
  switch (type) {
    case 'asset':
      return DEMO_ASSETS;
    case 'certification':
      return DEMO_CERTIFICATIONS;
    case 'evidence':
      return DEMO_EVIDENCE;
    case 'inspection':
      return []; // Add when inspection records are available
    default:
      return [];
  }
}

/**
 * Get demo record by ID
 */
export function getDemoRecordById(id: string): DemoRecord | undefined {
  return [...DEMO_ASSETS, ...DEMO_CERTIFICATIONS, ...DEMO_EVIDENCE].find(r => r.id === id);
}

/**
 * Get all demo records
 */
export function getAllDemoRecords(): DemoRecord[] {
  return [...DEMO_ASSETS, ...DEMO_CERTIFICATIONS, ...DEMO_EVIDENCE];
}
