// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Testing Certification → Blockchain Flow ===\n');

  // 1. Find an eligible asset (ACCEPTED_FOR_ASSEMBLY, not certified)
  let asset = await prisma.asset.findFirst({
    where: {
      lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
      certStatus: { notIn: ['CONFIRMED', 'PENDING'] }
    },
    include: { batch: true }
  });

  if (!asset) {
    console.log('No eligible asset found. Creating a test asset...');

    // Create a test batch
    const batch = await prisma.batch.create({
      data: {
        batchId: `TEST-BATCH-${Date.now()}`,
        category: 'RADAR',
        quantity: 1,
        status: 'ACTIVE'
      }
    });

    // Create a test asset
    asset = await prisma.asset.create({
      data: {
        assetId: `BEL-RADAR-TEST-${Date.now()}`,
        name: 'Test Radar Asset',
        category: 'RADAR',
        type: 'PASSIVE',
        batchRefId: batch.batchId,
        lifecycleState: 'ACCEPTED_FOR_ASSEMBLY',
        certStatus: 'NOT_CERTIFIED',
        registeredById: '00000000-0000-0000-0000-000000000000' // placeholder
      },
      include: { batch: true }
    });

    console.log(`Created test asset: ${asset.assetId}`);
  } else {
    console.log(`Found eligible asset: ${asset.assetId}`);
  }

  // 2. Find or create a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('No user found. Please create a user first.');
    process.exit(1);
  }

  console.log(`Using user: ${user.email}`);

  // Get actor DID if available
  const actor = await prisma.actor.findUnique({
    where: { userId: user.id }
  });

  // 3. Create certification
  const certId = `CERT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
  const mintRequestId = uuidv4();

  console.log(`\nCreating certification ${certId}...`);

  const cert = await prisma.certification.create({
    data: {
      certId,
      assetId: asset!.id,
      batchRefId: asset!.batchRefId,
      status: 'PENDING',
      issuedById: user.id,
      issuedByName: user.name || 'Test User',
      issuedByDid: actor?.did || 'did:test:123',
      network: 'BEL-TRUST-CHAIN',
      mintRequestId,
    },
    include: { batch: true }
  });

  console.log(`Certification created: ${cert.id}`);

  // 4. Update asset cert status
  await prisma.asset.update({
    where: { id: asset!.id },
    data: { certStatus: 'PENDING', certId: cert.certId }
  });

  console.log(`Asset status updated to PENDING`);

  // 5. Create outbox event
  const outboxEvent = await prisma.outboxEvent.create({
    data: {
      eventType: 'PASSPORT_MINT_REQUESTED',
      payload: {
        certificationId: cert.id,
        certId: cert.certId,
        assetId: asset!.assetId,
        batchId: asset!.batchRefId,
      },
      idempotencyKey: `mint:${cert.id}`,
    }
  });

  console.log(`Outbox event created: ${outboxEvent.id}`);
  console.log(`\nWaiting for worker to process (up to 60 seconds)...`);

  // 6. Poll for completion
  for (let i = 0; i < 12; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));

    const updatedCert = await prisma.certification.findUnique({
      where: { id: cert.id },
      include: { asset: true }
    });

    if (!updatedCert) {
      console.log(`[${i * 5}s] Certification not found`);
      continue;
    }

    console.log(`[${i * 5}s] Status: ${updatedCert.status}, TX: ${updatedCert.txHash || 'pending'}`);

    if (updatedCert.status === 'CONFIRMED') {
      console.log('\n=== CERTIFICATION CONFIRMED ON BLOCKCHAIN ===');
      console.log(`Cert ID: ${updatedCert.certId}`);
      console.log(`TX Hash: ${updatedCert.txHash}`);
      console.log(`Block: ${updatedCert.blockNumber}`);
      console.log(`Token ID: ${updatedCert.tokenId}`);
      console.log(`Contract: ${updatedCert.contractAddress}`);
      console.log(`Confirmations: ${updatedCert.confirmations}`);

      // 7. Verify blockchain transaction record
      const txRecord = await prisma.blockchainTransaction.findFirst({
        where: { idempotencyKey: `MINT:${cert.id}` }
      });

      if (txRecord) {
        console.log(`\nBlockchain Transaction Record:`);
        console.log(`Status: ${txRecord.status}`);
        console.log(`TX Hash: ${txRecord.txHash}`);
        console.log(`Block: ${txRecord.blockNumber}`);
        console.log(`Gas Used: ${txRecord.gasUsed}`);
      }

      // 8. Verify outbox event completion
      const completedEvent = await prisma.outboxEvent.findUnique({
        where: { id: outboxEvent.id }
      });

      if (completedEvent) {
        console.log(`\nOutbox Event Status: ${completedEvent.status}`);
      }

      console.log('\n=== TEST PASSED ===');
      process.exit(0);
    }

    if (updatedCert.status === 'FAILED') {
      console.log('\n=== CERTIFICATION FAILED ===');
      console.log('Check worker logs for details');
      process.exit(1);
    }
  }

  console.log('\n=== TEST TIMEOUT ===');
  console.log('Certification did not confirm within 60 seconds');

  // Check final state
  const finalCert = await prisma.certification.findUnique({
    where: { id: cert.id }
  });
  if (finalCert) {
    console.log(`Final status: ${finalCert.status}`);
  }

  process.exit(1);
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
