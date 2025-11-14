const express = require("express");
const router = express.Router();
const Service_Manager = require("../../controllers/admin/Service_Manager.controller");

router.get("/", Service_Manager.getServices);
router.post("/", Service_Manager.createService);
router.put("/:id", Service_Manager.updateService);
router.delete("/:id", Service_Manager.deleteService);

module.exports = router;
