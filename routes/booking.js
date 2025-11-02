const express = require("express");
const {
  listBookings,
  createBooking,
} = require("../controllers/bookings.controller");
const auth = require("../middlewares/auth");
const router = express.Router();
router.get("/", listBookings);
router.post("/", auth, createBooking);

module.exports = router;
