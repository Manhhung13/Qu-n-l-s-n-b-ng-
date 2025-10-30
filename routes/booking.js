const express = require("express");
const {
  listBookings,
  createBooking,
} = require("../controllers/bookings.controller");
const router = express.Router();
router.get("/", listBookings);
router.post("/", createBooking);

module.exports = router;
