// backend/routes/manager/fields.js
const express = require("express");
const router = express.Router();
const managerFieldsController = require("../../controllers/manager/get_field.controller");

// GET /manager/fields
router.get("/", managerFieldsController.getFieldsForManager);

module.exports = router;
