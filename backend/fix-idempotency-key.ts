import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Fix the idempotency key to match worker's expected format
  const outbox = await prisma.outboxEvent.update({
    where: { id: '25083e4c-57de-479a-b5df-c49ad85deb63' },
    data: {
      idempotencyKey: 'MINT:73771de4-8b74-4045-92e4-9b854b7bd48a', // Uppercase MINT to match worker
    }
  });

  console.log('Fixed idempotency key:');
  console.log(JSON.stringify(outbox, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
