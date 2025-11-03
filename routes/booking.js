const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookings.controller");
const auth = require("../middlewares/auth");
// POST /bookings (Tạo booking mới)
router.post("/", auth, bookingController.createBooking);

// GET /fields (Db sân cho chọn sân trong form)
router.get("/fields", bookingController.getFields);
router.get("/getHistory", auth, bookingController.getBookingHistory);
module.exports = router;
