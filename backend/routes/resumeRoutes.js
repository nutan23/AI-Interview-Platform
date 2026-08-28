const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const resumeController = require("../controllers/resumeController");

const { isAuthenticated } = require("../middleware/authMiddleware");


// ==========================================
// RESUME UPLOAD PAGE
// ==========================================

router.get(
    "/upload",
    isAuthenticated,
    (req, res) => {

        res.render("resume/upload", {
            error: req.query.error || null
        });

    }
);


// ==========================================
// UPLOAD RESUME
// ==========================================

router.post(
    "/upload",
    isAuthenticated,
    upload.single("resume"),
    resumeController.uploadResume
);


// ==========================================
// RESUME ANALYSIS
// ==========================================

router.get(
    "/analysis/:id",
    isAuthenticated,
    resumeController.showResumeAnalysis
);


module.exports = router;