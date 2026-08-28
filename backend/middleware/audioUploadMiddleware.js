const multer = require("multer");

const path = require("path");

const fs = require("fs");


// ==========================================
// AUDIO UPLOAD FOLDER
// ==========================================

const audioFolder =
    path.join(
        __dirname,
        "../uploads/audio"
    );


// Create folder if it does not exist
if (
    !fs.existsSync(
        audioFolder
    )
) {

    fs.mkdirSync(
        audioFolder,
        {
            recursive: true
        }
    );

}


// ==========================================
// STORAGE
// ==========================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    audioFolder
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const uniqueName =
                    `answer-${Date.now()}-${Math.round(
                        Math.random() * 1E9
                    )}.webm`;


                cb(
                    null,
                    uniqueName
                );

            }

    });


// ==========================================
// MULTER
// ==========================================

const audioUpload =
    multer({

        storage: storage,

        limits: {

            fileSize:
                20 * 1024 * 1024

        }

    });


module.exports =
    audioUpload;