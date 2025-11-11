const express = require("express");
const router = express.Router();
const fieldController = require("../../controllers/admin/Field.controller");

// Lấy toàn bộ danh sách sân
router.get("/", fieldController.getAllFields);

// Thêm sân mới
router.post("/", fieldController.createField);

// Xóa sân
router.delete("/:id", fieldController.deleteField);

// Cập nhật trạng thái sân
router.put("/:id/status", fieldController.updateFieldStatus);

module.exports = router;
