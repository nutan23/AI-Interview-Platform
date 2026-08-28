const {
    transcribeAudio
} = require(
    "./services/whisperService"
);


async function test() {

    try {

        const audioPath =
            "C:\\whisper.cpp\\samples\\jfk.wav";


        console.log(
            "Testing local Whisper..."
        );


        const text =
            await transcribeAudio(
                audioPath
            );


        console.log(
            "\nTRANSCRIBED TEXT:\n"
        );


        console.log(
            text
        );

    }

    catch (error) {

        console.error(
            "Whisper test failed:"
        );


        console.error(
            error.message
        );

    }

}


test();