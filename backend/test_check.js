const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  try {
    const users = await p.user.count();
    const sc = await p.studentCoordinator.count();
    const available = await p.user.count({
      where: { role: 'STUDENT', studentCoordinator: { is: null } },
    });
    console.log('DB OK');
    console.log('users =', users);
    console.log('studentCoordinators =', sc);
    console.log('available unassigned students =', available);

    const sample = await p.user.findMany({
      where: { role: 'STUDENT', studentCoordinator: { is: null } },
      orderBy: { id: 'asc' },
      take: 2,
      include: { studentProfile: true },
    });
    console.log('sample available:', JSON.stringify(sample.map(u => ({
      id: u.id,
      fullName: u.fullName,
      collegeEmail: u.collegeEmail,
      course: u.studentProfile?.course,
      department: u.studentProfile?.department,
    })), null, 2));
  } catch (e) {
    console.error('DB ERROR:', e.message);
  } finally {
    await p.$disconnect();
  }
})();