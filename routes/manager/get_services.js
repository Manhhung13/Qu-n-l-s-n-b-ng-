const express = require("express");
const router = express.Router();
const get_services = require("../../controllers/manager/get_services.controller");
router.get("/", get_services.getServices);
module.exports = router;
