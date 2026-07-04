const {
  getStudentProfile: getStudentProfileService,
  createStudentProfile: createStudentProfileService,
  updateStudentProfile: updateStudentProfileService,

  getSemesterResults: getSemesterResultsService,
  createSemesterResult: createSemesterResultService,
  updateSemesterResult: updateSemesterResultService,

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
  const profile = await createStudentProfileService(req.body);

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
      userId: Number(req.body.userId),
      resumeUrl: req.file.path,
    };

    const document = await uploadDocumentService(data);

    res.status(201).json({
      message: "Resume uploaded successfully",
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
      req.body
    );

    res.json({
      message: "Document updated successfully",
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

  getDocument,
  uploadDocument,
  updateDocument,
};