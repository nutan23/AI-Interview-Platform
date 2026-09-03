const path = require("path");
const fs = require("fs");

const db = require("../config/db");

const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");


// ==========================================
// NLP SERVICE
// ==========================================

const {
    analyzeResumeText
} = require("../services/nlpService");


// ==========================================
// EXTRACT TEXT FROM PDF
// ==========================================

async function extractPdfText(filePath) {

    const parser = new PDFParse({
        url: filePath
    });


    try {

        const result =
            await parser.getText();


        return result.text;

    }

    finally {

        await parser.destroy();

    }

}


// ==========================================
// EXTRACT TEXT FROM DOCX
// ==========================================

async function extractDocxText(filePath) {

    const result =
        await mammoth.extractRawText({
            path: filePath
        });


    return result.value;

}


// ==========================================
// UPLOAD RESUME
// ==========================================

exports.uploadResume = async (req, res) => {

    try {

        // ==========================================
        // CHECK FILE
        // ==========================================

        if (!req.file) {

            return res.redirect(
                "/resume/upload?error=Please select a PDF or DOCX resume"
            );

        }


        const filePath =
            req.file.path;


        const extension =
            path
                .extname(
                    req.file.originalname
                )
                .toLowerCase();


        let resumeText = "";


        // ==========================================
        // PDF
        // ==========================================

        if (
            extension === ".pdf"
        ) {

            resumeText =
                await extractPdfText(
                    filePath
                );

        }


        // ==========================================
        // DOCX
        // ==========================================

        else if (
            extension === ".docx"
        ) {

            resumeText =
                await extractDocxText(
                    filePath
                );

        }


        // ==========================================
        // UNSUPPORTED FILE
        // ==========================================

        else {

            if (
                fs.existsSync(
                    filePath
                )
            ) {

                fs.unlinkSync(
                    filePath
                );

            }


            return res.redirect(
                "/resume/upload?error=Unsupported file type"
            );

        }


        // ==========================================
        // CLEAN EXTRACTED TEXT
        // ==========================================

        resumeText =
            String(
                resumeText || ""
            )
                .replace(/\r/g, "")
                .replace(/\n{3,}/g, "\n\n")
                .trim();


        // ==========================================
        // CHECK EXTRACTED TEXT
        // ==========================================

        if (
            !resumeText
        ) {

            if (
                fs.existsSync(
                    filePath
                )
            ) {

                fs.unlinkSync(
                    filePath
                );

            }


            return res.redirect(
                "/resume/upload?error=Could not extract text from resume"
            );

        }


        // ==========================================
        // NLP ANALYSIS
        // ==========================================
        //
        // IMPORTANT:
        // We DO NOT replace resumeText.
        //
        // Original extracted text remains unchanged
        // and continues to be used by Groq.
        //
        // NLP is only additional processing.
        // ==========================================

        let nlpAnalysis =
            null;


        try {

            nlpAnalysis =
                analyzeResumeText(
                    resumeText
                );


            console.log(
                "=========================================="
            );

            console.log(
                "NLP RESUME ANALYSIS"
            );

            console.log(
                "Total Tokens:",
                nlpAnalysis.totalTokens
            );

            console.log(
                "Skills Found:",
                nlpAnalysis.skills
            );

            console.log(
                "Top Keywords:",
                nlpAnalysis.keywords
            );

            console.log(
                "=========================================="
            );

        }

        catch (nlpError) {

            // ==========================================
            // NLP FAILURE MUST NOT BREAK RESUME UPLOAD
            // ==========================================

            console.error(
                "NLP analysis error:",
                nlpError.message
            );

        }


        // ==========================================
        // GET USER ID
        // ==========================================

        if (
            !req.session ||
            !req.session.user
        ) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        // ==========================================
        // SAVE ORIGINAL RESUME TEXT IN DATABASE
        // ==========================================

        const sql = `

            INSERT INTO resumes
            (
                user_id,
                file_name,
                file_path,
                file_type,
                resume_text
            )

            VALUES (?, ?, ?, ?, ?)

        `;


        db.query(
            sql,
            [
                userId,
                req.file.originalname,
                req.file.path,
                extension,
                resumeText
            ],
            (
                err,
                result
            ) => {

                if (
                    err
                ) {

                    console.error(
                        "Resume database error:",
                        err
                    );


                    // Delete uploaded file if DB fails
                    if (
                        fs.existsSync(
                            filePath
                        )
                    ) {

                        fs.unlinkSync(
                            filePath
                        );

                    }


                    return res.redirect(
                        "/resume/upload?error=Could not save resume"
                    );

                }


                console.log(
                    "Resume saved with ID:",
                    result.insertId
                );


                // ==========================================
                // REDIRECT TO ANALYSIS PAGE
                // ==========================================

                return res.redirect(
                    `/resume/analysis/${result.insertId}`
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Resume upload error:",
            error
        );


        // ==========================================
        // DELETE FILE IF PROCESSING FAILS
        // ==========================================

        if (
            req.file &&
            fs.existsSync(
                req.file.path
            )
        ) {

            fs.unlinkSync(
                req.file.path
            );

        }


        return res.redirect(
            "/resume/upload?error=Failed to process resume"
        );

    }

};



// ==========================================
// SHOW RESUME ANALYSIS
// ==========================================

exports.showResumeAnalysis = (
    req,
    res
) => {

    const resumeId =
        req.params.id;


    // ==========================================
    // CHECK SESSION
    // ==========================================

    if (
        !req.session ||
        !req.session.user
    ) {

        return res.redirect(
            "/login"
        );

    }


    const userId =
        req.session.user.id;


    // ==========================================
    // FETCH RESUME
    // ==========================================

    const sql = `

        SELECT

            id,
            user_id,
            file_name,
            file_type,
            resume_text,
            created_at

        FROM resumes

        WHERE id = ?
        AND user_id = ?

    `;


    db.query(
        sql,
        [
            resumeId,
            userId
        ],
        (
            err,
            results
        ) => {

            if (
                err
            ) {

                console.error(
                    "Resume fetch error:",
                    err
                );


                return res
                    .status(500)
                    .send(
                        "Unable to load resume"
                    );

            }


            // ==========================================
            // RESUME NOT FOUND
            // ==========================================

            if (
                results.length === 0
            ) {

                return res
                    .status(404)
                    .send(
                        "Resume not found"
                    );

            }


            const resume =
                results[0];


            // ==========================================
            // NLP ANALYSIS
            // ==========================================
            //
            // Recalculate NLP analysis from stored
            // resume_text.
            //
            // This means no extra DB columns are needed.
            // ==========================================

            let nlpAnalysis = {

                totalTokens:
                    0,

                filteredTokens:
                    [],

                keywords:
                    [],

                skills:
                    []

            };


            try {

                nlpAnalysis =
                    analyzeResumeText(
                        resume.resume_text
                    );


                console.log(
                    "Resume NLP analysis loaded."
                );


                console.log(
                    "Detected Skills:",
                    nlpAnalysis.skills
                );

            }

            catch (nlpError) {

                console.error(
                    "Resume NLP analysis error:",
                    nlpError.message
                );

            }


            // ==========================================
            // RENDER ANALYSIS PAGE
            // ==========================================

            return res.render(
                "resume/analysis",
                {

                    // Existing variable
                    resume:
                        resume,


                    // New NLP variable
                    nlpAnalysis:
                        nlpAnalysis

                }
            );

        }
    );

};