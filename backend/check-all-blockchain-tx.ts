import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allTxs = await prisma.blockchainTransaction.findMany({
    where: {
      action: 'MINT_CERTIFICATION'
    },
    orderBy: { createdAt: 'desc' }
  });
  console.log('--- All MINT_CERTIFICATION Blockchain Transactions ---');
  console.log(JSON.stringify(allTxs, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
