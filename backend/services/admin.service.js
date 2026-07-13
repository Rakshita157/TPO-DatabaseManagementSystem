const prisma = require("../config/prisma");

const getStudents = async ({
  search,
  course,
  department,
  admissionYear,
  graduationYear,
  currentYear,
  currentSemester,
  gender,
  cgpaMin,
  cgpaMax,
  resumeUploaded,
  linkedinAdded,
  profileStatus,
  placementStatus,
  isVerified,
  sortBy,
  sortOrder,
  page = 1,
  limit = 15,
}) => {
  if (!course || !graduationYear) {
    return {
      students: [],
      total: 0,
      page: Number(page) || 1,
      limit: Number(limit) || 15,
      totalPages: 0,
    };
  }

  const where = {
    course,
    graduationYear: Number(graduationYear),
    user: {
      role: "STUDENT",
    },
  };

  if (search?.trim()) {
    const keyword = search.trim();

    where.OR = [
      {
        user: {
          fullName: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },
      {
        user: {
          collegeEmail: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },
      {
        collegeId: {
          contains: keyword,
          mode: "insensitive",
        },
      },
      {
        btuRollNumber: {
          contains: keyword,
          mode: "insensitive",
        },
      },
    ];
  }

  if (department) {
    where.department = department;
  }

  if (admissionYear) {
    where.admissionYear = Number(admissionYear);
  }

  if (currentYear) {
    where.currentYear = Number(currentYear);
  }

  if (currentSemester) {
    where.currentSemester = Number(currentSemester);
  }

  if (gender) {
    where.gender = gender;
  }

  if (cgpaMin || cgpaMax) {
    where.cgpa = {};

    if (cgpaMin) {
      where.cgpa.gte = Number(cgpaMin);
    }

    if (cgpaMax) {
      where.cgpa.lte = Number(cgpaMax);
    }
  }

  if (resumeUploaded === "yes") {
    where.document = {
      isNot: null,
    };
  }

  if (resumeUploaded === "no") {
    where.document = {
      is: null,
    };
  }

  if (linkedinAdded === "yes") {
    where.linkedinUrl = {
      not: null,
    };
  }

  if (linkedinAdded === "no") {
    where.linkedinUrl = null;
  }

  if (profileStatus) {
    where.profileStatus = profileStatus;
  }

  if (placementStatus) {
    where.placementStatus = placementStatus;
  }

  if (typeof isVerified !== "undefined") {
    where.isVerified = isVerified === "true";
  }
const allowedSortFields = [
    "department",
    "cgpa",
    "activeBacklogs",

    "currentSemester",
  ];

  let orderBy = [
    {
      department: "asc",
    },
    {
      user: {
        fullName: "asc",
      },
    },
  ];

  if (sortBy && allowedSortFields.includes(sortBy)) {
    orderBy = [
      {
        [sortBy]: sortOrder === "desc" ? "desc" : "asc",
      },
    ];
  }

  if (sortBy === "fullName") {
    orderBy = [
      {
        user: {
          fullName: sortOrder === "desc" ? "desc" : "asc",
        },
      },
    ];
  }

  const pageNumber = Number(page) || 1;
  const pageSize = Number(limit) || 15;
  const skip = (pageNumber - 1) * pageSize;

  const [students, total] = await Promise.all([
    prisma.studentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            collegeEmail: true,
            role: true,
          },
        },
        document: {
          select: {
            resumeUrl: true,
            uploadedAt: true,
          },
        },
         semesterResults: {
    select: {
      semester: true,
      sgpa: true,
    },
    orderBy: {
      semester: "asc",
    },
  },
},
      orderBy,
      skip,
      take: pageSize,
    }),

    prisma.studentProfile.count({
      where,
    }),
  ]);

  return {
    students,
    total,
    page: pageNumber,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

const getStudentById = async (userId) => {
  const student = await prisma.studentProfile.findUnique({
    where: {
      userId: Number(userId),
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          collegeEmail: true,
          role: true,
        },
      },

      document: {
        select: {
          resumeUrl: true,
          uploadedAt: true,
        },
      },

      semesterResults: {
        orderBy: {
          semester: "asc",
        },
      },
    },
  });

  return student;
};

const updateStudentProfile = async (userId, data) => {
  const student = await prisma.studentProfile.findUnique({
    where: {
      userId: Number(userId),
    },
  });

  if (!student) {
    throw new Error("Student not found");
  }

  return await prisma.studentProfile.update({
    where: {
      userId: Number(userId),
    },
    data,
  });

};

const updateUser = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return await prisma.user.update({
    where: {
      id: Number(userId),
    },
    data: {
      fullName: data.fullName,
      collegeEmail: data.collegeEmail,
    },
    select: {
      id: true,
      fullName: true,
      collegeEmail: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteStudent = async (userId) => {
  const student = await prisma.user.findUnique({
    where: {
      id: Number(userId),
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!student || student.role !== "STUDENT") {
    throw new Error("Student not found");
  }

  await prisma.user.delete({
    where: {
      id: Number(userId),
    },
  });

  return {
    message: "Student deleted successfully",
  };
};

const exportStudents = async (filters) => {
  const result = await getStudents({ ...filters, page: 1, limit: 10000, sortBy: "name", sortOrder: "asc" });
  return result.students;
};

const getFilterOptions = async () => {
  const [
    departments,
     courses,
    admissionYears,
    graduationYears,
  ] = await Promise.all([
    prisma.studentProfile.findMany({
      distinct: ["department"],
      select: {
        department: true,
      },
      orderBy: {
        department: "asc",
      },
    }),
prisma.studentProfile.findMany({
  distinct: ["course"],
  select: {
    course: true,
  },
  orderBy: {
        course: "asc",
      },
}),

    prisma.studentProfile.findMany({
      distinct: ["admissionYear"],
      select: {
        admissionYear: true,
      },
      orderBy: {
        admissionYear: "desc",
      },
    }),

    prisma.studentProfile.findMany({
      distinct: ["graduationYear"],
      select: {
        graduationYear: true,
      },
      orderBy: {
        graduationYear: "desc",
      },
    }),
  ]);

  return {
    departments: departments
      .map((item) => item.department)
      .filter(Boolean),

      courses: courses
    .map((item) => item.course)
    .filter(Boolean),

    admissionYears: admissionYears.map(
      (item) => item.admissionYear
    ),

    graduationYears: graduationYears.map(
      (item) => item.graduationYear
    ),
  };
};

module.exports = {
  getStudents,
  getStudentById,
  updateStudentProfile,
  updateUser,
  deleteStudent,
  exportStudents,
  getFilterOptions,
};
