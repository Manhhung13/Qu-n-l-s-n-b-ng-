// backend/controllers/manager/fields.controller.js
const db = require("../../db");

// Lấy danh sách sân cho manager
exports.getFieldsForManager = async (req, res) => {
  const sql = `
    SELECT 
      id,
      name,
      type,
      location,
      price,
      status
    FROM fields
    ORDER BY name ASC
  `;

  try {
    const [rows] = await db.query(sql);
    // trả trực tiếp rows cho frontend dùng
    res.json(rows);
  } catch (err) {
    console.error("getFieldsForManager error:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách sân" });
  }
};
