const express = require("express");
const path = require("path");
const session = require("express-session");

require("dotenv").config();

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const { isAuthenticated } = require("./middleware/authMiddleware");
const interviewRoutes = require("./routes/interviewRoutes");
const performanceRoutes = require("./routes/performanceRoutes");

const app = express();


// =========================
// EJS CONFIGURATION
// =========================

app.set("view engine", "ejs");
app.set(
    "views",
    path.join(
        __dirname,
        "views"
    )
);


// =========================
// MIDDLEWARE
// =========================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =========================
// SESSION
// =========================
//
// IMPORTANT:
// Session MUST come before protected routes.
//
// =========================

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "ai-interview-secret",

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {
            maxAge:
                1000 *
                60 *
                60 *
                24
        }
    })
);


// =========================
// BASIC ROUTES
// =========================

app.get("/", (req, res) => {

    res.render("welcome");

});


// =========================
// LOGIN PAGE
// =========================

app.get(
    "/login",
    (req, res) => {

        res.render(
            "login",
            {
                error:
                    req.query.error ||
                    null,

                success:
                    req.query.success ||
                    null
            }
        );

    }
);


// =========================
// REGISTER PAGE
// =========================

app.get(
    "/register",
    (req, res) => {

        res.render(
            "register",
            {
                error:
                    req.query.error ||
                    null
            }
        );

    }
);


// =========================
// DASHBOARD
// =========================

app.get(
    "/dashboard",
    isAuthenticated,
    (req, res) => {

        res.render(
            "dashboard",
            {
                user:
                    req.session.user
            }
        );

    }
);


// =========================
// ROUTES
// =========================
//
// IMPORTANT:
// All routes come AFTER session middleware.
//
// =========================

app.use(
    "/",
    authRoutes
);

app.use(
    "/resume",
    resumeRoutes
);

app.use(
    "/interview",
    interviewRoutes
);

app.use(
    "/performance",
    performanceRoutes
);


// =========================
// TEST ROUTE
// =========================

app.get(
    "/test",
    (req, res) => {

        res.send(
            "AI Interview Platform Backend is Working!"
        );

    }
);


// =========================
// SERVER
// =========================

const PORT =
    process.env.PORT ||
    3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);