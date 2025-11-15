const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");

// Route GET endpoint cho dashboard admin
router.get("/", dashboardController.getDashboardData);

module.exports = router;
