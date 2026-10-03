import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Reset passwords for demo users to known values
  const passwordHash = await bcrypt.hash('password123', 10);

  const updated = await prisma.user.updateMany({
    where: {
      email: {
        in: [
          'inspector@kavachtrust.dev',
          'admin@kavachtrust.dev',
          'procurement@kavachtrust.dev',
          'd.nair@bel-defence.in'
        ]
      }
    },
    data: {
      passwordHash
    }
  });

  console.log(`Updated ${updated.count} users with password: password123`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
