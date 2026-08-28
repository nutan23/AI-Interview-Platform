const {
    generateAI
} = require("./ollamaService");


// ==========================================
// SCORE CLEANER
// ==========================================

function cleanScore(value) {

    let number =
        parseFloat(value);


    if (
        isNaN(number)
    ) {

        number = 0;

    }


    if (
        number < 0
    ) {

        number = 0;

    }


    if (
        number > 10
    ) {

        number = 10;

    }


    return Math.round(
        number * 10
    ) / 10;
}


// ==========================================
// CLEAN AI JSON
// ==========================================

function parseAIResponse(
    aiResponse
) {

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
            "AI returned invalid JSON."
        );

    }


    const jsonText =
        cleaned.substring(
            firstBrace,
            lastBrace + 1
        );


    return JSON.parse(
        jsonText
    );
}


// ==========================================
// EVALUATE SINGLE ANSWER
// ==========================================

async function evaluateSingleAnswer(
    question,
    answerText,
    questionNumber = 1
) {

    try {

        // ==========================================
        // CLEAN INPUT
        // ==========================================

        const cleanQuestion =
            String(
                question || ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        const cleanAnswer =
            String(
                answerText || ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim()
                .substring(
                    0,
                    1200
                );


        if (
            cleanQuestion === ""
        ) {

            throw new Error(
                "Question is empty."
            );

        }


        if (
            cleanAnswer === ""
        ) {

            throw new Error(
                "Answer is empty."
            );

        }


        // ==========================================
        // PROMPT
        // SAME RULES AS OLD VERSION
        // ==========================================

        const prompt = `

You are a strict but fair student interview evaluator.

Evaluate ONLY this ONE question-answer pair.

QUESTION ${questionNumber}:
${cleanQuestion}

STUDENT ANSWER ${questionNumber}:
${cleanAnswer}


SCORING:

RELEVANCE:
0-2 = unrelated
3-5 = partially relevant
6-8 = mostly relevant
9-10 = directly relevant

TECHNICAL:
0-2 = technically wrong
3-5 = partial understanding with major errors
6-8 = mostly correct
9-10 = technically accurate and strong

COMPLETENESS:
0-2 = almost no useful content
3-5 = incomplete
6-8 = covers most important points
9-10 = complete and well explained

CLARITY:
0-2 = very confusing
3-5 = difficult to understand
6-8 = understandable with some language issues
9-10 = clear and professional


IMPORTANT RULES:

1. Evaluate ONLY the actual question and actual student answer.

2. Never copy words, mistakes, phrases or examples from these instructions.

3. Never mention a word as a mistake unless that word actually appears in the student's answer.

4. Check whether the answer is relevant to the question.

5. Check technical correctness carefully.

6. Check whether important concepts are missing.

7. Check grammar and sentence clarity for EVERY answer.

8. Check wrong technical terminology and wrong word usage.

9. If grammar is wrong, mention the actual grammar problem.

10. If terminology is wrong, mention the actual wrong terminology used by the student.

11. If the answer is irrelevant, clearly state that it is irrelevant.

12. If the technical concept is wrong, clearly state the actual concept problem.

13. If the answer is incomplete, mention what important point is missing.

14. Minor spoken-English grammar mistakes should mainly reduce clarity_score.

15. A technically correct answer with minor grammar errors can still receive a good technical_score.

16. Do NOT return all scores as 0 unless the answer is empty, meaningless or completely unrelated.

17. Do NOT automatically give 9 or 10. Use the full scoring scale.

18. For HR questions, evaluate relevance, appropriateness, completeness and clarity. Do not expect technical knowledge.

19. Feedback must describe the actual quality of the answer.

20. Mistakes must describe only actual problems found in the student's answer.

21. If no important mistake is found, write:
"No major mistake."

22. Suggestion must tell the student exactly how to improve the current answer.

23. Feedback maximum 12 words.

24. Mistakes maximum 20 words.

25. Suggestions maximum 15 words.

26. Return ONLY valid JSON.

27. No markdown.

28. No explanation outside JSON.


RETURN ONE JSON OBJECT WITH EXACTLY THESE KEYS:

question_number
relevance_score
technical_score
completeness_score
clarity_score
feedback
mistakes
suggestions

The four score fields must contain numeric values from 0 to 10.

Generate every value from the ACTUAL student answer only.

Do not include overall_score.
Do not include final_feedback.
Do not include strengths.
Do not include weaknesses.
Do not include overall_suggestions.

`;


        console.log(
            "=========================================="
        );


        console.log(
            "SINGLE ANSWER EVALUATION"
        );


        console.log(
            "Question:",
            questionNumber
        );


        console.log(
            "=========================================="
        );


        // ==========================================
        // OLLAMA
        // ==========================================

        const aiResponse =
            await generateAI(

                prompt,

                320,

                true

            );


        const parsed =
            parseAIResponse(
                aiResponse
            );


        // ==========================================
        // SCORES
        // ==========================================

        const relevanceScore =
            cleanScore(
                parsed.relevance_score
            );


        const technicalScore =
            cleanScore(
                parsed.technical_score
            );


        const completenessScore =
            cleanScore(
                parsed.completeness_score
            );


        const clarityScore =
            cleanScore(
                parsed.clarity_score
            );


        // ==========================================
        // CALCULATE QUESTION OVERALL
        // ==========================================

        const overallScore =
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
        // RESULT
        // ==========================================

        return {

            question_number:
                Number(
                    questionNumber
                ),


            relevance_score:
                relevanceScore,


            technical_score:
                technicalScore,


            completeness_score:
                completenessScore,


            clarity_score:
                clarityScore,


            overall_score:
                overallScore,


            feedback:
                String(
                    parsed.feedback || ""
                ).trim(),


            mistakes:
                String(
                    parsed.mistakes ||
                    "No major mistake."
                ).trim(),


            suggestions:
                String(
                    parsed.suggestions ||
                    "Keep practicing."
                ).trim()

        };

    }

    catch (error) {

        console.error(
            "Single Answer Evaluation Error:",
            error
        );


        throw error;

    }

}


// ==========================================
// TEMPORARY COMPATIBILITY FUNCTION
// ==========================================
//
// IMPORTANT:
// This keeps your OLD controller working
// until we modify interviewController.js.
//
// Later the new queue system will use
// evaluateSingleAnswer() directly.
//
// ==========================================

async function evaluateFullInterview(
    interviewData
) {

    try {

        if (
            !Array.isArray(
                interviewData
            ) ||
            interviewData.length === 0
        ) {

            throw new Error(
                "Interview data is empty."
            );

        }


        const questions =
            [];


        // Process one-by-one.
        // No multi-answer JSON problem.
        for (
            let i = 0;
            i < interviewData.length;
            i++
        ) {

            const item =
                interviewData[i];


            const result =
                await evaluateSingleAnswer(

                    item.question,

                    item.answer_text,

                    i + 1

                );


            questions.push(
                result
            );

        }


        return JSON.stringify({

            questions:
                questions

        });

    }

    catch (error) {

        console.error(
            "Full Interview Compatibility Evaluation Error:",
            error
        );


        throw error;

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    evaluateSingleAnswer,

    evaluateFullInterview

};