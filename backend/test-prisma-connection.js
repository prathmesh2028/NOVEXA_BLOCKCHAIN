const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing Prisma connection...');
    const users = await prisma.user.findMany();
    console.log('Success! Users:', users.length);
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
