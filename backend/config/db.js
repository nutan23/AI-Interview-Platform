const dns = require("dns");
const mysql = require("mysql2");

// ==========================================
// PREFER IPV4
// ==========================================

dns.setDefaultResultOrder("ipv4first");


// ==========================================
// DATABASE CONFIGURATION
// ==========================================

const dbConfig = {

    host: process.env.DB_HOST || "localhost",

    port: Number(
        process.env.DB_PORT || 3306
    ),

    user: process.env.DB_USER || "root",

    password: process.env.DB_PASSWORD || "",

    database: process.env.DB_NAME || "ai_interview",

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    connectTimeout: 30000,

    enableKeepAlive: true,

    keepAliveInitialDelay: 0
};


// ==========================================
// SSL FOR CLOUD DATABASE
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
// CREATE CONNECTION POOL
// ==========================================

const db = mysql.createPool(dbConfig);


// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

db.getConnection((err, connection) => {

    if (err) {

        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(
            "Code:",
            err.code
        );

        console.error(
            "Message:",
            err.message
        );

        return;
    }


    console.log(
        "✅ MySQL connected successfully!"
    );

    console.log(
        "✅ Database:",
        process.env.DB_NAME || "ai_interview"
    );


    // IMPORTANT:
    // Return connection back to pool
    connection.release();

});


// ==========================================
// EXPORT POOL
// ==========================================

module.exports = db;