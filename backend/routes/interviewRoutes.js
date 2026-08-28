const express = require("express");

const router = express.Router();

const interviewController =
    require("../controllers/interviewController");

const audioUpload =
    require("../middleware/audioUploadMiddleware");


// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const {
    isAuthenticated
} = require("../middleware/authMiddleware");


// ==========================================
// INTERVIEW SETUP PAGE
// ==========================================

router.get(
    "/setup/:resumeId",
    isAuthenticated,
    interviewController.showInterviewSetup
);


// ==========================================
// CREATE RESUME INTERVIEW
// ==========================================

router.post(
    "/setup/:resumeId",
    isAuthenticated,
    interviewController.selectQuestionCount
);


// ==========================================
// QUESTION GENERATION STATUS
// ==========================================

router.get(
    "/status/:interviewId",
    isAuthenticated,
    interviewController.getInterviewStatus
);


// ==========================================
// START / CONTINUE INTERVIEW
// ==========================================

router.get(
    "/start/:interviewId",
    isAuthenticated,
    interviewController.startInterview
);


// ==========================================
// TRANSCRIBE STUDENT AUDIO
// ==========================================

router.post(
    "/transcribe-audio",
    isAuthenticated,
    audioUpload.single("audio"),
    interviewController.transcribeAnswerAudio
);


// ==========================================
// SUBMIT ANSWER
// ==========================================

router.post(
    "/submit-answer",
    isAuthenticated,
    interviewController.submitAnswer
);


// ==========================================
// EVALUATION PROCESSING PAGE
// ==========================================

router.get(
    "/evaluate/:interviewId",
    isAuthenticated,
    interviewController.showEvaluationPage
);


// ==========================================
// CHECK / FINALIZE BACKGROUND EVALUATION
// ==========================================
//
// Important:
// This no longer sends all answers to Ollama.
// It checks how many background evaluations
// are completed and finalizes the average.
//
router.post(
    "/evaluate/:interviewId",
    isAuthenticated,
    interviewController.evaluateInterview
);


// ==========================================
// FINAL INTERVIEW RESULT
// ==========================================

router.get(
    "/result/:interviewId",
    isAuthenticated,
    interviewController.showInterviewResult
);


// ==========================================
// SUBJECT PRACTICE SETUP
// ==========================================

router.get(
    "/subject",
    isAuthenticated,
    interviewController.showSubjectSetup
);


// ==========================================
// START SUBJECT INTERVIEW
// ==========================================

router.post(
    "/subject/start",
    isAuthenticated,
    interviewController.startSubjectInterview
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;