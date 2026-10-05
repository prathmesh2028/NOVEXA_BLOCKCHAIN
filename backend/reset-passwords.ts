/**
 * Temporary script to reset user passwords
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting passwords...');

  const passwordHash = await bcrypt.hash('password', 10);

  // Update Rajesh Kumar
  await prisma.user.update({
    where: { email: 'r.kumar@bel-defence.in' },
    data: { passwordHash }
  });
  console.log('✅ Rajesh Kumar password reset');

  // Update Deepa Nair
  await prisma.user.update({
    where: { email: 'd.nair@bel-defence.in' },
    data: { passwordHash }
  });
  console.log('✅ Deepa Nair password reset');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
