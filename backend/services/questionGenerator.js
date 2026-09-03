const {
    generateAI
} = require("./groqService");


// ==========================================
// GENERATE RESUME INTERVIEW QUESTIONS
// ==========================================

async function generateInterviewQuestions(
    resumeText,
    questionCount
) {

    // ==========================================
    // VALIDATE QUESTION COUNT
    // ==========================================

    questionCount =
        parseInt(
            questionCount
        );


    if (
        isNaN(questionCount) ||
        questionCount < 3 ||
        questionCount > 30
    ) {

        throw new Error(
            "Question count must be between 3 and 30."
        );

    }


    // ==========================================
    // SHORT INTERVIEW STRUCTURE
    // ==========================================

    let structureInstruction;


    if (
        questionCount <= 5
    ) {

        structureInstruction = `
- Question 1 must be exactly: Tell me about yourself.
- Include at least 1 project/resume question.
- Include at least 1 technical question.
`;

    }

    else if (
        questionCount <= 10
    ) {

        structureInstruction = `
- Question 1 must be exactly: Tell me about yourself.
- Include 1 or 2 HR questions.
- Include project, resume and technical questions.
- Include at least 1 behavioral question.
- Technical/project questions should be the majority.
`;

    }

    else if (
        questionCount <= 20
    ) {

        structureInstruction = `
- Question 1 must be exactly: Tell me about yourself.
- Include 2 or 3 HR questions.
- Include resume, project, technical and behavioral questions.
- Include 1 career-goal question.
- Technical/project questions should be the majority.
`;

    }

    else {

        structureInstruction = `
- Question 1 must be exactly: Tell me about yourself.
- Include 3 to 5 HR questions.
- Include resume, project, technical, behavioral and career questions.
- Technical/project questions should be the majority.
`;

    }


    // ==========================================
    // LIMIT RESUME SIZE
    // ==========================================
    //
    // Sending a huge resume makes local models slower.
    // This keeps enough information for question generation.
    // ==========================================

    const cleanedResume =
        String(
            resumeText || ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();


    const limitedResume =
        cleanedResume.substring(
            0,
            7000
        );


    // ==========================================
    // COMPACT PROMPT
    // ==========================================

    const prompt = `

Create exactly ${questionCount} interview questions
for a Computer Engineering student using this resume.

RESUME:
${limitedResume}

RULES:
${structureInstruction}

- Ask only about skills, technologies, projects,
  education or experience actually present in the resume.
- Do not invent technologies or experience.
- Include technical and non-technical questions.
- Keep questions suitable for a fresher/student.
- Start easy, then gradually become more challenging.
- Avoid duplicate questions.
- Keep every question concise.
- Do not provide answers.
- Do not provide explanations.
- Do not provide headings or categories.
- Return ONLY numbered questions.
- Stop after question ${questionCount}.

FORMAT:

1. Tell me about yourself.
2. Question
3. Question

`;


    // ==========================================
    // OUTPUT TOKEN LIMIT
    // ==========================================

    let maxTokens;


    if (
        questionCount <= 5
    ) {

        maxTokens =
            180;

    }

    else if (
        questionCount <= 10
    ) {

        maxTokens =
            280;

    }

    else if (
        questionCount <= 20
    ) {

        maxTokens =
            450;

    }

    else {

        maxTokens =
            650;

    }


    console.log(
        "Generating resume questions..."
    );


    console.log(
        "Question count:",
        questionCount
    );


    console.log(
        "Max output tokens:",
        maxTokens
    );


    // ==========================================
    // GENERATE USING OLLAMA
    // ==========================================

    const result =
        await generateAI(
            prompt,
            maxTokens
        );


    return result;

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateInterviewQuestions
};