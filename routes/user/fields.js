// routes/field.route.js
const express = require("express");
const router = express.Router();
const fieldController = require("../../controllers/users/fields.controller");

// GET /fields
router.get("/", fieldController.getFields);

module.exports = router;
