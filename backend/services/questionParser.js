// ==========================================
// PARSE AI GENERATED QUESTIONS
// ==========================================

function parseQuestions(aiResponse) {

    if (!aiResponse || typeof aiResponse !== "string") {
        return [];
    }

    const lines = aiResponse
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);


    const questions = [];


    for (const line of lines) {

        // Match:
        // 1. Question
        // 2) Question
        // 3 - Question

        const match = line.match(
            /^\s*(\d+)\s*[\.\)\-:]\s*(.+)$/ 
        );


        if (match) {

            const questionNumber =
                parseInt(match[1]);

            const questionText =
                match[2].trim();


            if (questionText.length > 0) {

                questions.push({
                    questionNumber: questionNumber,
                    question: questionText
                });

            }

        }

    }


    return questions;
}


module.exports = {
    parseQuestions
};