const axios = require("axios");


// ======================================================
// BREVO EMAIL SERVICE
// Uses HTTPS API instead of SMTP
// Works on Render Free
// ======================================================

const transporter = {

    sendMail: async function (mailOptions) {

        try {

            // ==========================================
            // VALIDATE ENVIRONMENT VARIABLES
            // ==========================================

            if (!process.env.BREVO_API_KEY) {

                throw new Error(
                    "BREVO_API_KEY is missing."
                );

            }


            if (!process.env.BREVO_SENDER_EMAIL) {

                throw new Error(
                    "BREVO_SENDER_EMAIL is missing."
                );

            }


            // ==========================================
            // VALIDATE EMAIL DATA
            // ==========================================

            if (!mailOptions.to) {

                throw new Error(
                    "Recipient email is missing."
                );

            }


            if (!mailOptions.subject) {

                throw new Error(
                    "Email subject is missing."
                );

            }


            // ==========================================
            // PREPARE BREVO EMAIL DATA
            // ==========================================

            const emailData = {

                sender: {

                    name:
                        "AI Interview Platform",

                    email:
                        process.env.BREVO_SENDER_EMAIL

                },


                to: [

                    {

                        email:
                            mailOptions.to

                    }

                ],


                subject:
                    mailOptions.subject,


                htmlContent:
                    mailOptions.html || "",


                textContent:
                    mailOptions.text || undefined

            };


            // ==========================================
            // SEND EMAIL USING BREVO HTTPS API
            // ==========================================

            const response =
                await axios.post(

                    "https://api.brevo.com/v3/smtp/email",

                    emailData,

                    {

                        headers: {

                            "api-key":
                                process.env.BREVO_API_KEY,

                            "Content-Type":
                                "application/json",

                            "Accept":
                                "application/json"

                        },


                        timeout:
                            20000

                    }

                );


            // ==========================================
            // SUCCESS LOG
            // ==========================================

            console.log(
                "✅ Brevo email sent successfully."
            );


            console.log(
                "Brevo Message ID:",
                response.data?.messageId || "N/A"
            );


            return response.data;

        }

        catch (error) {

            // ==========================================
            // ERROR LOG
            // ==========================================

            console.error(
                "❌ Brevo Email API Error:"
            );


            if (
                error.response
            ) {

                console.error(
                    "Status:",
                    error.response.status
                );


                console.error(
                    "Response:",
                    error.response.data
                );

            }

            else {

                console.error(
                    "Message:",
                    error.message
                );

            }


            throw error;

        }

    }

};


// ======================================================
// EXPORT
// ======================================================

module.exports =
    transporter;