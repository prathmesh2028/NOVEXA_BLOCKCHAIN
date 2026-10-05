/**
 * KavachTrust Backend V2 — Prisma Seed Data
 * 
 * SYNTHETIC / DEMO DATA ONLY
 * Matches frontend mockData.ts IDs and semantics for compatibility.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding KavachTrust Backend V2...');

  // ── Users ──
  const passwordHash = await bcrypt.hash('password', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'a.mehta@bel-defence.in' },
    update: {},
    create: {
      email: 'a.mehta@bel-defence.in',
      name: 'Arjun Mehta',
      passwordHash,
      status: 'ACTIVE',
      lastActive: new Date('2026-09-12T09:45:00Z'),
    },
  });

  const nftCreator = await prisma.user.upsert({
    where: { email: 'p.sharma@bel-defence.in' },
    update: {},
    create: {
      email: 'p.sharma@bel-defence.in',
      name: 'Priya Sharma',
      passwordHash,
      status: 'ACTIVE',
      lastActive: new Date('2026-09-12T11:05:00Z'),
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: 'r.kumar@bel-defence.in' },
    update: {},
    create: {
      email: 'r.kumar@bel-defence.in',
      name: 'Rajesh Kumar',
      passwordHash,
      status: 'ACTIVE',
      lastActive: new Date('2026-09-12T10:30:00Z'),
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: 'd.nair@bel-defence.in' },
    update: {},
    create: {
      email: 'd.nair@bel-defence.in',
      name: 'Deepa Nair',
      passwordHash,
      status: 'ACTIVE',
      lastActive: new Date('2026-09-11T16:20:00Z'),
    },
  });

  const pendingUser = await prisma.user.upsert({
    where: { email: 'v.singh@bel-defence.in' },
    update: {},
    create: {
      email: 'v.singh@bel-defence.in',
      name: 'Vikram Singh',
      passwordHash,
      status: 'PENDING',
    },
  });

  // ── Roles ──
  const roleData = [
    { userId: admin.id, role: 'SYSTEM_ADMIN' as const },
    { userId: nftCreator.id, role: 'PROCUREMENT_SUPPLY_CHAIN_OFFICER' as const },
    { userId: technician.id, role: 'QUALITY_INSPECTOR' as const },
    { userId: auditor.id, role: 'AUDITOR' as const },
    { userId: pendingUser.id, role: 'QUALITY_INSPECTOR' as const },
  ];

  for (const r of roleData) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: r.userId, role: r.role } },
      update: {},
      create: r,
    });
  }

  // ── Actors ──
  const actors = [
    { userId: admin.id, did: 'did:bel:actor:001', walletAddress: '0x8A42b3c5d1e7f2a919F2' },
    { userId: nftCreator.id, did: 'did:bel:actor:002', walletAddress: '0x3C77f4a2b8c1d5e9A4D1' },
    { userId: technician.id, did: 'did:bel:actor:003', walletAddress: null },
    { userId: auditor.id, did: 'did:bel:actor:004', walletAddress: null },
    { userId: pendingUser.id, did: 'did:bel:actor:005', walletAddress: null },
  ];

  for (const a of actors) {
    await prisma.actor.upsert({
      where: { userId: a.userId },
      update: {},
      create: {
        userId: a.userId,
        did: a.did,
        walletAddress: a.walletAddress,
        credentialStatus: a.userId === pendingUser.id ? 'PENDING' : 'VERIFIED',
        identityStatus: a.userId === pendingUser.id ? 'PENDING' : 'VERIFIED',
      },
    });
  }

  // ── Batches ──
  const batch1 = await prisma.batch.upsert({
    where: { batchId: 'EF-BATCH-2026-017' },
    update: {},
    create: { batchId: 'EF-BATCH-2026-017', supplier: 'BEL Synthetic Procurement Div.', description: 'Electronic Fuze batch' },
  });

  const batch2 = await prisma.batch.upsert({
    where: { batchId: 'PT-BATCH-2026-004' },
    update: {},
    create: { batchId: 'PT-BATCH-2026-004', supplier: 'BEL Synthetic Sensors Div.', description: 'Pressure Transducer batch' },
  });

  const batch3 = await prisma.batch.upsert({
    where: { batchId: 'IG-BATCH-2026-008' },
    update: {},
    create: { batchId: 'IG-BATCH-2026-008', supplier: 'BEL Synthetic Ignition Div.', description: 'Ignition Module batch' },
  });

  // ── Assets (matching frontend mockData.ts) ──
  const assetData = [
    {
      assetId: 'EF-2026-00421', batchRefId: batch1.id, type: 'Electronic Fuze', model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00421', supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'ACCEPTED_FOR_ASSEMBLY' as const, verificationStatus: 'VERIFIED' as const,
      evidenceCount: 4, evidenceStatus: 'COMPLETE' as const, certStatus: 'CONFIRMED' as const,
      certId: 'CERT-2026-24767', registeredByName: 'Rajesh Kumar',
      description: 'Synthetic Electronic Fuze unit, batch demonstrating full lifecycle from declaration to assembly acceptance. Non-classified demonstration record.',
      createdAt: new Date('2026-08-15T09:22:00Z'),
    },
    {
      assetId: 'EF-2026-00422', batchRefId: batch1.id, type: 'Electronic Fuze', model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00422', supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'INSPECTION_RECORDED' as const, verificationStatus: 'REVIEW_REQUIRED' as const,
      evidenceCount: 2, evidenceStatus: 'PROCESSING' as const, certStatus: 'PENDING' as const,
      registeredByName: 'Rajesh Kumar',
      description: 'Synthetic Electronic Fuze unit — inspection recorded, pending evidence review.',
      createdAt: new Date('2026-08-15T09:25:00Z'),
    },
    {
      assetId: 'EF-2026-00423', batchRefId: batch1.id, type: 'Electronic Fuze', model: 'EF-MK4-SYNTH',
      serialNumber: 'SN-EF-00423', supplier: 'BEL Synthetic Procurement Div.',
      lifecycleState: 'REJECTED_QUARANTINED' as const, verificationStatus: 'FAILED' as const,
      evidenceCount: 3, evidenceStatus: 'FAILED' as const, certStatus: 'NOT_CERTIFIED' as const,
      registeredByName: 'Rajesh Kumar',
      description: 'Synthetic unit — rejected during inspection. Evidence fingerprint mismatch detected.',
      createdAt: new Date('2026-08-15T09:28:00Z'),
    },
    {
      assetId: 'PT-2026-00105', batchRefId: batch2.id, type: 'Pressure Transducer', model: 'PT-SEN-SYNTH',
      serialNumber: 'SN-PT-00105', supplier: 'BEL Synthetic Sensors Div.',
      lifecycleState: 'RECEIVED' as const, verificationStatus: 'PENDING' as const,
      evidenceCount: 1, evidenceStatus: 'UPLOADING' as const, certStatus: 'NOT_CERTIFIED' as const,
      registeredByName: 'Rajesh Kumar',
      description: 'Synthetic pressure transducer — received, evidence upload in progress.',
      createdAt: new Date('2026-09-01T10:00:00Z'),
    },
    {
      assetId: 'IG-2026-00210', batchRefId: batch3.id, type: 'Ignition Module', model: 'IG-MOD-SYNTH',
      serialNumber: 'SN-IG-00210', supplier: 'BEL Synthetic Ignition Div.',
      lifecycleState: 'SUPPLIER_DECLARED' as const, verificationStatus: 'PENDING' as const,
      evidenceCount: 0, evidenceStatus: 'PROCESSING' as const, certStatus: 'NOT_CERTIFIED' as const,
      registeredByName: 'Rajesh Kumar',
      description: 'Synthetic ignition module — supplier declared, awaiting receipt and inspection.',
      createdAt: new Date('2026-09-10T14:30:00Z'),
    },
  ];

  const assets: any[] = [];
  for (const a of assetData) {
    const asset = await prisma.asset.upsert({
      where: { assetId: a.assetId },
      update: a.assetId === 'PT-2026-00105'
        ? { certId: 'CERT-2026-24767', certStatus: 'CONFIRMED' }
        : {},
      create: a,
    });
    assets.push(asset);
  }

  // ── Evidence (matching frontend mockData.ts) ──
  const evidenceData = [
    { evidenceId: 'EVD-2026-001', assetId: assets[0].id, filename: 'inspection_report_EF00421.pdf', type: 'Inspection Report', mimeType: 'application/pdf', sizeKb: 248, status: 'COMPLETE' as const, hash: 'a3f8c2d1e9b74c2f', event: 'INSPECTION_RECORDED', integrityVerified: true, blockchainTx: null, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-05T10:14:00Z') },
    { evidenceId: 'EVD-2026-002', assetId: assets[0].id, filename: 'supplier_declaration_BATCH017.pdf', type: 'Supplier Declaration', mimeType: 'application/pdf', sizeKb: 112, status: 'COMPLETE' as const, hash: 'd7e4a1c3f2b89a1e', event: 'SUPPLIER_DECLARED', integrityVerified: true, blockchainTx: '0x3C77f4...A4D1', uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-08-15T09:30:00Z') },
    { evidenceId: 'EVD-2026-003', assetId: assets[0].id, filename: 'receipt_confirmation_EF00421.jpg', type: 'Receipt Confirmation', mimeType: 'image/jpeg', sizeKb: 890, status: 'COMPLETE' as const, hash: 'b2c9d4e6f1a57f3b', event: 'RECEIVED', integrityVerified: true, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-08-22T14:45:00Z') },
    { evidenceId: 'EVD-2026-004', assetId: assets[0].id, filename: 'qa_approval_EF00421.pdf', type: 'QA Approval', mimeType: 'application/pdf', sizeKb: 176, status: 'COMPLETE' as const, hash: 'e5f2a8c7d3b16e9a', event: 'ACCEPTED_FOR_ASSEMBLY', integrityVerified: true, blockchainTx: null, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-08T11:20:00Z') },
    { evidenceId: 'EVD-2026-005', assetId: assets[2].id, filename: 'inspection_report_EF00423.pdf', type: 'Inspection Report', mimeType: 'application/pdf', sizeKb: 198, status: 'FAILED' as const, hash: 'f1c3a7e2b9d42d8c', event: 'INSPECTION_RECORDED', integrityVerified: false, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-09T10:50:00Z') },
  ];

  for (const e of evidenceData) {
    await prisma.evidence.upsert({
      where: { evidenceId: e.evidenceId },
      update: { blockchainTx: null },
      create: e,
    });
  }

  // ── Certifications ──
  // Remove stale or fabricated non-confirmed rows so the pilot dataset exposes
  // only authoritative on-chain proof and does not invite worker reconciliation.
  await prisma.blockchainTransaction.deleteMany({
    where: { status: { not: 'CONFIRMED' } },
  });
  await prisma.certification.deleteMany({
    where: { tokenId: '1', NOT: { certId: 'CERT-2026-24767' } },
  });
  await prisma.certification.upsert({
    where: { certId: 'CERT-2026-24767' },
    update: {
      certId: 'CERT-2026-24767',
      assetId: assets[3].id,
      batchRefId: batch2.id,
      tokenId: '1',
      contractAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
      network: 'BEL-TRUST-CHAIN',
      txHash: '0x149fcf101a9d95320c1f6e4cc9d876d937f743bfbe4754bfa8e30992fe8ba6a3',
      blockNumber: 42801,
      status: 'CONFIRMED',
      confirmations: 1,
    },
    create: {
      certId: 'CERT-2026-24767', assetId: assets[3].id, batchRefId: batch2.id,
      tokenId: '1', contractAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
      network: 'BEL-TRUST-CHAIN', txHash: '0x149fcf101a9d95320c1f6e4cc9d876d937f743bfbe4754bfa8e30992fe8ba6a3',
      blockNumber: 42801, status: 'CONFIRMED', issuedByName: 'Priya Sharma',
      issuedByDid: 'did:bel:actor:002', issuedAt: new Date('2026-09-10T11:05:00Z'),
      confirmedAt: new Date('2026-09-10T11:07:34Z'), confirmations: 47,
    },
  });

  await prisma.certification.upsert({
    where: { certId: 'CERT-2026-00088' },
    update: {},
    create: {
      certId: 'CERT-2026-00088', assetId: assets[1].id, batchRefId: batch1.id,
      tokenId: null, contractAddress: null,
      network: 'BEL-TRUST-CHAIN', txHash: null,
      status: 'PENDING', issuedByName: 'Priya Sharma', issuedByDid: 'did:bel:actor:002',
      issuedAt: new Date('2026-09-12T09:00:00Z'), confirmations: 0,
    },
  });

  // ── Blockchain Transactions ──
  const txData = [
    { txHash: '0x149fcf101a9d95320c1f6e4cc9d876d937f743bfbe4754bfa8e30992fe8ba6a3', network: 'BEL-TRUST-CHAIN', blockNumber: 42801, status: 'CONFIRMED' as const, action: 'Certification Mint', assetId: assets[3].id, confirmations: 1, gasUsed: 0, fromAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', contractAddress: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788', tokenId: '1', createdAt: new Date('2026-09-10T11:05:00Z') },
  ];

  for (const tx of txData) {
    await prisma.blockchainTransaction.upsert({
      where: { txHash: tx.txHash },
      update: {},
      create: tx,
    });
  }

  // ── Audit Events (hash-chained) ──
  const auditData = [
    { eventType: 'USER_AUTHENTICATED', actorDid: 'did:bel:actor:001', actorRole: 'Administrator', actorName: 'Arjun Mehta', action: 'User role assigned', result: 'SUCCESS', details: 'Role NFT Creator assigned to Priya Sharma (did:bel:actor:002).', createdAt: new Date('2026-09-01T08:00:00Z') },
    { eventType: 'EVIDENCE_SUBMITTED', actorDid: 'did:bel:actor:003', actorRole: 'Technician', actorName: 'Rajesh Kumar', action: 'Evidence uploaded — Inspection Report', resourceType: 'Evidence', resourceId: 'EVD-2026-001', result: 'SUCCESS', details: 'Inspection report fingerprint: a3f8c2d1...4c2f. Anchored on-chain.', createdAt: new Date('2026-09-05T10:14:00Z') },
    { eventType: 'EVIDENCE_SUBMITTED', actorDid: 'did:bel:actor:003', actorRole: 'Technician', actorName: 'Rajesh Kumar', action: 'Evidence uploaded — QA Approval', resourceType: 'Evidence', resourceId: 'EVD-2026-004', result: 'SUCCESS', details: 'Evidence fingerprint generated: e5f2a8c7...6e9a. Integrity verified.', createdAt: new Date('2026-09-08T11:20:00Z') },
    { eventType: 'LIFECYCLE_TRANSITIONED', actorDid: 'did:bel:actor:003', actorRole: 'Technician', actorName: 'Rajesh Kumar', action: 'Lifecycle transitioned to ACCEPTED_FOR_ASSEMBLY', resourceType: 'Asset', resourceId: assets[0].id, result: 'SUCCESS', details: 'Asset EF-2026-00421 accepted for assembly after successful inspection.', createdAt: new Date('2026-09-08T11:25:00Z') },
    { eventType: 'EVIDENCE_VERIFIED', actorDid: 'did:bel:actor:004', actorRole: 'Auditor', actorName: 'Deepa Nair', action: 'Evidence integrity verified', resourceType: 'Evidence', resourceId: 'EVD-2026-005', result: 'FAILED', details: 'Fingerprint mismatch detected. Stored: f1c3a7e2...2d8c vs Computed: 9b2e5f1c...8a4d. Asset quarantined.', createdAt: new Date('2026-09-09T14:30:00Z') },
    { eventType: 'CERTIFICATION_CREATED', actorDid: 'did:bel:actor:002', actorRole: 'NFT Creator', actorName: 'Priya Sharma', action: 'Certification minting initiated', resourceType: 'Certification', resourceId: 'CERT-2026-24767', result: 'SUCCESS', blockchainTxHash: '0x149fcf101a9d95320c1f6e4cc9d876d937f743bfbe4754bfa8e30992fe8ba6a3', details: 'Synthetic pilot certification mint initiated for asset PT-2026-00105.', createdAt: new Date('2026-09-10T11:05:00Z') },
    { eventType: 'BLOCKCHAIN_TX_CONFIRMED', actorDid: 'did:bel:actor:002', actorRole: 'NFT Creator', actorName: 'Priya Sharma', action: 'Certification confirmed on-chain', resourceType: 'Certification', resourceId: 'CERT-2026-24767', result: 'SUCCESS', blockchainTxHash: '0x149fcf101a9d95320c1f6e4cc9d876d937f743bfbe4754bfa8e30992fe8ba6a3', details: 'Certification CERT-2026-24767 confirmed on chain. Block 42801. Token 1.', createdAt: new Date('2026-09-10T11:07:34Z') },
  ];

  let previousHash = '0'.repeat(64);
  for (const ae of auditData) {
    const crypto = await import('crypto');
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(ae)).digest('hex');
    await prisma.auditEvent.create({
      data: { ...ae, payloadHash, previousHash },
    });
    previousHash = payloadHash;
  }

  // ── Expected Transitions ──
  const transitions = [
    { fromState: 'UNREGISTERED' as const, toState: 'SUPPLIER_DECLARED' as const, allowedRole: 'QUALITY_INSPECTOR' as const, permission: 'asset:declare', description: 'Supplier declares component' },
    { fromState: 'SUPPLIER_DECLARED' as const, toState: 'RECEIVED' as const, allowedRole: 'QUALITY_INSPECTOR' as const, permission: 'asset:receive', description: 'Component received at facility' },
    { fromState: 'RECEIVED' as const, toState: 'INSPECTION_RECORDED' as const, allowedRole: 'QUALITY_INSPECTOR' as const, permission: 'asset:inspect', requiresEvidence: true, requiresInspection: true, description: 'Inspection completed' },
    { fromState: 'INSPECTION_RECORDED' as const, toState: 'ACCEPTED_FOR_ASSEMBLY' as const, allowedRole: 'QUALITY_INSPECTOR' as const, permission: 'asset:accept', requiresEvidence: true, description: 'Accepted for assembly' },
    { fromState: 'INSPECTION_RECORDED' as const, toState: 'REJECTED_QUARANTINED' as const, allowedRole: 'QUALITY_INSPECTOR' as const, permission: 'asset:reject', requiresEvidence: true, description: 'Rejected and quarantined' },
  ];

  for (const t of transitions) {
    await prisma.expectedTransition.upsert({
      where: { fromState_toState_allowedRole: { fromState: t.fromState, toState: t.toState, allowedRole: t.allowedRole } },
      update: {},
      create: t,
    });
  }

  // ── Supply Chain Domain ──
  const sup1 = await prisma.supplier.upsert({
    where: { supplierId: 'SUP-BEL-001' },
    update: {},
    create: {
      supplierId: 'SUP-BEL-001',
      name: 'BEL Synthetic Procurement Div.',
      contactInfo: { email: 'procurement@bel-synthetic.in', phone: '+91-80-28381111' },
      status: 'ACTIVE',
    },
  });

  const sup2 = await prisma.supplier.upsert({
    where: { supplierId: 'SUP-HAL-002' },
    update: {},
    create: {
      supplierId: 'SUP-HAL-002',
      name: 'HAL Avionics Precision Components',
      contactInfo: { email: 'supply@hal-synthetic.in', phone: '+91-80-22322222' },
      status: 'ACTIVE',
    },
  });

  const fac1 = await prisma.facility.upsert({
    where: { facilityId: 'FAC-BLR-01' },
    update: {},
    create: {
      facilityId: 'FAC-BLR-01',
      supplierId: sup1.id,
      name: 'BEL Bangalore Integrated Defense Complex',
      location: 'Bangalore, Karnataka',
      type: 'Manufacturing',
    },
  });

  const fac2 = await prisma.facility.upsert({
    where: { facilityId: 'FAC-HYD-02' },
    update: {},
    create: {
      facilityId: 'FAC-HYD-02',
      supplierId: sup1.id,
      name: 'BEL Hyderabad Missile Electronics Facility',
      location: 'Hyderabad, Telangana',
      type: 'Assembly & Testing',
    },
  });

  const lot1 = await prisma.lot.upsert({
    where: { lotId: 'LOT-2026-EF-001' },
    update: {},
    create: {
      lotId: 'LOT-2026-EF-001',
      supplierId: sup1.id,
      materialType: 'High-Grade Titanium Alloy Components',
      quantity: 500,
      manufacturedAt: new Date('2026-08-01T00:00:00Z'),
    },
  });

  const shipment1 = await prisma.shipment.upsert({
    where: { shipmentId: 'SHP-2026-0091' },
    update: {},
    create: {
      shipmentId: 'SHP-2026-0091',
      dispatchFacilityId: fac1.id,
      receiveFacilityId: fac2.id,
      status: 'IN_TRANSIT',
      trackingNumber: 'TRK-IND-DEF-99881',
      dispatchedAt: new Date('2026-09-15T08:30:00Z'),
    },
  });

  // ── Expanded synthetic pilot catalogue ──
  // Every generated record uses a stable business identifier so reseeding is
  // idempotent and all references point to persisted parent records.
  const expandedSuppliers = [];
  for (let i = 3; i <= 12; i += 1) {
    expandedSuppliers.push(await prisma.supplier.upsert({
      where: { supplierId: `SUP-SYN-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        supplierId: `SUP-SYN-${String(i).padStart(3, '0')}`,
        name: `Synthetic Defence Partner ${String(i).padStart(2, '0')}`,
        contactInfo: { email: `partner${i}@synthetic-pilot.invalid`, phone: `+91-80-5555-${String(i).padStart(4, '0')}` },
        status: i === 12 ? 'SUSPENDED' : 'ACTIVE',
      },
    }));
  }

  const allSuppliers = [sup1, sup2, ...expandedSuppliers];
  const expandedFacilities = [];
  for (let i = 3; i <= 10; i += 1) {
    const supplier = allSuppliers[(i - 3) % allSuppliers.length];
    expandedFacilities.push(await prisma.facility.upsert({
      where: { facilityId: `FAC-SYN-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        facilityId: `FAC-SYN-${String(i).padStart(3, '0')}`,
        supplierId: supplier.id,
        name: `Synthetic Pilot Facility ${String(i).padStart(2, '0')}`,
        location: ['Pune', 'Chennai', 'Hyderabad', 'Bengaluru'][i % 4] + ', India',
        type: i % 3 === 0 ? 'Testing' : i % 3 === 1 ? 'Warehouse' : 'Manufacturing',
      },
    }));
  }

  const allFacilities = [fac1, fac2, ...expandedFacilities];
  for (let i = 2; i <= 16; i += 1) {
    const supplier = allSuppliers[i % allSuppliers.length];
    await prisma.lot.upsert({
      where: { lotId: `LOT-SYN-2026-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        lotId: `LOT-SYN-2026-${String(i).padStart(3, '0')}`,
        supplierId: supplier.id,
        materialType: ['Titanium Alloy', 'Radar PCB Assembly', 'Ceramic Insulator', 'Optical Sensor'][i % 4],
        quantity: 100 + i * 25,
        manufacturedAt: new Date(`2026-${String((i % 8) + 1).padStart(2, '0')}-15T00:00:00Z`),
      },
    });
  }

  for (let i = 2; i <= 16; i += 1) {
    const dispatch = allFacilities[(i - 2) % allFacilities.length];
    const receive = allFacilities[(i - 1) % allFacilities.length];
    await prisma.shipment.upsert({
      where: { shipmentId: `SHP-SYN-2026-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        shipmentId: `SHP-SYN-2026-${String(i).padStart(3, '0')}`,
        dispatchFacilityId: dispatch.id,
        receiveFacilityId: receive.id,
        status: i % 5 === 0 ? 'REJECTED' : i % 3 === 0 ? 'RECEIVED' : 'IN_TRANSIT',
        trackingNumber: `TRK-SYN-${String(i).padStart(6, '0')}`,
        dispatchedAt: new Date(`2026-${String((i % 8) + 1).padStart(2, '0')}-20T08:30:00Z`),
      },
    });
  }

  const syntheticBatches = [batch1, batch2, batch3];
  for (let i = 6; i <= 30; i += 1) {
    const batch = syntheticBatches[i % syntheticBatches.length];
    const assetId = `SYNTH-2026-${String(i).padStart(3, '0')}`;
    const eligible = i % 4 === 0;
    const asset = await prisma.asset.upsert({
      where: { assetId },
      update: {},
      create: {
        assetId,
        batchRefId: batch.id,
        type: ['Radar Module', 'Secure Radio', 'Optical Sensor', 'Power Controller'][i % 4],
        model: `SYN-MOD-${String(i).padStart(3, '0')}`,
        serialNumber: `SN-SYN-${String(i).padStart(5, '0')}`,
        supplier: allSuppliers[i % allSuppliers.length].name,
        lifecycleState: eligible ? 'ACCEPTED_FOR_ASSEMBLY' : i % 5 === 0 ? 'REJECTED_QUARANTINED' : 'RECEIVED',
        verificationStatus: eligible ? 'VERIFIED' : i % 5 === 0 ? 'FAILED' : 'PENDING',
        evidenceCount: 1,
        evidenceStatus: i % 5 === 0 ? 'FAILED' : 'COMPLETE',
        certStatus: i % 6 === 0 ? 'CONFIRMED' : eligible ? 'PENDING' : 'NOT_CERTIFIED',
        certId: i % 6 === 0 ? `CERT-SYN-2026-${String(i).padStart(3, '0')}` : null,
        registeredByName: 'Synthetic Pilot Operator',
        description: 'Synthetic pilot record for end-to-end workflow validation.',
      },
    });

    await prisma.evidence.upsert({
      where: { evidenceId: `EVD-SYN-2026-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        evidenceId: `EVD-SYN-2026-${String(i).padStart(3, '0')}`,
        assetId: asset.id,
        filename: `synthetic-inspection-${i}.pdf`,
        type: 'Inspection Report',
        mimeType: 'application/pdf',
        sizeKb: 120 + i,
        status: i % 5 === 0 ? 'FAILED' : 'COMPLETE',
        hash: `synthetic-hash-${String(i).padStart(3, '0')}`,
        event: 'INSPECTION_RECORDED',
        integrityVerified: i % 5 !== 0,
        uploadedByName: 'Synthetic Pilot Operator',
        uploadedByRole: 'QUALITY_INSPECTOR',
      },
    });

    if (i % 6 === 0) {
      await prisma.certification.upsert({
        where: { certId: `CERT-SYN-2026-${String(i).padStart(3, '0')}` },
        update: {},
        create: {
          certId: `CERT-SYN-2026-${String(i).padStart(3, '0')}`,
          assetId: asset.id,
          batchRefId: batch.id,
          status: 'CONFIRMED',
          network: 'BEL-TRUST-CHAIN',
          issuedByName: 'Synthetic Pilot Operator',
          issuedAt: new Date('2026-09-20T10:00:00Z'),
        },
      });
    }
  }

  console.log('✅ Seed complete — SYNTHETIC / DEMO DATA');
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Assets: ${await prisma.asset.count()}`);
  console.log(`   Evidence: ${await prisma.evidence.count()}`);
  console.log(`   Certifications: ${await prisma.certification.count()}`);
  console.log(`   Audit Events: ${await prisma.auditEvent.count()}`);
  console.log(`   Blockchain Txs: ${await prisma.blockchainTransaction.count()}`);
  console.log(`   Suppliers: ${await prisma.supplier.count()}`);
  console.log(`   Facilities: ${await prisma.facility.count()}`);
  console.log(`   Lots: ${await prisma.lot.count()}`);
  console.log(`   Shipments: ${await prisma.shipment.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
