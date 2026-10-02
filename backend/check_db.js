const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const sc = await p.studentCoordinator.findMany({
    include: {
      user: {
        include: { studentProfile: true }
      }
    }
  });
  sc.forEach(s => {
    const profile = s.user?.studentProfile;
    console.log(s.userId, s.user?.fullName, 'profile:', profile ? 'YES' : 'NO',
      profile ? `year:${profile.currentYear} dept:${profile.department} course:${profile.course} phone:${profile.phoneNumber}` : '');
  });
  await p.$disconnect();
})();
