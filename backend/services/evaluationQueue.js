const db =
    require("../config/db");


const {
    evaluateSingleAnswer
} = require(
    "./answerEvaluator"
);


// ==========================================
// IN-MEMORY QUEUE
// ==========================================

const evaluationQueue =
    [];


let isProcessing =
    false;


// ==========================================
// ADD JOB TO QUEUE
// ==========================================

function addEvaluationJob(
    job
) {

    evaluationQueue.push(
        job
    );


    console.log(
        "=========================================="
    );


    console.log(
        "ANSWER ADDED TO EVALUATION QUEUE"
    );


    console.log(
        "Interview ID:",
        job.interviewId
    );


    console.log(
        "Answer ID:",
        job.answerId
    );


    console.log(
        "Question:",
        job.questionNumber
    );


    console.log(
        "Queue Length:",
        evaluationQueue.length
    );


    console.log(
        "=========================================="
    );


    // IMPORTANT:
    // Do NOT await this.
    // User should immediately move to next question.

    processQueue()
        .catch(
            error => {

                console.error(
                    "Evaluation Queue Error:",
                    error
                );

            }
        );

}


// ==========================================
// PROCESS QUEUE
// ==========================================

async function processQueue() {

    // ==========================================
    // PREVENT MULTIPLE QUEUE WORKERS
    // ==========================================

    if (
        isProcessing
    ) {

        return;

    }


    isProcessing =
        true;


    try {

        // ==========================================
        // PROCESS UNTIL QUEUE EMPTY
        // ==========================================

        while (
            evaluationQueue.length > 0
        ) {

            const job =
                evaluationQueue.shift();


            await processEvaluationJob(
                job
            );

        }

    }

    finally {

        isProcessing =
            false;

    }

}


// ==========================================
// PROCESS SINGLE JOB
// ==========================================

async function processEvaluationJob(
    job
) {

    const {

        interviewId,

        answerId,

        questionId,

        questionNumber,

        question,

        answerText

    } = job;


    try {

        console.log(
            "=========================================="
        );


        console.log(
            "BACKGROUND EVALUATION STARTED"
        );


        console.log(
            "Interview:",
            interviewId
        );


        console.log(
            "Question:",
            questionNumber
        );


        console.log(
            "=========================================="
        );


        // ==========================================
        // MARK EVALUATING
        // ==========================================

        await db
            .promise()
            .query(

                `UPDATE interview_answers

                 SET evaluation_status = ?

                 WHERE id = ?
                 AND interview_id = ?
                 AND question_id = ?`,

                [

                    "evaluating",

                    answerId,

                    interviewId,

                    questionId

                ]

            );


        // ==========================================
        // OLLAMA EVALUATION
        // ==========================================

        const result =
            await evaluateSingleAnswer(

                question,

                answerText,

                questionNumber

            );


        // ==========================================
        // SAVE RESULT
        // ==========================================

        await db
            .promise()
            .query(

                `UPDATE interview_answers

                 SET

                    score = ?,

                    relevance_score = ?,

                    technical_score = ?,

                    completeness_score = ?,

                    clarity_score = ?,

                    overall_score = ?,

                    feedback = ?,

                    mistakes = ?,

                    suggestions = ?,

                    evaluation_status = ?

                 WHERE id = ?
                 AND interview_id = ?
                 AND question_id = ?`,

                [

                    result.overall_score,

                    result.relevance_score,

                    result.technical_score,

                    result.completeness_score,

                    result.clarity_score,

                    result.overall_score,

                    result.feedback,

                    result.mistakes,

                    result.suggestions,

                    "completed",

                    answerId,

                    interviewId,

                    questionId

                ]

            );


        console.log(
            "=========================================="
        );


        console.log(
            "BACKGROUND EVALUATION COMPLETE"
        );


        console.log(
            "Question:",
            questionNumber
        );


        console.log(
            "Score:",
            result.overall_score
        );


        console.log(
            "=========================================="
        );

    }

    catch (error) {

        console.error(
            "=========================================="
        );


        console.error(
            "BACKGROUND EVALUATION FAILED"
        );


        console.error(
            "Interview:",
            interviewId
        );


        console.error(
            "Question:",
            questionNumber
        );


        console.error(
            error
        );


        console.error(
            "=========================================="
        );


        // ==========================================
        // MARK ERROR
        // ==========================================

        try {

            await db
                .promise()
                .query(

                    `UPDATE interview_answers

                     SET evaluation_status = ?

                     WHERE id = ?
                     AND interview_id = ?
                     AND question_id = ?`,

                    [

                        "error",

                        answerId,

                        interviewId,

                        questionId

                    ]

                );

        }

        catch (databaseError) {

            console.error(
                "Unable to save evaluation error status:",
                databaseError
            );

        }

    }

}


// ==========================================
// GET QUEUE INFO
// ==========================================

function getQueueInfo() {

    return {

        waiting:
            evaluationQueue.length,

        processing:
            isProcessing

    };

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    addEvaluationJob,

    getQueueInfo

};