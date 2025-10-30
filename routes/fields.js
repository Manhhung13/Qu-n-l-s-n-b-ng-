const express = require("express");
const {
  listFields,
  addField,
  deleteField,
  updateField,
} = require("../controllers/fields.controller");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/role");

const router = express.Router();

router.get("/", listFields);
router.post("/", auth, requireRole("admin", "manager"), addField);
router.delete("/:id", auth, requireRole("admin"), deleteField);
router.put("/:id", auth, requireRole("admin", "manager"), updateField);

module.exports = router;
