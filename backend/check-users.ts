import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      status: 'ACTIVE'
    },
    select: {
      email: true,
      roles: true,
      name: true
    },
    take: 20
  });
  console.log('--- Active Users ---');
  console.log(JSON.stringify(users, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
