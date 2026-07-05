const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.collegeSettings.findFirst();
  if (existing) return;

  await prisma.collegeSettings.create({
    data: {
      id: 1,
      tpoHeadName: 'Mr. Yashvin Gupta',
      tpoHeadPhoto: 'uploads/tpo/tpo-head.jpg',
      tpoHeadEmail: 'Tpo@gweca.ac.in',
      tpoHeadPhone: '7737394938',
      officeAddress: 'Govt. Women Engineering College Nasirabad Road, Makhupura Ajmer - 305002, Rajasthan, India',
      officeHours: '10am-5pm',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
