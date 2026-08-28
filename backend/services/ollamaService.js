const axios = require("axios");


// ==========================================
// OLLAMA CONFIGURATION
// ==========================================

const OLLAMA_URL =
    "http://127.0.0.1:11434/api/generate";


const MODEL =
    "llama3.2:1b";


// ==========================================
// GENERATE AI RESPONSE
// ==========================================

async function generateAI(
    prompt,
    numPredict = 300,
    jsonMode = false
) {

    try {

        console.log(
            "Connecting to Ollama..."
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

            prompt:
                prompt,

            stream:
                false,

            options: {

                // More consistent output
                temperature:
                    0.1,

                // Limit maximum output
                num_predict:
                    numPredict,

                // Enough context for resume/interview
                num_ctx:
                    4096

            }

        };


        // ==========================================
        // FORCE JSON ONLY WHEN REQUIRED
        // ==========================================

        if (
            jsonMode === true
        ) {

            requestBody.format =
                "json";

        }


        // ==========================================
        // CALL OLLAMA
        // ==========================================

        const response =
            await axios.post(

                OLLAMA_URL,

                requestBody,

                {
                    // Maximum 5 minutes
                    timeout:
                        300000
                }

            );


        // ==========================================
        // VALIDATE RESPONSE
        // ==========================================

        if (
            !response.data
        ) {

            throw new Error(
                "Ollama returned no response data."
            );

        }


        if (
            !response.data.response
        ) {

            throw new Error(
                "Ollama returned an empty AI response."
            );

        }


        // ==========================================
        // CLEAN RESPONSE TEXT
        // ==========================================

        const aiText =
            String(
                response.data.response
            )
                .trim();


        if (
            aiText === ""
        ) {

            throw new Error(
                "Ollama returned empty text."
            );

        }


        console.log(
            "Ollama response received successfully."
        );


        return aiText;

    }

    catch (error) {

        console.error(
            "=========================================="
        );


        console.error(
            "OLLAMA ERROR"
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
                "Ollama request timed out."
            );


            throw new Error(
                "AI response is taking too long. Please try again."
            );

        }


        // ==========================================
        // CONNECTION REFUSED
        // ==========================================

        if (
            error.code ===
            "ECONNREFUSED"
        ) {

            console.error(
                "Could not connect to Ollama."
            );


            throw new Error(
                "Ollama is not running."
            );

        }


        // ==========================================
        // OLLAMA HTTP ERROR
        // ==========================================

        if (
            error.response
        ) {

            console.error(
                "HTTP Status:",
                error.response.status
            );


            console.error(
                "Ollama Response:",
                error.response.data
            );


            throw new Error(
                "Ollama returned an error."
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