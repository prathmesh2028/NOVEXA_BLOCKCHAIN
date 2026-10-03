import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const outbox = await prisma.outboxEvent.findUnique({
    where: { id: '25083e4c-57de-479a-b5df-c49ad85deb63' }
  });
  console.log('--- Outbox Event ---');
  console.log(JSON.stringify(outbox, null, 2));

  const blockchainTx = await prisma.blockchainTransaction.findFirst({
    where: { idempotencyKey: 'mint:73771de4-8b74-4045-92e4-9b854b7bd48a' }
  });
  console.log('\n--- Blockchain Transaction ---');
  console.log(JSON.stringify(blockchainTx, null, 2));

  const certification = await prisma.certification.findUnique({
    where: { id: '73771de4-8b74-4045-92e4-9b854b7bd48a' }
  });
  console.log('\n--- Certification ---');
  console.log(JSON.stringify(certification, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
