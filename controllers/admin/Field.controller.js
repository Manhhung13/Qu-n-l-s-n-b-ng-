const db = require("../../db");

// Lấy danh sách sân
exports.getAllFields = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM fields ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Không lấy được danh sách sân" });
  }
};

// Thêm sân mới
exports.createField = async (req, res) => {
  try {
    const { name, type, location, price } = req.body;
    const [result] = await db.query(
      "INSERT INTO fields (name, type, location, price) VALUES (?, ?, ?, ?)",
      [name, type, location, price]
    );
    const [fields] = await db.query("SELECT * FROM fields WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(fields[0]);
  } catch (err) {
    res.status(400).json({ error: "Thêm sân thất bại" });
  }
};

// Xóa sân
exports.deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM fields WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Xóa sân thất bại" });
  }
};

// Cập nhật trạng thái sân (chỉ field status)
exports.updateFieldStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Kiểm tra giá trị hợp lệ của status tại đây nếu muốn!
    await db.query("UPDATE fields SET status = ? WHERE id = ?", [status, id]);
    const [fields] = await db.query("SELECT * FROM fields WHERE id = ?", [id]);
    res.json(fields[0]);
  } catch (err) {
    res.status(400).json({ error: "Cập nhật trạng thái thất bại" });
  }
};
