const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const all = await prisma.facultyCoordinator.findMany();
  console.log('All faculty coordinators in DB:');
  console.log(JSON.stringify(all, null, 2));
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
