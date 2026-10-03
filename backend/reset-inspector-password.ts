import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetInspectorPassword() {
  const email = 'r.kumar@bel-defence.in';
  const newPassword = 'password123';

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log(`User ${email} not found`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword }
  });

  console.log(`Password reset for ${email} to ${newPassword}`);
  console.log(`User ID: ${user.id}`);
  console.log(`User Name: ${user.name}`);
}

resetInspectorPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
