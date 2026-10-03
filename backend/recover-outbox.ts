import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Reset the outbox event to allow retry
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
