const axios = require("axios");


// ==========================================
// GROQ CONFIGURATION
// ==========================================

const GROQ_URL =
    "https://api.groq.com/openai/v1/chat/completions";


const MODEL =
    "llama-3.1-8b-instant";


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

        if (
            !process.env.GROQ_API_KEY
        ) {

            throw new Error(
                "GROQ_API_KEY is missing."
            );

        }


        console.log(
            "Connecting to Groq..."
        );


        console.log(
            "Model:",
            MODEL
        );


        console.log(
            "Max output tokens:",
            numPredict
        );


        console.log(
            "JSON Mode:",
            jsonMode
        );


        // ==========================================
        // BUILD REQUEST BODY
        // ==========================================

        const requestBody = {

            model:
                MODEL,

            messages: [

                {
                    role:
                        "user",

                    content:
                        String(prompt || "")
                }

            ],

            temperature:
                0.1,

            max_tokens:
                numPredict,

            stream:
                false

        };


        // ==========================================
        // JSON MODE
        // ==========================================

        if (
            jsonMode === true
        ) {

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
                            "application/json"

                    },


                    timeout:
                        60000

                }

            );


        // ==========================================
        // VALIDATE RESPONSE
        // ==========================================

        if (
            !response.data
        ) {

            throw new Error(
                "Groq returned no response data."
            );

        }


        const aiText =
            response.data
                ?.choices
                ?.[0]
                ?.message
                ?.content;


        if (
            !aiText
        ) {

            throw new Error(
                "Groq returned an empty AI response."
            );

        }


        const cleanedText =
            String(
                aiText
            )
                .trim();


        if (
            cleanedText === ""
        ) {

            throw new Error(
                "Groq returned empty text."
            );

        }


        console.log(
            "Groq response received successfully."
        );


        return cleanedText;

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
        // TIMEOUT
        // ==========================================

        if (
            error.code ===
            "ECONNABORTED"
        ) {

            console.error(
                "Groq request timed out."
            );


            throw new Error(
                "AI response is taking too long. Please try again."
            );

        }


        // ==========================================
        // HTTP ERROR
        // ==========================================

        if (
            error.response
        ) {

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


            throw new Error(
                error.response.data?.error?.message ||
                "Groq returned an error."
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