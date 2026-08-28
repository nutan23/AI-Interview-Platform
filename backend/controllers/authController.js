const bcrypt = require("bcrypt");
const crypto = require("crypto");

const db = require("../config/db");
const transporter = require("../config/email");


// ======================================================
// REGISTER USER
// ======================================================

exports.register = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Basic validation
        if (
            !name ||
            !email ||
            !password
        ) {

            return res.redirect(
                "/register?error=Please fill all fields"
            );

        }


        // Password length validation
        if (
            password.length < 6
        ) {

            return res.redirect(
                "/register?error=Password must be at least 6 characters"
            );

        }


        // Clean input
        const cleanName =
            name.trim();


        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        // Check whether email already exists
        const checkSql = `
            SELECT id
            FROM users
            WHERE email = ?
        `;


        db.query(
            checkSql,
            [
                cleanEmail
            ],
            async (err, results) => {

                if (
                    err
                ) {

                    console.error(
                        "Database error:",
                        err
                    );


                    return res.redirect(
                        "/register?error=Database error occurred"
                    );

                }


                // Email already registered
                if (
                    results.length > 0
                ) {

                    return res.redirect(
                        "/register?error=Email already registered"
                    );

                }


                try {

                    // Hash password
                    const hashedPassword =
                        await bcrypt.hash(
                            password,
                            10
                        );


                    // Insert user
                    const insertSql = `
                        INSERT INTO users
                        (
                            name,
                            email,
                            password
                        )
                        VALUES (?, ?, ?)
                    `;


                    db.query(
                        insertSql,
                        [
                            cleanName,
                            cleanEmail,
                            hashedPassword
                        ],
                        (err, result) => {

                            if (
                                err
                            ) {

                                console.error(
                                    "Registration error:",
                                    err
                                );


                                return res.redirect(
                                    "/register?error=Registration failed"
                                );

                            }


                            console.log(
                                "New user created:",
                                result.insertId
                            );


                            return res.redirect(
                                "/login?success=Registration successful"
                            );

                        }
                    );

                }

                catch (error) {

                    console.error(
                        "Password hashing error:",
                        error
                    );


                    return res.redirect(
                        "/register?error=Registration failed"
                    );

                }

            }
        );

    }

    catch (error) {

        console.error(
            "Register error:",
            error
        );


        return res.redirect(
            "/register?error=Something went wrong"
        );

    }

};



// ======================================================
// LOGIN USER
// ======================================================

exports.login = (
    req,
    res
) => {

    const {
        email,
        password
    } = req.body;


    // Basic validation
    if (
        !email ||
        !password
    ) {

        return res.redirect(
            "/login?error=Please enter email and password"
        );

    }


    // Clean email
    const cleanEmail =
        email
            .trim()
            .toLowerCase();


    const sql = `
        SELECT
            id,
            name,
            email,
            password
        FROM users
        WHERE email = ?
    `;


    db.query(
        sql,
        [
            cleanEmail
        ],
        async (err, results) => {

            if (
                err
            ) {

                console.error(
                    "Login database error:",
                    err
                );


                return res.redirect(
                    "/login?error=Database error occurred"
                );

            }


            // User not found
            if (
                results.length === 0
            ) {

                return res.redirect(
                    "/login?error=Invalid email or password"
                );

            }


            const user =
                results[0];


            try {

                // Compare password
                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                if (
                    !passwordMatch
                ) {

                    return res.redirect(
                        "/login?error=Invalid email or password"
                    );

                }


                // Create session
                req.session.user = {

                    id:
                        user.id,

                    name:
                        user.name,

                    email:
                        user.email

                };


                console.log(
                    "User logged in:",
                    user.email
                );


                return res.redirect(
                    "/dashboard"
                );

            }

            catch (error) {

                console.error(
                    "Password comparison error:",
                    error
                );


                return res.redirect(
                    "/login?error=Login failed"
                );

            }

        }
    );

};



// ======================================================
// LOGOUT USER
// ======================================================

exports.logout = (
    req,
    res
) => {

    req.session.destroy(
        (err) => {

            if (
                err
            ) {

                console.error(
                    "Logout error:",
                    err
                );


                return res.redirect(
                    "/dashboard"
                );

            }


            return res.redirect(
                "/login"
            );

        }
    );

};



// ======================================================
// SHOW FORGOT PASSWORD PAGE
// ======================================================

exports.showForgotPassword = (
    req,
    res
) => {

    return res.render(
        "forgotPassword",
        {

            error:
                null,

            success:
                null

        }
    );

};



// ======================================================
// FORGOT PASSWORD
// ======================================================

exports.forgotPassword = (
    req,
    res
) => {

    const {
        email
    } = req.body;


    // Check email
    if (
        !email
    ) {

        return res.render(
            "forgotPassword",
            {

                error:
                    "Please enter your email address",

                success:
                    null

            }
        );

    }


    // Clean email
    const cleanEmail =
        email
            .trim()
            .toLowerCase();


    // Find user
    const sql = `
        SELECT
            id,
            name,
            email
        FROM users
        WHERE email = ?
    `;


    db.query(
        sql,
        [
            cleanEmail
        ],
        (err, results) => {

            if (
                err
            ) {

                console.error(
                    "Forgot password database error:",
                    err
                );


                return res.render(
                    "forgotPassword",
                    {

                        error:
                            "Database error occurred",

                        success:
                            null

                    }
                );

            }


            // Email doesn't exist
            if (
                results.length === 0
            ) {

                return res.render(
                    "forgotPassword",
                    {

                        error:
                            "No account found with this email",

                        success:
                            null

                    }
                );

            }


            const user =
                results[0];


            // Generate secure random token
            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // Token expires after 15 minutes
            const expiry =
                new Date(
                    Date.now() +
                    15 * 60 * 1000
                );


            // Save token
            const updateSql = `
                UPDATE users

                SET
                    reset_token = ?,
                    reset_token_expiry = ?

                WHERE id = ?
            `;


            db.query(
                updateSql,
                [
                    resetToken,
                    expiry,
                    user.id
                ],
                async (err) => {

                    if (
                        err
                    ) {

                        console.error(
                            "Reset token database error:",
                            err
                        );


                        return res.render(
                            "forgotPassword",
                            {

                                error:
                                    "Could not create reset request",

                                success:
                                    null

                            }
                        );

                    }


                    // ==================================================
                    // RESET PASSWORD URL
                    // Production + Local
                    // ==================================================

                    const baseUrl =
                        process.env.APP_BASE_URL ||
                        `http://localhost:${process.env.PORT || 3000}`;


                    const resetUrl =
                        `${baseUrl}/reset-password/${resetToken}`;


                    // ==================================================
                    // EMAIL CONTENT
                    // ==================================================

                    const mailOptions = {

                        from:
                            `"AI Interview Platform" <${process.env.BREVO_SENDER_EMAIL}>`,

                        to:
                            user.email,

                        subject:
                            "AI Interview Platform - Password Reset",

                        html: `

                            <div style="
                                font-family: Arial, sans-serif;
                                max-width: 600px;
                                margin: auto;
                                padding: 25px;
                                background: #ffffff;
                                border: 1px solid #e5e7eb;
                                border-radius: 12px;
                            ">

                                <h2 style="
                                    color: #4338ca;
                                    margin-bottom: 20px;
                                ">
                                    Password Reset Request
                                </h2>


                                <p>
                                    Hello ${user.name},
                                </p>


                                <p>
                                    We received a request to reset
                                    your AI Interview Platform password.
                                </p>


                                <p>
                                    Click the button below to create
                                    a new password:
                                </p>


                                <p style="
                                    margin-top: 25px;
                                    margin-bottom: 25px;
                                ">

                                    <a
                                        href="${resetUrl}"
                                        style="
                                            display: inline-block;
                                            padding: 12px 22px;
                                            background: #4338ca;
                                            color: #ffffff;
                                            text-decoration: none;
                                            border-radius: 6px;
                                            font-weight: bold;
                                        "
                                    >
                                        Reset Password
                                    </a>

                                </p>


                                <p>
                                    This link will expire in
                                    <strong>15 minutes</strong>.
                                </p>


                                <p>
                                    If you did not request this,
                                    you can safely ignore this email.
                                </p>


                                <hr
                                    style="
                                        border: none;
                                        border-top: 1px solid #e5e7eb;
                                        margin-top: 25px;
                                    "
                                >


                                <p style="
                                    font-size: 12px;
                                    color: #6b7280;
                                ">
                                    AI Interview Preparation Platform
                                </p>

                            </div>

                        `

                    };


                    try {

                        // ==================================================
                        // SEND EMAIL
                        // config/email.js internally uses Brevo HTTPS API
                        // ==================================================

                        await transporter.sendMail(
                            mailOptions
                        );


                        console.log(
                            "Password reset email sent to:",
                            user.email
                        );


                        return res.render(
                            "forgotPassword",
                            {

                                error:
                                    null,

                                success:
                                    "Password reset link has been sent to your email."

                            }
                        );

                    }

                    catch (emailError) {

                        console.error(
                            "Email sending error:",
                            emailError
                        );


                        return res.render(
                            "forgotPassword",
                            {

                                error:
                                    "Unable to send reset email. Please try again.",

                                success:
                                    null

                            }
                        );

                    }

                }
            );

        }
    );

};



// ======================================================
// SHOW RESET PASSWORD PAGE
// ======================================================

exports.showResetPassword = (
    req,
    res
) => {

    const {
        token
    } = req.params;


    // Token missing
    if (
        !token
    ) {

        return res.render(
            "resetPassword",
            {

                token:
                    null,

                error:
                    "Invalid password reset link",

                success:
                    null

            }
        );

    }


    // Check token and expiry
    const sql = `
        SELECT id

        FROM users

        WHERE reset_token = ?
        AND reset_token_expiry > NOW()
    `;


    db.query(
        sql,
        [
            token
        ],
        (err, results) => {

            if (
                err
            ) {

                console.error(
                    "Reset token validation error:",
                    err
                );


                return res.render(
                    "resetPassword",
                    {

                        token:
                            null,

                        error:
                            "Database error occurred",

                        success:
                            null

                    }
                );

            }


            // Token invalid or expired
            if (
                results.length === 0
            ) {

                return res.render(
                    "resetPassword",
                    {

                        token:
                            null,

                        error:
                            "This password reset link is invalid or has expired.",

                        success:
                            null

                    }
                );

            }


            // Token valid
            return res.render(
                "resetPassword",
                {

                    token:
                        token,

                    error:
                        null,

                    success:
                        null

                }
            );

        }
    );

};



// ======================================================
// RESET PASSWORD
// ======================================================

exports.resetPassword = async (
    req,
    res
) => {

    const {
        token
    } = req.params;


    const {
        password,
        confirmPassword
    } = req.body;


    // Check fields
    if (
        !password ||
        !confirmPassword
    ) {

        return res.render(
            "resetPassword",
            {

                token:
                    token,

                error:
                    "Please fill all fields",

                success:
                    null

            }
        );

    }


    // Check password length
    if (
        password.length < 6
    ) {

        return res.render(
            "resetPassword",
            {

                token:
                    token,

                error:
                    "Password must be at least 6 characters",

                success:
                    null

            }
        );

    }


    // Check passwords match
    if (
        password !==
        confirmPassword
    ) {

        return res.render(
            "resetPassword",
            {

                token:
                    token,

                error:
                    "Passwords do not match",

                success:
                    null

            }
        );

    }


    // Validate token again
    const findUserSql = `
        SELECT id

        FROM users

        WHERE reset_token = ?
        AND reset_token_expiry > NOW()
    `;


    db.query(
        findUserSql,
        [
            token
        ],
        async (err, results) => {

            if (
                err
            ) {

                console.error(
                    "Reset password database error:",
                    err
                );


                return res.render(
                    "resetPassword",
                    {

                        token:
                            token,

                        error:
                            "Database error occurred",

                        success:
                            null

                    }
                );

            }


            // Token invalid or expired
            if (
                results.length === 0
            ) {

                return res.render(
                    "resetPassword",
                    {

                        token:
                            null,

                        error:
                            "This password reset link is invalid or has expired.",

                        success:
                            null

                    }
                );

            }


            const user =
                results[0];


            try {

                // Hash new password
                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        10
                    );


                // Update password and remove reset token
                const updateSql = `
                    UPDATE users

                    SET
                        password = ?,
                        reset_token = NULL,
                        reset_token_expiry = NULL

                    WHERE id = ?
                `;


                db.query(
                    updateSql,
                    [
                        hashedPassword,
                        user.id
                    ],
                    (err) => {

                        if (
                            err
                        ) {

                            console.error(
                                "Password update error:",
                                err
                            );


                            return res.render(
                                "resetPassword",
                                {

                                    token:
                                        token,

                                    error:
                                        "Could not update password",

                                    success:
                                        null

                                }
                            );

                        }


                        console.log(
                            "Password successfully reset for user ID:",
                            user.id
                        );


                        // Password successfully changed
                        return res.render(
                            "resetPassword",
                            {

                                token:
                                    null,

                                error:
                                    null,

                                success:
                                    "Password reset successful! You can now login with your new password."

                            }
                        );

                    }
                );

            }

            catch (error) {

                console.error(
                    "Password hashing error:",
                    error
                );


                return res.render(
                    "resetPassword",
                    {

                        token:
                            token,

                        error:
                            "Something went wrong while resetting password",

                        success:
                            null

                    }
                );

            }

        }
    );

};