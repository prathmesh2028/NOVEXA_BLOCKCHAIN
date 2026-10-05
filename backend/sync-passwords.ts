/**
 * Sync passwords by using the backend's Prisma connection
 * Run this after backend is started
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  console.log('Syncing passwords...\n');

  const passwordHash = await bcrypt.hash('password', 10);

  // Update Rajesh Kumar
  await prisma.user.update({
    where: { email: 'r.kumar@bel-defence.in' },
    data: { passwordHash }
  });
  console.log('✅ Rajesh Kumar password updated');

  // Update Deepa Nair
  await prisma.user.update({
    where: { email: 'd.nair@bel-defence.in' },
    data: { passwordHash }
  });
  console.log('✅ Deepa Nair password updated');

  await app.close();
}

main().catch(console.error);
