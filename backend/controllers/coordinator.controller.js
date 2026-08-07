const prisma = require("../config/prisma");

const getStudentCoordinators = async (req, res) => {
  try {
    const coordinators = await prisma.studentCoordinator.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            collegeEmail: true,
            studentProfile: {
              select: {
                department: true,
                currentYear: true,
                phoneNumber: true,
              }
            }
          }
        }
      }
    });

    // Format the response
    const formattedCoordinators = coordinators.map(coord => ({
      name: coord.user.fullName,
      email: coord.user.collegeEmail,
      department: coord.user.studentProfile?.department || 'N/A',
      year: coord.user.studentProfile?.currentYear 
        ? `${coord.user.studentProfile.currentYear}${getYearSuffix(coord.user.studentProfile.currentYear)} Year` 
        : 'N/A',
      phone: coord.user.studentProfile?.phoneNumber || 'N/A'
    }));

    res.json(formattedCoordinators);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ message: "Failed to fetch student coordinators" });
  }
};

// Helper function to get year suffix
const getYearSuffix = (year) => {
  if (year === 1) return 'st';
  if (year === 2) return 'nd';
  if (year === 3) return 'rd';
  return 'th';
};

module.exports = {
  getStudentCoordinators
};
