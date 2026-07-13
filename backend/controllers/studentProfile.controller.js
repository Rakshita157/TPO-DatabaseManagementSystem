const {
  getStudentProfile: getStudentProfileService,
  createStudentProfile: createStudentProfileService,
  updateStudentProfile: updateStudentProfileService,

  getSemesterResults: getSemesterResultsService,
  createSemesterResult: createSemesterResultService,
  updateSemesterResult: updateSemesterResultService,
  deleteSemesterResult: deleteSemesterResultService,

  getDocument: getDocumentService,
  uploadDocument: uploadDocumentService,
  updateDocument: updateDocumentService,
} = require("../services/studentProfile.service");

const getStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await getStudentProfileService(Number(userId));

    res.json(profile);
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const createStudentProfile = async (req, res) => {
  try {
   console.log(req.user);

const data = {
  ...req.body,
  userId: req.user.userId,
};

console.log(data);

const profile = await createStudentProfileService(data);
    res.status(201).json({
      message: "Student profile created successfully",
      profile,
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await updateStudentProfileService(
      Number(userId),
      req.body
    );

    res.json({
      message: "Student profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};

const createSemesterResult = async (req, res) => {
  try {
    const semesterResult = await createSemesterResultService(req.body);

    res.status(201).json({
      message: "Semester result created successfully",
      semesterResult,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getSemesterResults = async (req, res) => {
  try {
    const { userId } = req.params;

    const semesterResults = await getSemesterResultsService(Number(userId));

    res.json(semesterResults);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateSemesterResult = async (req, res) => {
  try {
    const { userId, semester } = req.params;

    const semesterResult = await updateSemesterResultService(
      Number(userId),
      Number(semester),
      req.body
    );

    res.json({
      message: "Semester result updated successfully",
      semesterResult,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }

};

const deleteSemesterResult = async (req, res) => {
  try {
    const { userId, semester } = req.params;

    await deleteSemesterResultService(
      Number(userId),
      Number(semester)
    );

    res.json({
      message: "Semester result deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getDocument = async (req, res) => {
  try {
    const { userId } = req.params;

    const document = await getDocumentService(Number(userId));

    res.json(document);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const data = {
      userId: req.user.userId,
      resumeUrl: req.body.resumeUrl,
    };

    const document = await uploadDocumentService(data);

    res.status(201).json({
      message: "Resume link saved successfully",
      document,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { userId } = req.params;

    const document = await updateDocumentService(
      Number(userId),
      {
        resumeUrl: req.body.resumeUrl,
      }
    );

    res.json({
      message: "Resume link updated successfully",
      document,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  getStudentProfile,
  createStudentProfile,
  updateStudentProfile,

  createSemesterResult,
  getSemesterResults,
  updateSemesterResult,
  deleteSemesterResult,

  getDocument,
  uploadDocument,
  updateDocument,
};