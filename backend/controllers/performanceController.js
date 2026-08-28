const db =
    require("../config/db");


// ==========================================
// SHOW USER PERFORMANCE
// ==========================================

exports.showPerformance =
async function (
    req,
    res
) {

    try {

        // ==========================================
        // LOGIN CHECK
        // ==========================================

        if (
            !req.session ||
            !req.session.user ||
            !req.session.user.id
        ) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            Number(
                req.session.user.id
            );


        // ==========================================
        // GET COMPLETED INTERVIEWS
        // ==========================================

        const [interviews] =
            await db
                .promise()
                .query(

                    `SELECT

                        id,

                        interview_type,

                        subject,

                        difficulty,

                        topic,

                        total_questions,

                        overall_score,

                        final_feedback,

                        strengths,

                        weaknesses,

                        overall_suggestions,

                        status

                     FROM interviews

                     WHERE user_id = ?

                     AND status = 'evaluated'

                     ORDER BY id DESC`,

                    [
                        userId
                    ]

                );


        // ==========================================
        // BASIC STATISTICS
        // ==========================================

        const totalInterviews =
            interviews.length;


        const resumeInterviews =
            interviews.filter(
                item =>
                    item.interview_type ===
                    "resume"
            ).length;


        const subjectInterviews =
            interviews.filter(
                item =>
                    item.interview_type ===
                    "subject"
            ).length;


        let averageScore =
            0;


        let highestScore =
            0;


        let lowestScore =
            0;


        if (
            interviews.length > 0
        ) {

            const scores =
                interviews.map(
                    item =>
                        Number(
                            item.overall_score ||
                            0
                        )
                );


            const totalScore =
                scores.reduce(
                    (
                        sum,
                        score
                    ) =>
                        sum +
                        score,
                    0
                );


            averageScore =
                Math.round(
                    (
                        totalScore /
                        scores.length
                    )
                    * 10
                ) / 10;


            highestScore =
                Math.max(
                    ...scores
                );


            lowestScore =
                Math.min(
                    ...scores
                );

        }


        // ==========================================
        // CATEGORY AVERAGE SCORES
        // ==========================================

        const [categoryRows] =
            await db
                .promise()
                .query(

                    `SELECT

                        AVG(
                            ia.relevance_score
                        )
                        AS relevance,

                        AVG(
                            ia.technical_score
                        )
                        AS technical,

                        AVG(
                            ia.completeness_score
                        )
                        AS completeness,

                        AVG(
                            ia.clarity_score
                        )
                        AS clarity

                     FROM interview_answers ia

                     INNER JOIN interviews i

                     ON i.id =
                        ia.interview_id

                     WHERE i.user_id = ?

                     AND i.status =
                        'evaluated'`,

                    [
                        userId
                    ]

                );


        const categoryScores = {

            relevance:
                Number(
                    categoryRows[0]
                        .relevance ||
                    0
                ).toFixed(1),

            technical:
                Number(
                    categoryRows[0]
                        .technical ||
                    0
                ).toFixed(1),

            completeness:
                Number(
                    categoryRows[0]
                        .completeness ||
                    0
                ).toFixed(1),

            clarity:
                Number(
                    categoryRows[0]
                        .clarity ||
                    0
                ).toFixed(1)

        };


        // ==========================================
        // SUBJECT-WISE PERFORMANCE
        // ==========================================

        const [subjectPerformance] =
            await db
                .promise()
                .query(

                    `SELECT

                        subject,

                        COUNT(*)
                        AS total_interviews,

                        ROUND(
                            AVG(
                                overall_score
                            ),
                            1
                        )
                        AS average_score

                     FROM interviews

                     WHERE user_id = ?

                     AND interview_type =
                        'subject'

                     AND status =
                        'evaluated'

                     AND subject
                        IS NOT NULL

                     GROUP BY subject

                     ORDER BY
                        average_score DESC`,

                    [
                        userId
                    ]

                );


        // ==========================================
        // BEST + WEAKEST SUBJECT
        // ==========================================

        let bestSubject =
            null;


        let weakestSubject =
            null;


        if (
            subjectPerformance.length >
            0
        ) {

            bestSubject =
                subjectPerformance[0];


            weakestSubject =
                subjectPerformance[
                    subjectPerformance.length -
                    1
                ];

        }


        // ==========================================
        // RECENT MISTAKES
        // ==========================================

        const [recentMistakes] =
            await db
                .promise()
                .query(

                    `SELECT

                        ia.mistakes,

                        ia.suggestions,

                        iq.question,

                        i.subject,

                        i.interview_type,

                        i.id
                        AS interview_id

                     FROM interview_answers ia

                     INNER JOIN interviews i

                     ON i.id =
                        ia.interview_id

                     INNER JOIN
                     interview_questions iq

                     ON iq.id =
                        ia.question_id

                     WHERE i.user_id = ?

                     AND i.status =
                        'evaluated'

                     AND ia.mistakes
                        IS NOT NULL

                     AND TRIM(
                        ia.mistakes
                     ) <> ''

                     ORDER BY
                        ia.id DESC

                     LIMIT 6`,

                    [
                        userId
                    ]

                );


        // ==========================================
        // PERFORMANCE TREND
        // ==========================================

        const chronologicalInterviews =
            interviews
                .slice()
                .reverse();


        const trendLabels =
            chronologicalInterviews.map(
                (
                    item,
                    index
                ) =>
                    `Interview ${index + 1}`
            );


        const trendScores =
            chronologicalInterviews.map(
                item =>
                    Number(
                        item.overall_score ||
                        0
                    )
            );


        // ==========================================
        // TREND STATUS
        // ==========================================

        let trendStatus =
            "Not enough data";


        if (
            trendScores.length >= 2
        ) {

            const firstScore =
                trendScores[0];


            const latestScore =
                trendScores[
                    trendScores.length -
                    1
                ];


            if (
                latestScore >
                firstScore
            ) {

                trendStatus =
                    "Improving";

            }

            else if (
                latestScore <
                firstScore
            ) {

                trendStatus =
                    "Needs Attention";

            }

            else {

                trendStatus =
                    "Stable";

            }

        }


        // ==========================================
        // LATEST INTERVIEW
        // ==========================================

        const latestInterview =
            interviews.length > 0
                ? interviews[0]
                : null;


        // ==========================================
        // RENDER PAGE
        // ==========================================

        return res.render(

            "performance",

            {

                totalInterviews,

                resumeInterviews,

                subjectInterviews,

                averageScore,

                highestScore,

                lowestScore,

                categoryScores,

                subjectPerformance,

                bestSubject,

                weakestSubject,

                recentMistakes,

                interviews,

                trendLabels,

                trendScores,

                trendStatus,

                latestInterview

            }

        );

    }

    catch (error) {

        console.error(
            "Performance Error:",
            error
        );


        return res
            .status(500)
            .send(
                "Unable to load performance."
            );

    }

};