const {
    generateInterviewQuestions
} = require("./services/questionGenerator");


async function test() {

    try {

        const resumeText = `

        Computer Engineering student.

        Skills:
        Java, C++, Python, MySQL, DBMS,
        HTML, CSS, JavaScript.

        Project:
        Smart Clinic Appointment and Queue
        Management System using Node.js,
        Express.js and MySQL.

        `;


        const questionCount = 7;


        console.log(
            "Generating interview questions..."
        );


        const questions =
            await generateInterviewQuestions(
                resumeText,
                questionCount
            );


        console.log("\nAI GENERATED QUESTIONS:\n");

        console.log(questions);


    } catch (error) {

        console.error(
            "\nERROR:"
        );

        console.error(
            error.message
        );

    }

}


test();