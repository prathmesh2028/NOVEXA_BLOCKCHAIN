/**
 * Direct database password check
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking password hashes in database...\n');

  const users = await prisma.user.findMany({
    where: {
      email: {
        in: ['r.kumar@bel-defence.in', 'd.nair@bel-defence.in']
      }
    },
    select: {
      email: true,
      name: true,
      status: true,
      passwordHash: true,
      createdAt: true
    }
  });

  console.log('Users found:', users.length);
  for (const user of users) {
    console.log(`\n${user.email}:`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Status: ${user.status}`);
    console.log(`  Has passwordHash: ${!!user.passwordHash}`);
    console.log(`  PasswordHash length: ${user.passwordHash?.length || 0}`);
    console.log(`  CreatedAt: ${user.createdAt}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
