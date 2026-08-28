const {
    parseQuestions
} = require("./services/questionParser");


const aiResponse = `

1. What is the difference between JDK, JRE and JVM?

2. Explain normalization in DBMS.

3. What technologies did you use in your project?

4. Why did you choose MySQL?

5. What challenges did you face while developing your project?

`;


const questions =
    parseQuestions(aiResponse);


console.log("\nParsed Questions:\n");

console.log(questions);