const express = require("express");
const {
  listNotifications,
} = require("../controllers/notifications.controller");
const router = express.Router();

router.get("/", listNotifications);

module.exports = router;
