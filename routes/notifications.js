const express = require("express");
const {
  listNotifications,
  notifyBookingConfirm,
} = require("../controllers/notifications.controller");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/role");
const router = express.Router();
router.get("/", auth, listNotifications);
router.post(
  "/booking-confirm",
  auth,
  requireRole("manager", "admin"),
  notifyBookingConfirm
);
module.exports = router;
