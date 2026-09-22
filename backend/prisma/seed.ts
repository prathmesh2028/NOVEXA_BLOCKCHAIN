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
    { userId: admin.id, role: 'ADMIN' as const },
    { userId: nftCreator.id, role: 'NFT_CREATOR' as const },
    { userId: technician.id, role: 'TECHNICIAN' as const },
    { userId: auditor.id, role: 'AUDITOR' as const },
    { userId: pendingUser.id, role: 'TECHNICIAN' as const },
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
      certId: 'CERT-2026-00089', registeredByName: 'Rajesh Kumar',
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
      update: {},
      create: a,
    });
    assets.push(asset);
  }

  // ── Evidence (matching frontend mockData.ts) ──
  const evidenceData = [
    { evidenceId: 'EVD-2026-001', assetId: assets[0].id, filename: 'inspection_report_EF00421.pdf', type: 'Inspection Report', mimeType: 'application/pdf', sizeKb: 248, status: 'COMPLETE' as const, hash: 'a3f8c2d1e9b74c2f', event: 'INSPECTION_RECORDED', integrityVerified: true, blockchainTx: '0x8A42b3...19F2', uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-05T10:14:00Z') },
    { evidenceId: 'EVD-2026-002', assetId: assets[0].id, filename: 'supplier_declaration_BATCH017.pdf', type: 'Supplier Declaration', mimeType: 'application/pdf', sizeKb: 112, status: 'COMPLETE' as const, hash: 'd7e4a1c3f2b89a1e', event: 'SUPPLIER_DECLARED', integrityVerified: true, blockchainTx: '0x3C77f4...A4D1', uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-08-15T09:30:00Z') },
    { evidenceId: 'EVD-2026-003', assetId: assets[0].id, filename: 'receipt_confirmation_EF00421.jpg', type: 'Receipt Confirmation', mimeType: 'image/jpeg', sizeKb: 890, status: 'COMPLETE' as const, hash: 'b2c9d4e6f1a57f3b', event: 'RECEIVED', integrityVerified: true, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-08-22T14:45:00Z') },
    { evidenceId: 'EVD-2026-004', assetId: assets[0].id, filename: 'qa_approval_EF00421.pdf', type: 'QA Approval', mimeType: 'application/pdf', sizeKb: 176, status: 'COMPLETE' as const, hash: 'e5f2a8c7d3b16e9a', event: 'ACCEPTED_FOR_ASSEMBLY', integrityVerified: true, blockchainTx: '0x1B8Ae9...C3F7', uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-08T11:20:00Z') },
    { evidenceId: 'EVD-2026-005', assetId: assets[2].id, filename: 'inspection_report_EF00423.pdf', type: 'Inspection Report', mimeType: 'application/pdf', sizeKb: 198, status: 'FAILED' as const, hash: 'f1c3a7e2b9d42d8c', event: 'INSPECTION_RECORDED', integrityVerified: false, uploadedByName: 'Rajesh Kumar', uploadedByRole: 'Technician', createdAt: new Date('2026-09-09T10:50:00Z') },
  ];

  for (const e of evidenceData) {
    await prisma.evidence.upsert({
      where: { evidenceId: e.evidenceId },
      update: {},
      create: e,
    });
  }

  // ── Certifications ──
  await prisma.certification.upsert({
    where: { certId: 'CERT-2026-00089' },
    update: {},
    create: {
      certId: 'CERT-2026-00089', assetId: assets[0].id, batchRefId: batch1.id,
      tokenId: 'TKN-00089', contractAddress: '0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH',
      network: 'BEL-TRUST-CHAIN (Synthetic Demo)', txHash: '0x8A42b3c5d1e7f2a9...19F2',
      blockNumber: 19842317, status: 'CONFIRMED', issuedByName: 'Priya Sharma',
      issuedByDid: 'did:bel:actor:002', issuedAt: new Date('2026-09-10T11:05:00Z'),
      confirmedAt: new Date('2026-09-10T11:07:34Z'), confirmations: 47,
    },
  });

  await prisma.certification.upsert({
    where: { certId: 'CERT-2026-00088' },
    update: {},
    create: {
      certId: 'CERT-2026-00088', assetId: assets[1].id, batchRefId: batch1.id,
      tokenId: 'TKN-00088', contractAddress: '0x742d35Cc6634C0532925a3b8D4e9Cc7C0SYNTH',
      network: 'BEL-TRUST-CHAIN (Synthetic Demo)', txHash: '0x2F61c4...7A3E',
      status: 'PENDING', issuedByName: 'Priya Sharma', issuedByDid: 'did:bel:actor:002',
      issuedAt: new Date('2026-09-12T09:00:00Z'), confirmations: 0,
    },
  });

  // ── Blockchain Transactions ──
  const txData = [
    { txHash: '0x8A42b3c5d1e7f2a9b4c6d8e0f1a3c5e7...19F2', network: 'BEL-TRUST-CHAIN', blockNumber: 19842317, status: 'CONFIRMED' as const, action: 'Certification Mint', assetId: assets[0].id, confirmations: 47, gasUsed: 94231, fromAddress: '0x3C77f4...A4D1', contractAddress: '0x742d35Cc6634...SYNTH', tokenId: 'TKN-00089', createdAt: new Date('2026-09-10T11:05:00Z') },
    { txHash: '0x3C77f4a2b8c1d5e9f0a3...A4D1', network: 'BEL-TRUST-CHAIN', blockNumber: 19838201, status: 'CONFIRMED' as const, action: 'Evidence Anchor', assetId: assets[0].id, confirmations: 312, gasUsed: 48820, fromAddress: '0x3C77f4...A4D1', contractAddress: '0x742d35Cc6634...SYNTH', createdAt: new Date('2026-09-05T10:16:00Z') },
    { txHash: '0x2F61c4d7e9a0b2c5f8...7A3E', network: 'BEL-TRUST-CHAIN', status: 'PENDING' as const, action: 'Certification Mint', assetId: assets[1].id, confirmations: 0, fromAddress: '0x3C77f4...A4D1', contractAddress: '0x742d35Cc6634...SYNTH', tokenId: 'TKN-00088', createdAt: new Date('2026-09-12T09:00:00Z') },
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
    { eventType: 'CERTIFICATION_CREATED', actorDid: 'did:bel:actor:002', actorRole: 'NFT Creator', actorName: 'Priya Sharma', action: 'Certification minting initiated', resourceType: 'Certification', resourceId: 'CERT-2026-00089', result: 'SUCCESS', blockchainTxHash: '0x8A42b3...19F2', details: 'NFT Creator reviewed evidence and initiated minting for asset EF-2026-00421.', createdAt: new Date('2026-09-10T11:05:00Z') },
    { eventType: 'BLOCKCHAIN_TX_CONFIRMED', actorDid: 'did:bel:actor:002', actorRole: 'NFT Creator', actorName: 'Priya Sharma', action: 'Certification confirmed on-chain', resourceType: 'Certification', resourceId: 'CERT-2026-00089', result: 'SUCCESS', blockchainTxHash: '0x8A42b3...19F2', details: 'Certification CERT-2026-00089 confirmed. Block 19842317. 47 confirmations.', createdAt: new Date('2026-09-10T11:07:34Z') },
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
    { fromState: 'UNREGISTERED' as const, toState: 'SUPPLIER_DECLARED' as const, allowedRole: 'TECHNICIAN' as const, permission: 'asset:declare', description: 'Supplier declares component' },
    { fromState: 'SUPPLIER_DECLARED' as const, toState: 'RECEIVED' as const, allowedRole: 'TECHNICIAN' as const, permission: 'asset:receive', description: 'Component received at facility' },
    { fromState: 'RECEIVED' as const, toState: 'INSPECTION_RECORDED' as const, allowedRole: 'TECHNICIAN' as const, permission: 'asset:inspect', requiresEvidence: true, requiresInspection: true, description: 'Inspection completed' },
    { fromState: 'INSPECTION_RECORDED' as const, toState: 'ACCEPTED_FOR_ASSEMBLY' as const, allowedRole: 'TECHNICIAN' as const, permission: 'asset:accept', requiresEvidence: true, description: 'Accepted for assembly' },
    { fromState: 'INSPECTION_RECORDED' as const, toState: 'REJECTED_QUARANTINED' as const, allowedRole: 'TECHNICIAN' as const, permission: 'asset:reject', requiresEvidence: true, description: 'Rejected and quarantined' },
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
