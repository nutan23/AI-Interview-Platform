const dns = require("dns");
const mysql = require("mysql2");


// ==========================================
// PREFER IPV4
// ==========================================
//
// Some cloud environments may try IPv6 first.
// TiDB public endpoint works reliably over IPv4.
//
dns.setDefaultResultOrder("ipv4first");


// ==========================================
// DATABASE CONFIGURATION
// LOCAL MYSQL + TIDB CLOUD
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


    // ==========================================
    // CONNECTION TIMEOUT
    // ==========================================

    connectTimeout:
        30000,


    // ==========================================
    // KEEP CONNECTION ALIVE
    // ==========================================

    enableKeepAlive:
        true,

    keepAliveInitialDelay:
        0

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

        rejectUnauthorized:
            false

    };

}


// ==========================================
// CREATE CONNECTION
// ==========================================

const db =
    mysql.createConnection(
        dbConfig
    );


// ==========================================
// CONNECT
// ==========================================

db.connect(
    (err) => {

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

            console.error(
                "Host:",
                process.env.DB_HOST
            );

            console.error(
                "Port:",
                process.env.DB_PORT
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

    }
);


// ==========================================
// DATABASE ERROR HANDLER
// ==========================================

db.on(
    "error",
    (err) => {

        console.error(
            "❌ MySQL connection error:"
        );

        console.error(
            "Code:",
            err.code
        );

        console.error(
            "Message:",
            err.message
        );

    }
);


// ==========================================
// EXPORT
// ==========================================

module.exports = db;