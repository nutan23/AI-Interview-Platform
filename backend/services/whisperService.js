const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");


// ==========================================
// GROQ WHISPER CONFIGURATION
// ==========================================

const GROQ_TRANSCRIPTION_URL =
    "https://api.groq.com/openai/v1/audio/transcriptions";


const WHISPER_MODEL =
    "whisper-large-v3-turbo";


// ==========================================
// TRANSCRIBE AUDIO USING GROQ
// ==========================================

async function transcribeAudio(
    audioPath
) {

    try {

        console.log(
            "=========================================="
        );

        console.log(
            "Starting Groq audio transcription..."
        );


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


        // ==========================================
        // CHECK AUDIO PATH
        // ==========================================

        if (
            !audioPath
        ) {

            throw new Error(
                "Audio path is missing."
            );

        }


        const absoluteAudioPath =
            path.resolve(
                audioPath
            );


        // ==========================================
        // CHECK AUDIO FILE
        // ==========================================

        if (
            !fs.existsSync(
                absoluteAudioPath
            )
        ) {

            throw new Error(
                "Audio file not found."
            );

        }


        console.log(
            "Audio file:",
            absoluteAudioPath
        );


        console.log(
            "Whisper model:",
            WHISPER_MODEL
        );


        // ==========================================
        // CREATE MULTIPART FORM
        // ==========================================

        const formData =
            new FormData();


        formData.append(
            "file",
            fs.createReadStream(
                absoluteAudioPath
            )
        );


        formData.append(
            "model",
            WHISPER_MODEL
        );


        formData.append(
            "response_format",
            "json"
        );


        formData.append(
            "language",
            "en"
        );


        formData.append(
            "temperature",
            "0"
        );


        // ==========================================
        // SEND AUDIO TO GROQ
        // ==========================================

        const response =
            await axios.post(

                GROQ_TRANSCRIPTION_URL,

                formData,

                {

                    headers: {

                        ...formData.getHeaders(),

                        Authorization:
                            `Bearer ${process.env.GROQ_API_KEY}`

                    },


                    maxContentLength:
                        Infinity,


                    maxBodyLength:
                        Infinity,


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
                "Groq returned no transcription response."
            );

        }


        const transcription =
            String(
                response.data.text || ""
            )
                .trim();


        if (
            transcription === ""
        ) {

            throw new Error(
                "Groq returned an empty transcription."
            );

        }


        console.log(
            "Groq transcription successful."
        );


        console.log(
            "Transcription:",
            transcription
        );


        console.log(
            "=========================================="
        );


        return transcription;

    }

    catch (error) {

        console.error(
            "=========================================="
        );


        console.error(
            "GROQ TRANSCRIPTION ERROR"
        );


        console.error(
            "Message:",
            error.message
        );


        // ==========================================
        // GROQ HTTP ERROR
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
                error.response.status === 413
            ) {

                throw new Error(
                    "Audio file is too large."
                );

            }


            if (
                error.response.status === 429
            ) {

                throw new Error(
                    "Groq transcription rate limit reached."
                );

            }


            throw new Error(
                error.response.data?.error?.message ||
                "Groq transcription failed."
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
                "Audio transcription timed out."
            );

        }


        console.error(
            "=========================================="
        );


        throw new Error(
            error.message ||
            "Unable to transcribe audio."
        );

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    transcribeAudio
};