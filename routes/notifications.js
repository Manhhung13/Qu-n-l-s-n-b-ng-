const express = require("express");
const notificationController = require("../controllers/notifications.controller");
const auth = require("../middlewares/auth");
const router = express.Router();
router.get("/", auth, notificationController.getNotifications);
router.put("/:id/confirm", auth, notificationController.confirmNotification);
router.delete("/:id", auth, notificationController.deleteNotification);
module.exports = router;
