// ==========================================
// FULL INTERVIEW EVALUATION PARSER
// ==========================================

function parseFullEvaluation(
    aiResponse
) {

    try {

        // ==========================================
        // CLEAN AI RESPONSE
        // ==========================================

        let cleaned =
            String(
                aiResponse || ""
            ).trim();


        cleaned =
            cleaned.replace(
                /```json/gi,
                ""
            );


        cleaned =
            cleaned.replace(
                /```/g,
                ""
            );


        cleaned =
            cleaned.trim();


        // ==========================================
        // FIND JSON
        // ==========================================

        const firstBrace =
            cleaned.indexOf("{");


        const lastBrace =
            cleaned.lastIndexOf("}");


        if (
            firstBrace === -1 ||
            lastBrace === -1 ||
            lastBrace < firstBrace
        ) {

            throw new Error(
                "No JSON found in AI response."
            );

        }


        const jsonText =
            cleaned.substring(
                firstBrace,
                lastBrace + 1
            );


        const parsed =
            JSON.parse(
                jsonText
            );


        // ==========================================
        // SCORE CLEANER
        // ==========================================

        function score(
            value
        ) {

            let number =
                parseFloat(
                    value
                );


            if (
                isNaN(number)
            ) {

                number =
                    0;

            }


            if (
                number < 0
            ) {

                number =
                    0;

            }


            if (
                number > 10
            ) {

                number =
                    10;

            }


            return Math.round(
                number * 10
            ) / 10;

        }


        // ==========================================
        // TEXT CLEANER
        // ==========================================

        function cleanText(
            value
        ) {

            return String(
                value || ""
            ).trim();

        }


        // ==========================================
        // VALIDATE QUESTIONS ARRAY
        // ==========================================

        if (
            !Array.isArray(
                parsed.questions
            )
        ) {

            throw new Error(
                "Questions evaluation array missing."
            );

        }


        if (
            parsed.questions.length === 0
        ) {

            throw new Error(
                "No question evaluations found."
            );

        }


        // ==========================================
        // CLEAN + CALCULATE QUESTION SCORES
        // ==========================================

        const questions =
            parsed.questions.map(
                (
                    item,
                    index
                ) => {

                    // ==========================================
                    // GET INDIVIDUAL SCORES
                    // ==========================================

                    const relevanceScore =
                        score(

                            item.relevance_score ??

                            item.relevance ??

                            item.relevanceScore

                        );


                    const technicalScore =
                        score(

                            item.technical_score ??

                            item.technical ??

                            item.technicalScore

                        );


                    const completenessScore =
                        score(

                            item.completeness_score ??

                            item.completeness ??

                            item.completenessScore

                        );


                    const clarityScore =
                        score(

                            item.clarity_score ??

                            item.clarity ??

                            item.clarityScore

                        );


                    // ==========================================
                    // CALCULATE QUESTION OVERALL SCORE
                    // ==========================================

                    const questionOverallScore =
                        Math.round(

                            (

                                (
                                    relevanceScore +

                                    technicalScore +

                                    completenessScore +

                                    clarityScore
                                )

                                / 4

                            )

                            * 10

                        ) / 10;


                    // ==========================================
                    // FEEDBACK
                    // ==========================================

                    let feedback =
                        cleanText(
                            item.feedback
                        );


                    if (
                        feedback === ""
                    ) {

                        if (
                            questionOverallScore >= 8
                        ) {

                            feedback =
                                "Strong and well-structured answer.";

                        }

                        else if (
                            questionOverallScore >= 6
                        ) {

                            feedback =
                                "Good answer but needs more detail.";

                        }

                        else {

                            feedback =
                                "Answer needs better explanation and accuracy.";

                        }

                    }


                    // ==========================================
                    // MISTAKES
                    // ==========================================

                    let mistakes =
                        cleanText(

                            item.mistakes ??

                            item.mistake

                        );


                    if (
                        mistakes === ""
                    ) {

                        if (
                            questionOverallScore >= 8
                        ) {

                            mistakes =
                                "No major mistake identified.";

                        }

                        else {

                            mistakes =
                                "Answer lacks sufficient detail or precision.";

                        }

                    }


                    // ==========================================
                    // SUGGESTIONS
                    // ==========================================

                    let suggestions =
                        cleanText(

                            item.suggestions ??

                            item.suggestion

                        );


                    if (
                        suggestions === ""
                    ) {

                        if (
                            questionOverallScore >= 8
                        ) {

                            suggestions =
                                "Continue giving clear answers with examples.";

                        }

                        else {

                            suggestions =
                                "Add technical depth and practical examples.";

                        }

                    }


                    // ==========================================
                    // RETURN QUESTION RESULT
                    // ==========================================

                    return {

                        question_number:
                            parseInt(

                                item.question_number ??

                                item.questionNumber

                            ) ||

                            index + 1,


                        relevance_score:
                            relevanceScore,


                        technical_score:
                            technicalScore,


                        completeness_score:
                            completenessScore,


                        clarity_score:
                            clarityScore,


                        overall_score:
                            questionOverallScore,


                        feedback:
                            feedback,


                        mistakes:
                            mistakes,


                        suggestions:
                            suggestions

                    };

                }
            );


        // ==========================================
        // CALCULATE FINAL OVERALL SCORE
        // ==========================================

        let calculatedOverallScore =
            0;


        if (
            questions.length > 0
        ) {

            const totalScore =
                questions.reduce(
                    (
                        sum,
                        question
                    ) => {

                        return (
                            sum +
                            Number(
                                question.overall_score || 0
                            )
                        );

                    },
                    0
                );


            calculatedOverallScore =
                totalScore /
                questions.length;


            calculatedOverallScore =
                Math.round(
                    calculatedOverallScore *
                    10
                ) / 10;

        }


        // ==========================================
        // CALCULATE CATEGORY AVERAGES
        // ==========================================

        function calculateAverage(
            key
        ) {

            if (
                questions.length === 0
            ) {

                return 0;

            }


            const total =
                questions.reduce(
                    (
                        sum,
                        item
                    ) => {

                        return (
                            sum +
                            Number(
                                item[key] || 0
                            )
                        );

                    },
                    0
                );


            return Math.round(

                (
                    total /
                    questions.length
                )

                * 10

            ) / 10;

        }


        const avgRelevance =
            calculateAverage(
                "relevance_score"
            );


        const avgTechnical =
            calculateAverage(
                "technical_score"
            );


        const avgCompleteness =
            calculateAverage(
                "completeness_score"
            );


        const avgClarity =
            calculateAverage(
                "clarity_score"
            );


        // ==========================================
        // FINAL FEEDBACK
        // ==========================================

        let finalFeedback =
            cleanText(

                parsed.final_feedback ??

                parsed.finalFeedback

            );


        if (
            finalFeedback === ""
        ) {

            if (
                calculatedOverallScore >= 8
            ) {

                finalFeedback =
                    "Strong interview performance with clear and relevant answers.";

            }

            else if (
                calculatedOverallScore >= 6
            ) {

                finalFeedback =
                    "Good foundation, but some answers need more depth.";

            }

            else {

                finalFeedback =
                    "More preparation is needed to improve answer quality.";

            }

        }


        // ==========================================
        // STRENGTHS
        // ==========================================

        let strengths =
            cleanText(

                parsed.strengths ??

                parsed.strength

            );


        if (
            strengths === ""
        ) {

            const strengthsArray =
                [];


            if (
                avgRelevance >= 7
            ) {

                strengthsArray.push(
                    "Relevant answers"
                );

            }


            if (
                avgTechnical >= 7
            ) {

                strengthsArray.push(
                    "Technical understanding"
                );

            }


            if (
                avgCompleteness >= 7
            ) {

                strengthsArray.push(
                    "Complete responses"
                );

            }


            if (
                avgClarity >= 7
            ) {

                strengthsArray.push(
                    "Clear communication"
                );

            }


            if (
                strengthsArray.length === 0
            ) {

                strengthsArray.push(
                    "Basic understanding demonstrated"
                );

            }


            strengths =
                strengthsArray.join(
                    ", "
                );

        }


        // ==========================================
        // WEAKNESSES
        // ==========================================

        let weaknesses =
            cleanText(

                parsed.weaknesses ??

                parsed.weakness ??

                parsed.areas_to_improve ??

                parsed.areasToImprove

            );


        if (
            weaknesses === ""
        ) {

            const weaknessArray =
                [];


            if (
                avgRelevance < 6
            ) {

                weaknessArray.push(
                    "Answer relevance"
                );

            }


            if (
                avgTechnical < 6
            ) {

                weaknessArray.push(
                    "Technical depth"
                );

            }


            if (
                avgCompleteness < 6
            ) {

                weaknessArray.push(
                    "Answer completeness"
                );

            }


            if (
                avgClarity < 6
            ) {

                weaknessArray.push(
                    "Communication clarity"
                );

            }


            if (
                weaknessArray.length === 0
            ) {

                weaknessArray.push(
                    "Minor improvement in answer depth"
                );

            }


            weaknesses =
                weaknessArray.join(
                    ", "
                );

        }


        // ==========================================
        // OVERALL SUGGESTION
        // ==========================================

        let overallSuggestions =
            cleanText(

                parsed.overall_suggestions ??

                parsed.overallSuggestions ??

                parsed.overall_suggestion ??

                parsed.suggestion

            );


        if (
            overallSuggestions === ""
        ) {

            if (
                avgTechnical < 7
            ) {

                overallSuggestions =
                    "Strengthen technical concepts and support answers with examples.";

            }

            else if (
                avgCompleteness < 7
            ) {

                overallSuggestions =
                    "Give more complete answers with practical examples.";

            }

            else if (
                avgClarity < 7
            ) {

                overallSuggestions =
                    "Practice structured and confident interview responses.";

            }

            else {

                overallSuggestions =
                    "Continue practicing advanced questions and real interview scenarios.";

            }

        }


        // ==========================================
        // DEBUG LOG
        // ==========================================

        console.log(
            "=========================================="
        );


        console.log(
            "FINAL PARSED EVALUATION"
        );


        console.log(
            "Questions:",
            questions.length
        );


        questions.forEach(
            question => {

                console.log(
                    `Q${question.question_number}:`,
                    question.overall_score
                );

                console.log(
                    "Relevance:",
                    question.relevance_score
                );

                console.log(
                    "Technical:",
                    question.technical_score
                );

                console.log(
                    "Completeness:",
                    question.completeness_score
                );

                console.log(
                    "Clarity:",
                    question.clarity_score
                );

            }
        );


        console.log(
            "Final Overall Score:",
            calculatedOverallScore
        );


        console.log(
            "=========================================="
        );


        // ==========================================
        // RETURN FINAL CLEAN RESULT
        // ==========================================

        return {

            questions:
                questions,


            overall_score:
                calculatedOverallScore,


            final_feedback:
                finalFeedback,


            strengths:
                strengths,


            weaknesses:
                weaknesses,


            overall_suggestions:
                overallSuggestions

        };

    }

    catch (error) {

        console.error(
            "Full Evaluation Parse Error:",
            error
        );


        throw new Error(
            "Unable to parse complete interview evaluation."
        );

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    parseFullEvaluation
};