const express = require("express");
const router = express.Router();
const bookingController = require("../../controllers/users/bookings.controller");

// POST /bookings (Tạo booking mới)
router.post("/", bookingController.createBooking);
// GET /fields (Db sân cho chọn sân trong form)
router.get("/fields", bookingController.getFields);
router.get("/getHistory", bookingController.getBookingHistory);
module.exports = router;
