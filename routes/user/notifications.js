const express = require("express");
const notificationController = require("../../controllers/users/notifications.controller");

const router = express.Router();
router.get("/", notificationController.getNotifications);
router.put("/:id/confirm", notificationController.confirmNotification);
router.delete("/:id", notificationController.deleteNotification);
module.exports = router;
