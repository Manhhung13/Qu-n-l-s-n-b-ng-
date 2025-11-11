const express = require("express");
const router = express.Router();
const Dash_board = require("../../controllers/manager/Dash_board.controller");

router.get("/fields", Dash_board.getAllFields);
router.get("/bookings", Dash_board.getBookingsByDate);
router.get("/stats/today", Dash_board.getStatsToday);

module.exports = router;
