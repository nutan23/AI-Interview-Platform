const express =
    require("express");


const router =
    express.Router();


const performanceController =
    require(
        "../controllers/performanceController"
    );


// ==========================================
// PERFORMANCE PAGE
// ==========================================

router.get(
    "/",
    performanceController.showPerformance
);


module.exports =
    router;