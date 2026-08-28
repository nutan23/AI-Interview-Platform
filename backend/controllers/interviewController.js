const fs = require("fs");

const db = require("../config/db");

const {
    transcribeAudio
} = require("../services/whisperService");

const {
    generateInterviewQuestions
} = require("../services/questionGenerator");

const {
    parseQuestions
} = require("../services/questionParser");

const {
    generateSubjectQuestions
} = require("../services/subjectQuestionGenerator");

const {
    addEvaluationJob
} = require("../services/evaluationQueue");


// ==========================================
// HELPER: GET LOGGED IN USER ID
// ==========================================

function getLoggedInUserId(req) {

    if (
        req.session &&
        req.session.user &&
        req.session.user.id
    ) {

        return Number(
            req.session.user.id
        );

    }

    return null;
}


// ==========================================
// SHOW RESUME INTERVIEW SETUP
// ==========================================

function showInterviewSetup(req, res) {

    const resumeId =
        req.params.resumeId;

    return res.render(
        "interview/setup",
        {
            resumeId:
                resumeId,

            error:
                null,

            success:
                null
        }
    );
}


// ==========================================
// CREATE RESUME INTERVIEW
// ==========================================

async function selectQuestionCount(req, res) {

    try {

        const resumeId =
            req.params.resumeId;

        const questionCount =
            parseInt(
                req.body.questionCount
            );


        // ==========================================
        // VALIDATE QUESTION COUNT
        // ==========================================

        if (
            isNaN(questionCount)
        ) {

            return res.render(
                "interview/setup",
                {
                    resumeId:
                        resumeId,

                    error:
                        "Please enter a valid number.",

                    success:
                        null
                }
            );
        }


        if (
            questionCount < 3 ||
            questionCount > 30
        ) {

            return res.render(
                "interview/setup",
                {
                    resumeId:
                        resumeId,

                    error:
                        "Please enter a number between 3 and 30.",

                    success:
                        null
                }
            );
        }


        // ==========================================
        // GET RESUME
        // ==========================================

        const [rows] =
            await db.promise().query(

                `SELECT *
                 FROM resumes
                 WHERE id = ?`,

                [
                    resumeId
                ]
            );


        if (
            rows.length === 0
        ) {

            return res
                .status(404)
                .send(
                    "Resume not found."
                );
        }


        const resume =
            rows[0];


        // ==========================================
        // CHECK RESUME TEXT
        // ==========================================

        if (
            !resume.resume_text ||
            resume.resume_text.trim() === ""
        ) {

            return res
                .status(400)
                .send(
                    "Resume text is empty. Please upload the resume again."
                );
        }


        // ==========================================
        // SECURITY CHECK
        // ==========================================

        const userId =
            getLoggedInUserId(req);


        if (
            !userId
        ) {

            return res
                .status(401)
                .send(
                    "Please login again."
                );
        }


        if (
            Number(resume.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .send(
                    "You are not allowed to use this resume."
                );
        }


        // ==========================================
        // CREATE INTERVIEW
        // ==========================================

        const [result] =
            await db.promise().query(

                `INSERT INTO interviews
                (
                    user_id,
                    resume_id,
                    interview_type,
                    total_questions,
                    status,
                    progress
                )
                VALUES (?, ?, ?, ?, ?, ?)`,

                [
                    userId,
                    resume.id,
                    "resume",
                    questionCount,
                    "processing",
                    10
                ]
            );


        const interviewId =
            result.insertId;


        console.log(
            "=========================================="
        );

        console.log(
            "RESUME INTERVIEW PROCESSING STARTED"
        );

        console.log(
            "Interview ID:",
            interviewId
        );

        console.log(
            "Resume ID:",
            resume.id
        );

        console.log(
            "Question Count:",
            questionCount
        );

        console.log(
            "=========================================="
        );


        // ==========================================
        // SHOW PROCESSING PAGE
        // ==========================================

        res.render(
            "processing/interviewProcessing",
            {
                interviewId:
                    interviewId,

                resumeId:
                    resume.id
            }
        );


        // ==========================================
        // BACKGROUND QUESTION GENERATION
        // ==========================================

        processInterviewInBackground(
            interviewId,
            resume,
            questionCount
        );

    }

    catch (error) {

        console.error(
            "Create Interview Error:",
            error
        );


        if (
            !res.headersSent
        ) {

            return res
                .status(500)
                .send(
                    "Something went wrong while creating the interview."
                );
        }
    }
}


// ==========================================
// PROCESS RESUME INTERVIEW IN BACKGROUND
// ==========================================

async function processInterviewInBackground(
    interviewId,
    resume,
    questionCount
) {

    try {

        // ==========================================
        // STEP 1
        // ==========================================

        await updateProgress(
            interviewId,
            20,
            "analyzing"
        );

        await delay(500);


        // ==========================================
        // STEP 2
        // ==========================================

        await updateProgress(
            interviewId,
            40,
            "creating"
        );

        await delay(500);


        // ==========================================
        // STEP 3
        // GENERATE QUESTIONS
        // ==========================================

        await updateProgress(
            interviewId,
            50,
            "generating"
        );


        const aiResponse =
            await generateInterviewQuestions(
                resume.resume_text,
                questionCount
            );


        // ==========================================
        // STEP 4
        // PARSE QUESTIONS
        // ==========================================

        await updateProgress(
            interviewId,
            75,
            "parsing"
        );


        const questions =
            parseQuestions(
                aiResponse
            );


        if (
            questions.length <
            questionCount
        ) {

            throw new Error(
                `AI generated only ${questions.length} questions. Expected ${questionCount}.`
            );
        }


        // ==========================================
        // STEP 5
        // SAVE QUESTIONS
        // ==========================================

        await updateProgress(
            interviewId,
            85,
            "saving"
        );


        for (
            const item of
            questions.slice(
                0,
                questionCount
            )
        ) {

            let questionType =
                "technical";

            let difficulty =
                "medium";


            const questionLower =
                item.question
                    .toLowerCase();


            // ==========================================
            // QUESTION TYPE
            // ==========================================

            if (
                questionLower.includes(
                    "tell me about yourself"
                ) ||
                questionLower.includes(
                    "strength"
                ) ||
                questionLower.includes(
                    "weakness"
                ) ||
                questionLower.includes(
                    "career"
                ) ||
                questionLower.includes(
                    "where do you see yourself"
                ) ||
                questionLower.includes(
                    "why should"
                ) ||
                questionLower.includes(
                    "goal"
                )
            ) {

                questionType =
                    "behavioral";

            }

            else if (
                questionLower.includes(
                    "project"
                ) ||
                questionLower.includes(
                    "developed"
                ) ||
                questionLower.includes(
                    "implemented"
                ) ||
                questionLower.includes(
                    "application"
                )
            ) {

                questionType =
                    "project";
            }


            // ==========================================
            // DIFFICULTY
            // ==========================================

            if (
                questionLower.includes(
                    "what is"
                ) ||
                questionLower.includes(
                    "define"
                ) ||
                questionLower.includes(
                    "tell me about yourself"
                )
            ) {

                difficulty =
                    "easy";

            }

            else if (
                questionLower.includes(
                    "explain"
                ) ||
                questionLower.includes(
                    "difference"
                ) ||
                questionLower.includes(
                    "why"
                )
            ) {

                difficulty =
                    "medium";

            }

            else {

                difficulty =
                    "hard";
            }


            await db.promise().query(

                `INSERT INTO interview_questions
                (
                    interview_id,
                    question_number,
                    question,
                    question_type,
                    difficulty
                )
                VALUES (?, ?, ?, ?, ?)`,

                [
                    interviewId,
                    item.questionNumber,
                    item.question,
                    questionType,
                    difficulty
                ]
            );
        }


        // ==========================================
        // READY
        // ==========================================

        await updateProgress(
            interviewId,
            95,
            "saved"
        );


        await delay(500);


        await db.promise().query(

            `UPDATE interviews

             SET
                status = ?,
                progress = ?,
                error_message = NULL

             WHERE id = ?`,

            [
                "ready",
                100,
                interviewId
            ]
        );


        console.log(
            "Interview ready:",
            interviewId
        );

    }

    catch (error) {

        console.error(
            "BACKGROUND INTERVIEW ERROR:",
            error
        );


        try {

            await db.promise().query(

                `UPDATE interviews

                 SET
                    status = ?,
                    progress = ?,
                    error_message = ?

                 WHERE id = ?`,

                [
                    "error",
                    0,
                    error.message,
                    interviewId
                ]
            );

        }

        catch (dbError) {

            console.error(
                "Could not save interview error:",
                dbError
            );
        }
    }
}


// ==========================================
// UPDATE INTERVIEW PROGRESS
// ==========================================

async function updateProgress(
    interviewId,
    progress,
    status
) {

    await db.promise().query(

        `UPDATE interviews

         SET
            progress = ?,
            status = ?

         WHERE id = ?`,

        [
            progress,
            status,
            interviewId
        ]
    );
}


// ==========================================
// DELAY
// ==========================================

function delay(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


// ==========================================
// GET INTERVIEW STATUS
// ==========================================

async function getInterviewStatus(req, res) {

    try {

        const interviewId =
            req.params.interviewId;


        const [rows] =
            await db.promise().query(

                `SELECT
                    id,
                    user_id,
                    status,
                    progress,
                    error_message,
                    total_questions

                 FROM interviews

                 WHERE id = ?`,

                [
                    interviewId
                ]
            );


        if (
            rows.length === 0
        ) {

            return res
                .status(404)
                .json({
                    status:
                        "error",

                    message:
                        "Interview not found."
                });
        }


        const interview =
            rows[0];


        const userId =
            getLoggedInUserId(req);


        if (
            userId &&
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .json({
                    status:
                        "error",

                    message:
                        "Access denied."
                });
        }


        return res.json({

            status:
                interview.status,

            progress:
                interview.progress || 0,

            error:
                interview.error_message || null,

            totalQuestions:
                interview.total_questions
        });

    }

    catch (error) {

        console.error(
            "Get Interview Status Error:",
            error
        );


        return res
            .status(500)
            .json({
                status:
                    "error",

                message:
                    "Unable to get interview status."
            });
    }
}


// ==========================================
// START / CONTINUE INTERVIEW
// ==========================================

async function startInterview(req, res) {

    try {

        const interviewId =
            req.params.interviewId;


        let questionNumber =
            parseInt(
                req.query.question
            );


        if (
            isNaN(questionNumber) ||
            questionNumber < 1
        ) {

            questionNumber =
                1;
        }


        // ==========================================
        // GET INTERVIEW
        // ==========================================

        const [interviewRows] =
            await db.promise().query(

                `SELECT *
                 FROM interviews
                 WHERE id = ?`,

                [
                    interviewId
                ]
            );


        if (
            interviewRows.length === 0
        ) {

            return res
                .status(404)
                .send(
                    "Interview not found."
                );
        }


        const interview =
            interviewRows[0];


        // ==========================================
        // SECURITY
        // ==========================================

        const userId =
            getLoggedInUserId(req);


        if (
            !userId
        ) {

            return res
                .status(401)
                .send(
                    "Please login again."
                );
        }


        if (
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .send(
                    "You are not allowed to access this interview."
                );
        }


        // ==========================================
        // STATUS CHECK
        // ==========================================

        const allowedStatuses = [
            "ready",
            "answered"
        ];


        if (
            !allowedStatuses.includes(
                interview.status
            )
        ) {

            return res
                .status(400)
                .send(
                    "This interview is not ready yet."
                );
        }


        // ==========================================
        // QUESTION LIMIT
        // ==========================================

        if (
            questionNumber >
            interview.total_questions
        ) {

            return res
                .status(404)
                .send(
                    "Question number is outside the interview range."
                );
        }


        // ==========================================
        // GET QUESTION
        // ==========================================

        const [questionRows] =
            await db.promise().query(

                `SELECT *
                 FROM interview_questions

                 WHERE interview_id = ?
                 AND question_number = ?

                 LIMIT 1`,

                [
                    interviewId,
                    questionNumber
                ]
            );


        if (
            questionRows.length === 0
        ) {

            return res
                .status(404)
                .send(
                    "Question not found."
                );
        }


        const question =
            questionRows[0];


        // ==========================================
        // EXISTING ANSWER
        // ==========================================

        const [answerRows] =
            await db.promise().query(

                `SELECT answer_text

                 FROM interview_answers

                 WHERE interview_id = ?
                 AND question_id = ?

                 LIMIT 1`,

                [
                    interviewId,
                    question.id
                ]
            );


        let existingAnswer =
            "";


        if (
            answerRows.length > 0
        ) {

            existingAnswer =
                answerRows[0].answer_text ||
                "";
        }


        return res.render(

            "interview/start",

            {
                interview:
                    interview,

                interviewId:
                    interview.id,

                question:
                    question,

                totalQuestions:
                    interview.total_questions,

                existingAnswer:
                    existingAnswer
            }
        );

    }

    catch (error) {

        console.error(
            "Start Interview Error:",
            error
        );


        return res
            .status(500)
            .send(
                "Something went wrong while loading the interview."
            );
    }
}


// ==========================================
// TRANSCRIBE STUDENT AUDIO
// ==========================================

async function transcribeAnswerAudio(
    req,
    res
) {

    let audioPath =
        null;


    try {

        if (
            !req.file
        ) {

            return res
                .status(400)
                .json({
                    success:
                        false,

                    message:
                        "No audio file received."
                });
        }


        audioPath =
            req.file.path;


        const transcription =
            await transcribeAudio(
                audioPath
            );


        if (
            !transcription ||
            transcription.trim() === ""
        ) {

            return res
                .status(400)
                .json({
                    success:
                        false,

                    message:
                        "Whisper could not detect clear speech."
                });
        }


        return res.json({

            success:
                true,

            text:
                transcription.trim()
        });

    }

    catch (error) {

        console.error(
            "Audio transcription error:",
            error
        );


        return res
            .status(500)
            .json({
                success:
                    false,

                message:
                    "Unable to transcribe audio.",

                error:
                    error.message
            });

    }

    finally {

        if (
            audioPath &&
            fs.existsSync(
                audioPath
            )
        ) {

            try {

                fs.unlinkSync(
                    audioPath
                );

            }

            catch (deleteError) {

                console.error(
                    "Could not delete temporary audio:",
                    deleteError
                );
            }
        }
    }
}


// ==========================================
// SUBMIT ANSWER + BACKGROUND EVALUATION
// ==========================================

async function submitAnswer(req, res) {

    try {

        const {
            interviewId,
            questionId,
            answerText
        } = req.body;


        // ==========================================
        // BASIC VALIDATION
        // ==========================================

        if (
            !interviewId ||
            !questionId
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Interview ID or Question ID is missing."

                });

        }


        const cleanAnswer =
            String(
                answerText || ""
            )
                .replace(/\s+/g, " ")
                .trim();


        if (
            cleanAnswer === ""
        ) {

            return res
                .status(400)
                .json({

                    success: false,

                    message:
                        "Please provide an answer before continuing."

                });

        }


        // ==========================================
        // GET INTERVIEW
        // ==========================================

        const [interviewRows] =
            await db.promise().query(

                `SELECT *
                 FROM interviews
                 WHERE id = ?
                 LIMIT 1`,

                [
                    interviewId
                ]

            );


        if (
            interviewRows.length === 0
        ) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Interview not found."

                });

        }


        const interview =
            interviewRows[0];


        // ==========================================
        // SECURITY
        // ==========================================

        const userId =
            getLoggedInUserId(req);


        if (
            !userId ||
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "You are not allowed to access this interview."

                });

        }


        // ==========================================
        // GET QUESTION
        // ==========================================

        const [questionRows] =
            await db.promise().query(

                `SELECT *
                 FROM interview_questions

                 WHERE id = ?
                 AND interview_id = ?

                 LIMIT 1`,

                [
                    questionId,
                    interviewId
                ]

            );


        if (
            questionRows.length === 0
        ) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Interview question not found."

                });

        }


        const currentQuestion =
            questionRows[0];


        // ==========================================
        // CHECK EXISTING ANSWER
        // ==========================================

        const [existingAnswers] =
            await db.promise().query(

                `SELECT id

                 FROM interview_answers

                 WHERE interview_id = ?
                 AND question_id = ?

                 LIMIT 1`,

                [
                    interviewId,
                    questionId
                ]

            );


        let answerId;


        // ==========================================
        // UPDATE EXISTING ANSWER
        // ==========================================

        if (
            existingAnswers.length > 0
        ) {

            answerId =
                existingAnswers[0].id;


            await db.promise().query(

                `UPDATE interview_answers

                 SET
                    answer_text = ?,
                    evaluation_status = ?,
                    score = NULL,
                    relevance_score = NULL,
                    technical_score = NULL,
                    completeness_score = NULL,
                    clarity_score = NULL,
                    overall_score = NULL,
                    feedback = NULL,
                    mistakes = NULL,
                    suggestions = NULL

                 WHERE id = ?`,

                [
                    cleanAnswer,
                    "pending",
                    answerId
                ]

            );

        }


        // ==========================================
        // INSERT NEW ANSWER
        // ==========================================

        else {

            const [insertResult] =
                await db.promise().query(

                    `INSERT INTO interview_answers
                    (
                        interview_id,
                        question_id,
                        answer_text,
                        evaluation_status
                    )

                    VALUES (?, ?, ?, ?)`,

                    [
                        interviewId,
                        questionId,
                        cleanAnswer,
                        "pending"
                    ]

                );


            answerId =
                insertResult.insertId;

        }


        // ==========================================
        // ADD EVALUATION TO BACKGROUND QUEUE
        // ==========================================

        addEvaluationJob({

            interviewId:
                Number(interviewId),

            answerId:
                Number(answerId),

            questionId:
                Number(questionId),

            questionNumber:
                Number(
                    currentQuestion.question_number
                ),

            question:
                currentQuestion.question,

            answerText:
                cleanAnswer

        });


        console.log(
            "Answer saved and background evaluation queued."
        );


        console.log(
            "Question:",
            currentQuestion.question_number
        );


        // ==========================================
        // FIND NEXT QUESTION
        // ==========================================

        const [nextQuestionRows] =
            await db.promise().query(

                `SELECT *

                 FROM interview_questions

                 WHERE interview_id = ?
                 AND question_number > ?

                 ORDER BY question_number ASC

                 LIMIT 1`,

                [
                    interviewId,
                    currentQuestion.question_number
                ]

            );


        // ==========================================
        // NEXT QUESTION EXISTS
        // ==========================================

        if (
            nextQuestionRows.length > 0
        ) {

            const nextQuestion =
                nextQuestionRows[0];


            return res.json({

                success: true,

                completed: false,

                message:
                    "Answer saved successfully.",

                nextQuestionNumber:
                    nextQuestion.question_number,

                redirectUrl:
                    `/interview/start/${interviewId}?question=${nextQuestion.question_number}`

            });

        }


        // ==========================================
        // LAST QUESTION
        // ==========================================

        await db.promise().query(

            `UPDATE interviews

             SET
                status = ?,
                evaluation_progress = ?

             WHERE id = ?`,

            [
                "answered",
                0,
                interviewId
            ]

        );


        return res.json({

            success: true,

            completed: true,

            message:
                "All questions have been answered.",

            interviewId:
                interviewId

        });

    }

    catch (error) {

        console.error(
            "Submit Answer Error:",
            error
        );


        return res
            .status(500)
            .json({

                success: false,

                message:
                    "Something went wrong while saving your answer."

            });

    }

}


// ==========================================
// SHOW EVALUATION PAGE
// ==========================================

async function showEvaluationPage(
    req,
    res
) {

    try {

        const interviewId =
            req.params.interviewId;


        const [rows] =
            await db.promise().query(

                `SELECT *
                 FROM interviews
                 WHERE id = ?`,

                [
                    interviewId
                ]
            );


        if (
            rows.length === 0
        ) {

            return res
                .status(404)
                .send(
                    "Interview not found."
                );
        }


        const interview =
            rows[0];


        const userId =
            getLoggedInUserId(req);


        if (
            !userId ||
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .send(
                    "You are not allowed to access this interview."
                );
        }


        return res.render(

            "processing/evaluationProcessing",

            {
                interviewId:
                    interviewId,

                totalQuestions:
                    interview.total_questions
            }
        );

    }

    catch (error) {

        console.error(
            "Evaluation Page Error:",
            error
        );


        return res
            .status(500)
            .send(
                "Unable to open evaluation page."
            );
    }
}


// ==========================================
// CHECK BACKGROUND EVALUATION + FINALIZE
// ==========================================

async function evaluateInterview(req, res) {

    try {

        const interviewId =
            req.params.interviewId;


        // ==========================================
        // GET INTERVIEW
        // ==========================================

        const [interviewRows] =
            await db.promise().query(

                `SELECT *
                 FROM interviews
                 WHERE id = ?
                 LIMIT 1`,

                [
                    interviewId
                ]

            );


        if (
            interviewRows.length === 0
        ) {

            return res
                .status(404)
                .json({

                    success: false,

                    message:
                        "Interview not found."

                });

        }


        const interview =
            interviewRows[0];


        // ==========================================
        // SECURITY
        // ==========================================

        const userId =
            getLoggedInUserId(req);


        if (
            !userId ||
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .json({

                    success: false,

                    message:
                        "Access denied."

                });

        }


        // ==========================================
        // ALREADY EVALUATED
        // ==========================================

        if (
            interview.status ===
            "evaluated"
        ) {

            return res.json({

                success: true,

                completed: true,

                progress: 100,

                evaluated:
                    Number(
                        interview.total_questions || 0
                    ),

                total:
                    Number(
                        interview.total_questions || 0
                    ),

                redirectUrl:
                    `/interview/result/${interviewId}`

            });

        }


        // ==========================================
        // COUNT ANSWERS
        // ==========================================

        const [countRows] =
            await db.promise().query(

                `SELECT

                    COUNT(*) AS total_answers,

                    SUM(
                        CASE
                            WHEN evaluation_status = 'completed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS completed_answers,

                    SUM(
                        CASE
                            WHEN evaluation_status = 'pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS pending_answers,

                    SUM(
                        CASE
                            WHEN evaluation_status = 'evaluating'
                            THEN 1
                            ELSE 0
                        END
                    ) AS evaluating_answers,

                    SUM(
                        CASE
                            WHEN evaluation_status = 'error'
                            THEN 1
                            ELSE 0
                        END
                    ) AS error_answers

                 FROM interview_answers

                 WHERE interview_id = ?`,

                [
                    interviewId
                ]

            );


        const expectedAnswers =
            Number(
                interview.total_questions || 0
            );


        const totalAnswers =
            Number(
                countRows[0].total_answers || 0
            );


        const completedAnswers =
            Number(
                countRows[0].completed_answers || 0
            );


        const errorAnswers =
            Number(
                countRows[0].error_answers || 0
            );


        // ==========================================
        // NOT ALL ANSWERS SUBMITTED
        // ==========================================

        if (
            totalAnswers <
            expectedAnswers
        ) {

            return res.json({

                success: true,

                completed: false,

                progress: 0,

                evaluated:
                    completedAnswers,

                total:
                    expectedAnswers,

                message:
                    "Waiting for all answers."

            });

        }


        // ==========================================
        // BACKGROUND EVALUATION ERROR
        // ==========================================

        if (
            errorAnswers > 0
        ) {

            return res
                .status(500)
                .json({

                    success: false,

                    completed: false,

                    message:
                        `${errorAnswers} answer evaluation(s) failed.`

                });

        }


        // ==========================================
        // REAL PROGRESS
        // ==========================================

        let progress =
            0;


        if (
            expectedAnswers > 0
        ) {

            progress =
                Math.round(
                    (
                        completedAnswers /
                        expectedAnswers
                    )
                    * 100
                );

        }


        // Keep 100 only for fully finalized result
        if (
            completedAnswers <
            expectedAnswers &&
            progress >= 100
        ) {

            progress =
                99;

        }


        // ==========================================
        // SAVE CURRENT STATUS
        // ==========================================

        await db.promise().query(

            `UPDATE interviews

             SET
                status = ?,
                evaluation_progress = ?

             WHERE id = ?`,

            [
                "evaluating",
                progress,
                interviewId
            ]

        );


        // ==========================================
        // STILL WAITING FOR BACKGROUND QUEUE
        // ==========================================

        if (
            completedAnswers <
            expectedAnswers
        ) {

            return res.json({

                success: true,

                completed: false,

                progress:
                    progress,

                evaluated:
                    completedAnswers,

                total:
                    expectedAnswers,

                message:
                    `Evaluated ${completedAnswers} of ${expectedAnswers} answers.`

            });

        }


        // ==========================================
        // ALL ANSWERS EVALUATED
        // CALCULATE FINAL AVERAGES
        // ==========================================

        const [averageRows] =
            await db.promise().query(

                `SELECT

                    AVG(overall_score)
                        AS overall_score,

                    AVG(relevance_score)
                        AS relevance_average,

                    AVG(technical_score)
                        AS technical_average,

                    AVG(completeness_score)
                        AS completeness_average,

                    AVG(clarity_score)
                        AS clarity_average

                 FROM interview_answers

                 WHERE interview_id = ?
                 AND evaluation_status = 'completed'`,

                [
                    interviewId
                ]

            );


        const overallScore =
            Math.round(
                Number(
                    averageRows[0].overall_score || 0
                ) * 10
            ) / 10;


        const relevanceAverage =
            Math.round(
                Number(
                    averageRows[0].relevance_average || 0
                ) * 10
            ) / 10;


        const technicalAverage =
            Math.round(
                Number(
                    averageRows[0].technical_average || 0
                ) * 10
            ) / 10;


        const completenessAverage =
            Math.round(
                Number(
                    averageRows[0].completeness_average || 0
                ) * 10
            ) / 10;


        const clarityAverage =
            Math.round(
                Number(
                    averageRows[0].clarity_average || 0
                ) * 10
            ) / 10;


        // ==========================================
        // FINAL FEEDBACK
        // NO EXTRA OLLAMA CALL
        // ==========================================

        let finalFeedback;


        if (
            overallScore >= 9
        ) {

            finalFeedback =
                "Excellent interview performance with strong and well-structured answers.";

        }

        else if (
            overallScore >= 8
        ) {

            finalFeedback =
                "Very good interview performance with minor areas for improvement.";

        }

        else if (
            overallScore >= 7
        ) {

            finalFeedback =
                "Good interview performance with some areas requiring improvement.";

        }

        else if (
            overallScore >= 6
        ) {

            finalFeedback =
                "Satisfactory performance, but several answers can be improved.";

        }

        else {

            finalFeedback =
                "More interview preparation and concept revision are recommended.";

        }


        // ==========================================
        // FIND STRONGEST + WEAKEST AREA
        // ==========================================

        const areas = [

            {
                name:
                    "Answer relevance",

                score:
                    relevanceAverage
            },

            {
                name:
                    "Technical understanding",

                score:
                    technicalAverage
            },

            {
                name:
                    "Answer completeness",

                score:
                    completenessAverage
            },

            {
                name:
                    "Communication clarity",

                score:
                    clarityAverage
            }

        ];


        const strongestArea =
            areas.reduce(
                (best, current) =>

                    current.score >
                    best.score
                        ? current
                        : best
            );


        const weakestArea =
            areas.reduce(
                (worst, current) =>

                    current.score <
                    worst.score
                        ? current
                        : worst
            );


        const strengths =
            `${strongestArea.name} was your strongest area (${strongestArea.score}/10).`;


        const weaknesses =
            `${weakestArea.name} needs the most improvement (${weakestArea.score}/10).`;


        const overallSuggestions =
            `Focus on improving ${weakestArea.name.toLowerCase()} while continuing regular interview practice.`;


        // ==========================================
        // SAVE FINAL INTERVIEW RESULT
        // ==========================================

        await db.promise().query(

            `UPDATE interviews

             SET
                overall_score = ?,
                final_feedback = ?,
                strengths = ?,
                weaknesses = ?,
                overall_suggestions = ?,
                evaluation_progress = ?,
                status = ?

             WHERE id = ?`,

            [
                overallScore,
                finalFeedback,
                strengths,
                weaknesses,
                overallSuggestions,
                100,
                "evaluated",
                interviewId
            ]

        );


        console.log(
            "=========================================="
        );


        console.log(
            "BACKGROUND INTERVIEW FINALIZED"
        );


        console.log(
            "Interview ID:",
            interviewId
        );


        console.log(
            "Overall Score:",
            overallScore
        );


        console.log(
            "=========================================="
        );


        return res.json({

            success: true,

            completed: true,

            progress: 100,

            evaluated:
                completedAnswers,

            total:
                expectedAnswers,

            overallScore:
                overallScore,

            redirectUrl:
                `/interview/result/${interviewId}`

        });

    }

    catch (error) {

        console.error(
            "Evaluation Finalization Error:",
            error
        );


        return res
            .status(500)
            .json({

                success: false,

                completed: false,

                message:
                    error.message ||
                    "Unable to finalize interview evaluation."

            });

    }

}


// ==========================================
// SHOW FINAL RESULT
// ==========================================

async function showInterviewResult(
    req,
    res
) {

    try {

        const interviewId =
            req.params.interviewId;


        const [interviewRows] =
            await db.promise().query(

                `SELECT
                    id,
                    user_id,
                    resume_id,
                    interview_type,
                    total_questions,
                    status,
                    subject,
                    difficulty,
                    topic,
                    overall_score,
                    final_feedback,
                    strengths,
                    weaknesses,
                    overall_suggestions

                 FROM interviews

                 WHERE id = ?

                 LIMIT 1`,

                [
                    interviewId
                ]
            );


        if (
            interviewRows.length === 0
        ) {

            return res
                .status(404)
                .send(
                    "Interview not found."
                );
        }


        const interview =
            interviewRows[0];


        const userId =
            getLoggedInUserId(req);


        if (
            !userId ||
            Number(interview.user_id) !==
            Number(userId)
        ) {

            return res
                .status(403)
                .send(
                    "You are not allowed to view this interview."
                );
        }


        if (
            interview.status !==
            "evaluated"
        ) {

            return res.redirect(
                `/interview/evaluate/${interviewId}`
            );
        }


        const [questions] =
            await db.promise().query(

                `SELECT
                    iq.id AS question_id,
                    iq.question_number,
                    iq.question,
                    iq.question_type,
                    iq.difficulty,

                    ia.id AS answer_id,
                    ia.answer_text,
                    ia.relevance_score,
                    ia.technical_score,
                    ia.completeness_score,
                    ia.clarity_score,
                    ia.overall_score,
                    ia.feedback,
                    ia.mistakes,
                    ia.suggestions

                 FROM interview_questions iq

                 LEFT JOIN interview_answers ia
                 ON ia.question_id = iq.id

                 WHERE iq.interview_id = ?

                 ORDER BY
                    iq.question_number ASC`,

                [
                    interviewId
                ]
            );


        const overallScore =
            Number(
                interview.overall_score ||
                0
            );


        let performanceLabel;


        if (
            overallScore >= 9
        ) {

            performanceLabel =
                "Excellent";

        }

        else if (
            overallScore >= 8
        ) {

            performanceLabel =
                "Very Good";

        }

        else if (
            overallScore >= 7
        ) {

            performanceLabel =
                "Good";

        }

        else if (
            overallScore >= 6
        ) {

            performanceLabel =
                "Satisfactory";

        }

        else {

            performanceLabel =
                "Needs Improvement";
        }


        return res.render(

            "interview/result",

            {
                interview:
                    interview,

                questions:
                    questions,

                overallScore:
                    overallScore,

                performanceLabel:
                    performanceLabel
            }
        );

    }

    catch (error) {

        console.error(
            "Show Interview Result Error:",
            error
        );


        return res
            .status(500)
            .send(
                "Unable to load interview result."
            );
    }
}


// ==========================================
// SHOW SUBJECT PRACTICE SETUP
// ==========================================

function showSubjectSetup(
    req,
    res
) {

    return res.render(

        "subject/setup",

        {
            error:
                null
        }
    );
}


// ==========================================
// CREATE SUBJECT PRACTICE INTERVIEW
// ==========================================

async function startSubjectInterview(
    req,
    res
) {

    try {

        const {
            subject,
            difficulty,
            topic,
            questionCount
        } = req.body;


        const totalQuestions =
            parseInt(
                questionCount
            );


        const cleanTopic =
            String(
                topic || ""
            ).trim();


        // ==========================================
        // VALIDATION
        // ==========================================

        if (
            !subject
        ) {

            return res.render(
                "subject/setup",
                {
                    error:
                        "Please select a subject."
                }
            );
        }


        if (
            !difficulty
        ) {

            return res.render(
                "subject/setup",
                {
                    error:
                        "Please select a difficulty level."
                }
            );
        }


        if (
           isNaN(totalQuestions) ||
           totalQuestions < 1 ||
           totalQuestions > 30
        ) {

           return res.status(400).json({

              success: false,

               message:
                  "Question count must be between 1 and 30."

            });
        }


        // ==========================================
        // GET USER ID
        // ==========================================

        const userId =
            getLoggedInUserId(req);


        console.log(
            "Subject Practice User ID:",
            userId
        );


        if (
            !userId
        ) {

            return res
                .status(401)
                .send(
                    "Please login again."
                );
        }


        // ==========================================
        // CREATE INTERVIEW
        // ==========================================

        const [result] =
            await db.promise().query(

                `INSERT INTO interviews
                (
                    user_id,
                    resume_id,
                    interview_type,
                    total_questions,
                    status,
                    progress,
                    subject,
                    difficulty,
                    topic
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                [
                    userId,
                    null,
                    "subject",
                    totalQuestions,
                    "processing",
                    20,
                    subject,
                    difficulty,
                    cleanTopic || null
                ]
            );


        const interviewId =
            result.insertId;


        console.log(
            "=========================================="
        );

        console.log(
            "SUBJECT INTERVIEW CREATED"
        );

        console.log(
            "Interview ID:",
            interviewId
        );

        console.log(
            "User ID:",
            userId
        );

        console.log(
            "Subject:",
            subject
        );

        console.log(
            "Difficulty:",
            difficulty
        );

        console.log(
            "Topic:",
            cleanTopic ||
            "General"
        );

        console.log(
            "Questions:",
            totalQuestions
        );

        console.log(
            "=========================================="
        );


        // ==========================================
        // GENERATE QUESTIONS
        // ==========================================

        const aiResponse =
            await generateSubjectQuestions(

                subject,

                difficulty,

                cleanTopic,

                totalQuestions
            );


        // ==========================================
        // PARSE QUESTIONS
        // ==========================================

        const questions =
            parseQuestions(
                aiResponse
            );


        if (
            questions.length <
            totalQuestions
        ) {

            throw new Error(
                `AI generated only ${questions.length} questions.`
            );
        }


        // ==========================================
        // SAVE QUESTIONS
        // ==========================================

        for (
            const item of
            questions.slice(
                0,
                totalQuestions
            )
        ) {

            await db.promise().query(

                `INSERT INTO interview_questions
                (
                    interview_id,
                    question_number,
                    question,
                    question_type,
                    difficulty
                )
                VALUES (?, ?, ?, ?, ?)`,

                [
                    interviewId,
                    item.questionNumber,
                    item.question,
                    "technical",
                    difficulty
                ]
            );
        }


        // ==========================================
        // MARK READY
        // ==========================================

        await db.promise().query(

            `UPDATE interviews

             SET
                status = ?,
                progress = ?,
                error_message = NULL

             WHERE id = ?`,

            [
                "ready",
                100,
                interviewId
            ]
        );


        console.log(
            "Subject interview ready."
        );


        // ==========================================
        // START SAME INTERVIEW PAGE
        // ==========================================

        return res.json({

            success: true,

            interviewId: interviewId,

            redirectUrl:
               `/interview/start/${interviewId}`

        });

    }

    catch (error) {

        console.error(
            "Start Subject Interview Error:",
            error
        );


        return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Unable to create subject interview."

        });
    }
}


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {

    showInterviewSetup,

    selectQuestionCount,

    getInterviewStatus,

    startInterview,

    transcribeAnswerAudio,

    submitAnswer,

    showEvaluationPage,

    evaluateInterview,

    showInterviewResult,

    showSubjectSetup,

    startSubjectInterview

};