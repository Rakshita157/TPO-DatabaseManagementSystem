const {
  getDashboardStats,
  getStudents,
  getStudentById,
  updateStudentProfile,
  updateUser,
  deleteStudent,
  exportStudents,
  getFilterOptions,
} = require("../services/admin.service");

const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listStudents = async (req, res) => {
  try {
    const result = await getStudents(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudent = async (req, res) => {
  try {
    const student = await getStudentById(req.params.userId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editStudentProfile = async (req, res) => {
  try {
    const profile = await updateStudentProfile(req.params.userId, req.body);
    res.json({ message: "Profile updated successfully", profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const editUser = async (req, res) => {
  try {
    const user = await updateUser(req.params.userId, req.body);
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeStudent = async (req, res) => {
  try {
    await deleteStudent(req.params.userId);
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportData = async (req, res) => {
  try {
    const students = await exportStudents(req.query);
    const csvRows = [];
    const headers = [
      "Full Name", "College Email", "College ID", "BTU Roll No", "Enrollment No",
      "Course", "Department", "Batch", "Admission Year", "Graduation Year",
      "Current Year", "Current Semester", "Gender", "CGPA", "Active Backlogs",
      "Passive Backlogs", "Placement Status", "Verified", "Resume URL", "LinkedIn URL",
    ];
    csvRows.push(headers.join(","));

    for (const s of students) {
      const row = [
        `"${s.user?.fullName || ""}"`,
        s.user?.collegeEmail || "",
        s.collegeId || "",
        s.btuRollNumber || "",
        s.enrollmentNumber || "",
        s.course || "",
        `"${s.department || "N/A"}"`,
        `${s.admissionYear}-${s.graduationYear}`,
        s.admissionYear,
        s.graduationYear,
        s.currentYear,
        s.currentSemester,
        s.gender || "",
        Number(s.cgpa) || "",
        s.activeBacklogs,
        s.passiveBacklogs,
        s.placementStatus,
        s.isVerified ? "Yes" : "No",
        s.document?.resumeUrl || "",
        s.linkedinUrl || "",
      ];
      csvRows.push(row.join(","));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students_export.csv");
    res.send(csvRows.join("\n"));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const filters = async (req, res) => {
  try {
    const options = await getFilterOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  listStudents,
  getStudent,
  editStudentProfile,
  editUser,
  removeStudent,
  exportData,
  filters,
};
