const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Project uploads directory
const uploadDirectory = path.join(__dirname, "../../uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// File storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const uniqueName =
            "resume_" +
            Date.now() +
            "_" +
            Math.round(Math.random() * 100000) +
            extension;

        cb(null, uniqueName);
    }
});

// Only allow PDF and DOCX
const fileFilter = (req, file, cb) => {

    const allowedExtensions = [".pdf", ".docx"];

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only PDF and DOCX resume files are allowed."),
            false
        );
    }
};

// Multer configuration
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: fileFilter
});

module.exports = upload;