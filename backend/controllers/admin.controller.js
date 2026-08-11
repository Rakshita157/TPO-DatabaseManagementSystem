const {
  getStudents,
  getStudentById,
  updateStudentProfile,
  updateUser,
  deleteStudent,
  exportStudents,
  getExportFieldOptions,
  getFilterOptions,
} = require("../services/admin.service");
const { generateStudentExcel } = require("../services/excel.service");
const { generateStudentCsv } = require("../services/csv.service");
const { resolveFieldDefs, getDefaultFieldDefs } = require("../constants/exportFields");

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
    const { format = "excel", fields } = req.query;
    const students = await exportStudents(req.query);

    let fieldDefs;
    if (fields) {
      fieldDefs = resolveFieldDefs(
        String(fields).split(",").map((k) => k.trim()).filter(Boolean),
        students
      );
    } else {
      fieldDefs = getDefaultFieldDefs(students);
    }

    if (fieldDefs.length === 0) {
      return res.status(400).json({ message: "No fields selected for export" });
    }

    if (format === "csv") {
      const csv = generateStudentCsv(students, fieldDefs);
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=students_export.csv"
      );
      return res.send(csv);
    }

    const buffer = await generateStudentExcel(students, fieldDefs);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=students_export.xlsx"
    );
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const exportFieldOptions = async (req, res) => {
  try {
    const options = await getExportFieldOptions();
    res.json(options);
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
  listStudents,
  getStudent,
  editStudentProfile,
  editUser,
  removeStudent,
  exportData,
  exportFieldOptions,
  filters,
};
