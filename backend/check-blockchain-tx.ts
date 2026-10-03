import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blockchainTx = await prisma.blockchainTransaction.findFirst({
    where: { idempotencyKey: 'MINT:73771de4-8b74-4045-92e4-9b854b7bd48a' }
  });
  console.log('--- Blockchain Transaction ---');
  console.log(JSON.stringify(blockchainTx, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
