const { execFile } = require("child_process");

const fs = require("fs");

const path = require("path");


// ==========================================
// CONFIGURATION
// ==========================================

const WHISPER_EXE =
    "C:\\whisper.cpp\\build\\bin\\Release\\whisper-cli.exe";


const WHISPER_MODEL =
    "C:\\whisper.cpp\\models\\ggml-base.en.bin";


// ==========================================
// CONVERT AUDIO TO WAV
// ==========================================

function convertToWav(
    inputPath
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const absoluteInputPath =
                path.resolve(
                    inputPath
                );


            const parsedPath =
                path.parse(
                    absoluteInputPath
                );


            const wavPath =
                path.join(
                    parsedPath.dir,
                    parsedPath.name + "-converted.wav"
                );


            console.log(
                "Converting audio to WAV..."
            );


            console.log(
                "Input:",
                absoluteInputPath
            );


            console.log(
                "Output:",
                wavPath
            );


            // ==========================================
            // FFMPEG SETTINGS
            // ==========================================
            //
            // -ac 1       = mono
            // -ar 16000   = 16 kHz
            // pcm_s16le   = standard PCM WAV
            //
            // These settings work well with whisper.cpp.
            // ==========================================

            const ffmpegArgs = [

                "-y",

                "-i",
                absoluteInputPath,

                "-ac",
                "1",

                "-ar",
                "16000",

                "-c:a",
                "pcm_s16le",

                wavPath

            ];


            execFile(

                "ffmpeg",

                ffmpegArgs,

                {
                    windowsHide: true
                },

                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        console.error(
                            "FFmpeg conversion error:"
                        );


                        console.error(
                            error
                        );


                        console.error(
                            stderr
                        );


                        return reject(
                            new Error(
                                "Unable to convert audio to WAV."
                            )
                        );

                    }


                    if (
                        !fs.existsSync(
                            wavPath
                        )
                    ) {

                        return reject(
                            new Error(
                                "Converted WAV file was not created."
                            )
                        );

                    }


                    console.log(
                        "Audio conversion complete."
                    );


                    resolve(
                        wavPath
                    );

                }

            );

        }

    );

}


// ==========================================
// TRANSCRIBE WAV WITH WHISPER
// ==========================================

function runWhisper(
    wavPath
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            // ==========================================
            // CHECK WHISPER
            // ==========================================

            if (
                !fs.existsSync(
                    WHISPER_EXE
                )
            ) {

                return reject(
                    new Error(
                        "Whisper executable not found."
                    )
                );

            }


            // ==========================================
            // CHECK MODEL
            // ==========================================

            if (
                !fs.existsSync(
                    WHISPER_MODEL
                )
            ) {

                return reject(
                    new Error(
                        "Whisper model not found."
                    )
                );

            }


            // ==========================================
            // CHECK WAV
            // ==========================================

            if (
                !fs.existsSync(
                    wavPath
                )
            ) {

                return reject(
                    new Error(
                        "WAV file not found."
                    )
                );

            }


            console.log(
                "Starting Whisper transcription..."
            );


            const args = [

                "-m",
                WHISPER_MODEL,

                "-f",
                wavPath,

                "-otxt",

                "-nt"

            ];


            execFile(

                WHISPER_EXE,

                args,

                {
                    windowsHide: true
                },

                (
                    error,
                    stdout,
                    stderr
                ) => {

                    if (error) {

                        console.error(
                            "Whisper error:"
                        );


                        console.error(
                            error
                        );


                        console.error(
                            stderr
                        );


                        return reject(
                            new Error(
                                "Whisper transcription failed."
                            )
                        );

                    }


                    // ==========================================
                    // TXT OUTPUT
                    // ==========================================

                    const transcriptPath =
                        wavPath +
                        ".txt";


                    if (
                        !fs.existsSync(
                            transcriptPath
                        )
                    ) {

                        return reject(
                            new Error(
                                "Whisper transcript file was not created."
                            )
                        );

                    }


                    const transcription =
                        fs
                            .readFileSync(
                                transcriptPath,
                                "utf8"
                            )
                            .trim();


                    // ==========================================
                    // DELETE TXT FILE
                    // ==========================================

                    try {

                        fs.unlinkSync(
                            transcriptPath
                        );

                    }

                    catch (error) {

                        console.log(
                            "Could not delete transcript file."
                        );

                    }


                    console.log(
                        "Whisper transcription complete."
                    );


                    console.log(
                        "Text:",
                        transcription
                    );


                    resolve(
                        transcription
                    );

                }

            );

        }

    );

}


// ==========================================
// MAIN TRANSCRIBE FUNCTION
// ==========================================

async function transcribeAudio(
    audioPath
) {

    let wavPath =
        null;


    try {

        // ==========================================
        // CHECK INPUT FILE
        // ==========================================

        if (
            !fs.existsSync(
                audioPath
            )
        ) {

            throw new Error(
                "Audio file not found."
            );

        }


        // ==========================================
        // CONVERT WEBM / AUDIO TO WAV
        // ==========================================

        wavPath =
            await convertToWav(
                audioPath
            );


        // ==========================================
        // SEND WAV TO WHISPER
        // ==========================================

        const transcription =
            await runWhisper(
                wavPath
            );


        return transcription;

    }

    finally {

        // ==========================================
        // DELETE TEMP WAV
        // ==========================================

        if (
            wavPath &&
            fs.existsSync(
                wavPath
            )
        ) {

            try {

                fs.unlinkSync(
                    wavPath
                );

            }

            catch (error) {

                console.log(
                    "Could not delete temporary WAV file."
                );

            }

        }

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    transcribeAudio
};