const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const settings = await p.collegeSettings.findFirst();
  console.log(JSON.stringify(settings, null, 2));
  await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });
