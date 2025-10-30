const db = require("../db");

// Lấy danh sách sân bóng
exports.listFields = async (req, res) => {
  const [rows] = await db.query("SELECT * FROM fields");
  res.json(rows);
};

// Thêm sân bóng (chỉ admin, manager)
exports.addField = async (req, res) => {
  const { name, type, location, image_url, price, status, description } =
    req.body;
  await db.query(
    "INSERT INTO fields (name, type, location, image_url, price, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [name, type, location, image_url, price, status, description]
  );
  res.json({ message: "Thêm sân thành công" });
};

// Xóa sân bóng (chỉ admin)
exports.deleteField = async (req, res) => {
  const fieldId = req.params.id;
  await db.query("DELETE FROM fields WHERE id = ?", [fieldId]);
  res.json({ message: "Xóa sân thành công" });
};

// Sửa/cập nhật sân bóng (chỉ admin, manager)
exports.updateField = async (req, res) => {
  const fieldId = req.params.id;
  const { name, type, location, image_url, price, status, description } =
    req.body;
  await db.query(
    "UPDATE fields SET name=?, type=?, location=?, image_url=?, price=?, status=?, description=? WHERE id=?",
    [name, type, location, image_url, price, status, description, fieldId]
  );
  res.json({ message: "Cập nhật sân thành công" });
};
