const express = require("express");
const router = express.Router();
const Staff_Manager = require("../../controllers/admin/Staff_Manager.controller");

router.get("/", Staff_Manager.getAllStaffs);
router.post("/", Staff_Manager.createStaff);
router.put("/:id", Staff_Manager.updateStaff);
router.delete("/:id", Staff_Manager.deleteStaff);

module.exports = router;
