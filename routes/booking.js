const express = require("express");
const {
  listBookings,
  createBooking,
} = require("../controllers/bookings.controller");
const { listHistory } = require("../controllers/history.controller");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/role");
const router = express.Router();
router.get("/", listBookings);
router.post("/", auth, createBooking);
router.get("/history", auth, listHistory);
module.exports = router;
