const mysql = require("mysql2");


// ==========================================
// DATABASE CONFIGURATION
// LOCAL XAMPP + AIVEN PRODUCTION
// ==========================================

const dbConfig = {

    host:
        process.env.DB_HOST ||
        "localhost",

    port:
        Number(
            process.env.DB_PORT || 3306
        ),

    user:
        process.env.DB_USER ||
        "root",

    password:
        process.env.DB_PASSWORD ||
        "",

    database:
        process.env.DB_NAME ||
        "ai_interview",

    // Keep connection alive
    enableKeepAlive: true,

    keepAliveInitialDelay: 0

};


// ==========================================
// ENABLE SSL ONLY FOR PRODUCTION DATABASE
// ==========================================

if (
    process.env.DB_HOST &&
    process.env.DB_HOST !== "localhost" &&
    process.env.DB_HOST !== "127.0.0.1"
) {

    dbConfig.ssl = {
        rejectUnauthorized: false
    };

}


// ==========================================
// CREATE MYSQL CONNECTION
// ==========================================

const db =
    mysql.createConnection(
        dbConfig
    );


// ==========================================
// CONNECT TO DATABASE
// ==========================================

db.connect(
    (err) => {

        if (
            err
        ) {

            console.error(
                "❌ MySQL connection failed:",
                err.message
            );

            return;

        }


        console.log(
            "✅ MySQL connected successfully!"
        );

    }
);


// ==========================================
// HANDLE DATABASE ERRORS
// ==========================================

db.on(
    "error",
    (err) => {

        console.error(
            "MySQL connection error:",
            err.message
        );

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports =
    db;