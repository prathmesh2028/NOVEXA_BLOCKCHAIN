import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete the failed blockchain transaction with wrong contract address
  const deleted = await prisma.blockchainTransaction.deleteMany({
    where: {
      idempotencyKey: 'MINT:73771de4-8b74-4045-92e4-9b854b7bd48a'
    }
  });
  console.log(`Deleted ${deleted.count} blockchain transaction(s)`);

  // Reset outbox event to PENDING
  const outbox = await prisma.outboxEvent.update({
    where: { id: '25083e4c-57de-479a-b5df-c49ad85deb63' },
    data: {
      status: 'PENDING',
      attemptCount: 0,
      lastError: null,
      claimedBy: null,
      claimedAt: null,
      nextAttemptAt: new Date(),
      completedAt: null,
    }
  });

  console.log('Outbox event reset to PENDING:');
  console.log(JSON.stringify(outbox, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
