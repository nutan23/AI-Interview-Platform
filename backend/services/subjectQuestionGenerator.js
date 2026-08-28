const {
    generateAI
} = require("./ollamaService");


// ==========================================
// GENERATE SUBJECT PRACTICE QUESTIONS
// ==========================================

async function generateSubjectQuestions(
    subject,
    difficulty,
    topic,
    questionCount
) {

    try {

        // ==========================================
        // CLEAN INPUT
        // ==========================================

        const cleanSubject =
            String(
                subject || ""
            )
                .trim();


        const cleanDifficulty =
            String(
                difficulty || "medium"
            )
                .trim()
                .toLowerCase();


        const cleanTopic =
            String(
                topic || ""
            )
                .trim();


        const totalQuestions =
            parseInt(
                questionCount
            );


        // ==========================================
        // VALIDATION
        // SUBJECT PRACTICE = 1 TO 30
        // ==========================================

        if (
            cleanSubject === ""
        ) {

            throw new Error(
                "Subject is required."
            );

        }


        if (
            ![
                "easy",
                "medium",
                "hard"
            ].includes(
                cleanDifficulty
            )
        ) {

            throw new Error(
                "Invalid difficulty level."
            );

        }


        if (
            isNaN(totalQuestions) ||
            totalQuestions < 1 ||
            totalQuestions > 30
        ) {

            throw new Error(
                "Question count must be between 1 and 30."
            );

        }


        // ==========================================
        // DIFFICULTY INSTRUCTION
        // ==========================================

        let difficultyInstruction;


        if (
            cleanDifficulty === "easy"
        ) {

            difficultyInstruction =
                "Ask basic concepts, definitions and simple application questions.";

        }

        else if (
            cleanDifficulty === "hard"
        ) {

            difficultyInstruction =
                "Ask advanced, scenario-based, problem-solving and design questions.";

        }

        else {

            difficultyInstruction =
                "Ask conceptual, comparison and moderate application questions.";

        }


        // ==========================================
        // TOPIC INSTRUCTION
        // ==========================================

        let topicInstruction;


        if (
            cleanTopic !== ""
        ) {

            topicInstruction =
                `Focus mainly on this topic: ${cleanTopic}.`;

        }

        else {

            topicInstruction =
                `Cover important concepts from ${cleanSubject}.`;

        }


        // ==========================================
        // PROMPT
        // ==========================================

        const prompt = `

You are an expert technical interviewer.

Generate exactly ${totalQuestions} technical interview questions.

SUBJECT:
${cleanSubject}

DIFFICULTY:
${cleanDifficulty}

${topicInstruction}

${difficultyInstruction}


IMPORTANT RULES:

1. Generate exactly ${totalQuestions} questions.

2. Questions must belong only to ${cleanSubject}.

3. Follow the selected ${cleanDifficulty} difficulty.

4. If a topic is provided, focus mainly on that topic.

5. Questions must be suitable for a student or fresher interview.

6. Do not ask HR questions.

7. Do not ask unrelated questions.

8. Avoid duplicate questions.

9. Do not provide answers.

10. Do not provide explanations.

11. Do not provide headings or categories.

12. Keep every question clear and concise.

13. Return ONLY numbered questions.

14. Stop after question ${totalQuestions}.


OUTPUT FORMAT:

1. Question
2. Question
3. Question

Continue until exactly ${totalQuestions} questions.

`;


        // ==========================================
        // SAFE OUTPUT TOKEN LIMIT
        // ==========================================

        let maxTokens;


        if (
            totalQuestions === 1
        ) {

            maxTokens =
                120;

        }

        else if (
            totalQuestions <= 3
        ) {

            maxTokens =
                250;

        }

        else if (
            totalQuestions <= 5
        ) {

            maxTokens =
                400;

        }

        else if (
            totalQuestions <= 10
        ) {

            maxTokens =
                700;

        }

        else if (
            totalQuestions <= 15
        ) {

            maxTokens =
                950;

        }

        else if (
            totalQuestions <= 20
        ) {

            maxTokens =
                1200;

        }

        else {

            maxTokens =
                1600;

        }


        // ==========================================
        // TERMINAL LOG
        // ==========================================

        console.log(
            "=========================================="
        );


        console.log(
            "SUBJECT QUESTION GENERATION"
        );


        console.log(
            "Subject:",
            cleanSubject
        );


        console.log(
            "Difficulty:",
            cleanDifficulty
        );


        console.log(
            "Topic:",
            cleanTopic || "General"
        );


        console.log(
            "Questions:",
            totalQuestions
        );


        console.log(
            "Max output tokens:",
            maxTokens
        );


        console.log(
            "=========================================="
        );


        // ==========================================
        // GENERATE USING OLLAMA
        // ==========================================

        const result =
            await generateAI(

                prompt,

                maxTokens,

                false

            );


        // ==========================================
        // VALIDATE AI RESPONSE
        // ==========================================

        if (
            !result ||
            String(result).trim() === ""
        ) {

            throw new Error(
                "AI returned an empty question response."
            );

        }


        console.log(
            "Subject questions generated successfully."
        );


        return String(
            result
        ).trim();

    }

    catch (error) {

        console.error(
            "=========================================="
        );


        console.error(
            "SUBJECT QUESTION GENERATION ERROR"
        );


        console.error(
            error
        );


        console.error(
            "=========================================="
        );


        throw error;

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateSubjectQuestions
};