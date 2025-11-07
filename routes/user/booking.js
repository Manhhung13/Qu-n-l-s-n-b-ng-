const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/users/bookings.controller");

// POST /bookings (Tạo booking mới)
router.post("/", bookingController.createBooking);

module.exports = router;
