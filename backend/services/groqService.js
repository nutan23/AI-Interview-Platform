const axios = require("axios");


// ==========================================
// GROQ CONFIGURATION
// ==========================================

const GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";


const MODEL =
    "openai/gpt-oss-20b";


// ==========================================
// GENERATE AI RESPONSE
// ==========================================

async function generateAI(
    prompt,
    numPredict = 300,
    jsonMode = false
) {

    try {

        // ==========================================
        // CHECK API KEY
        // ==========================================

        if (!process.env.GROQ_API_KEY) {

            throw new Error(
                "GROQ_API_KEY is missing."
            );

        }


        if (!prompt || !String(prompt).trim()) {

            throw new Error(
                "AI prompt is empty."
            );

        }


        // ==========================================
        // GIVE MODEL ENOUGH OUTPUT SPACE
        // ==========================================

        const maxOutputTokens =
            Math.max(
                Number(numPredict) || 300,
                512
            );


        console.log(
            "=========================================="
        );

        console.log(
            "Connecting to Groq..."
        );

        console.log(
            "Model:",
            MODEL
        );

        console.log(
            "Requested tokens:",
            numPredict
        );

        console.log(
            "Actual max tokens:",
            maxOutputTokens
        );

        console.log(
            "JSON Mode:",
            jsonMode
        );

        console.log(
            "=========================================="
        );


        // ==========================================
        // REQUEST BODY
        // ==========================================

        const requestBody = {

            model:
                MODEL,

            messages: [

                {
                    role:
                        "user",

                    content:
                        String(prompt).trim()
                }

            ],

            // GPT-OSS reasoning
            reasoning_effort:
                "low",

            // We only need final answer,
            // not reasoning content
            include_reasoning:
                false,

            temperature:
                0.2,

            max_completion_tokens:
                maxOutputTokens,

            stream:
                false

        };


        // ==========================================
        // JSON MODE
        // ==========================================

        if (jsonMode === true) {

            requestBody.response_format = {
                type:
                    "json_object"
            };

        }


        // ==========================================
        // CALL GROQ
        // ==========================================

        const response =
            await axios.post(

                GROQ_URL,

                requestBody,

                {

                    headers: {

                        Authorization:
                            `Bearer ${process.env.GROQ_API_KEY}`,

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"

                    },

                    timeout:
                        60000

                }

            );


        // ==========================================
        // DEBUG RESPONSE
        // ==========================================

        console.log(
            "Groq HTTP Status:",
            response.status
        );


        if (
            !response.data ||
            !Array.isArray(
                response.data.choices
            ) ||
            response.data.choices.length === 0
        ) {

            console.error(
                "Groq raw response:",
                response.data
            );

            throw new Error(
                "Groq returned no AI choices."
            );

        }


        const message =
            response.data
                .choices[0]
                .message;


        if (!message) {

            console.error(
                "Groq choice:",
                response.data.choices[0]
            );

            throw new Error(
                "Groq returned no message."
            );

        }


        // ==========================================
        // GET FINAL AI TEXT
        // ==========================================

        const aiText =
            String(
                message.content || ""
            ).trim();


        if (!aiText) {

            console.error(
                "Groq message:",
                message
            );

            console.error(
                "Finish reason:",
                response.data
                    .choices[0]
                    .finish_reason
            );

            console.error(
                "Usage:",
                response.data.usage
            );


            throw new Error(
                "Groq returned an empty AI response."
            );

        }


        console.log(
            "Groq response received successfully."
        );


        console.log(
            "Response length:",
            aiText.length
        );


        return aiText;

    }

    catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "GROQ ERROR"
        );

        console.error(
            "Message:",
            error.message
        );


        // ==========================================
        // HTTP ERROR
        // ==========================================

        if (error.response) {

            console.error(
                "HTTP Status:",
                error.response.status
            );

            console.error(
                "Groq Response:",
                error.response.data
            );


            if (
                error.response.status === 401
            ) {

                throw new Error(
                    "Groq API key is invalid."
                );

            }


            if (
                error.response.status === 429
            ) {

                throw new Error(
                    "Groq rate limit reached. Please try again shortly."
                );

            }


            if (
                error.response.status === 400
            ) {

                throw new Error(
                    error.response.data
                        ?.error
                        ?.message ||
                    "Invalid Groq request."
                );

            }


            throw new Error(
                error.response.data
                    ?.error
                    ?.message ||
                "Groq returned an error."
            );

        }


        // ==========================================
        // TIMEOUT
        // ==========================================

        if (
            error.code ===
            "ECONNABORTED"
        ) {

            throw new Error(
                "AI response is taking too long. Please try again."
            );

        }


        console.error(
            "=========================================="
        );


        throw new Error(
            error.message ||
            "AI service is not available."
        );

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    generateAI
};