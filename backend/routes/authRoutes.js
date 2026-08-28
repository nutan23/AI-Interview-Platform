const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

// =========================
// REGISTER
// =========================

router.post("/register", authController.register);


// =========================
// LOGIN
// =========================

router.post("/login", authController.login);


// =========================
// LOGOUT
// =========================

router.get("/logout", authController.logout);


// =========================
// FORGOT PASSWORD
// =========================

// Show forgot password page
router.get(
    "/forgot-password",
    authController.showForgotPassword
);

// Process forgot password
router.post(
    "/forgot-password",
    authController.forgotPassword
);


// =========================
// RESET PASSWORD
// =========================

// Show reset password page
router.get(
    "/reset-password/:token",
    authController.showResetPassword
);

// Update password
router.post(
    "/reset-password/:token",
    authController.resetPassword
);


module.exports = router;