const db = require("../../db");
const bcrypt = require("bcryptjs"); // thêm vào

const SALT_ROUNDS = 10;

// Lấy danh sách nhân viên
exports.getAllStaffs = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE role = 'manager' ORDER BY id DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error("Lỗi phía backend :", error);
    res.status(500).json({ message: "Lỗi lấy danh sách nhân viên" });
  }
};

// Tạo nhân viên mới
exports.createStaff = async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  try {
    // hash mật khẩu trước khi lưu
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    await db.execute(
      "INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, role, hash],
    );

    res.status(201).json({ message: "Tạo nhân viên thành công" });
  } catch (error) {
    console.error("Lỗi tạo nhân viên:", error);
    res.status(500).json({ message: "Lỗi tạo nhân viên" });
  }
};

// Cập nhật nhân viên
exports.updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role, password } = req.body;

  try {
    if (password && password.trim() !== "") {
      // nếu có nhập mật khẩu mới -> hash lại
      const hash = await bcrypt.hash(password, SALT_ROUNDS);

      await db.execute(
        "UPDATE users SET name = ?, email = ?, phone = ?, role = ?, password = ? WHERE id = ?",
        [name, email, phone, role, hash, id],
      );
    } else {
      // không đổi mật khẩu
      await db.execute(
        "UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?",
        [name, email, phone, role, id],
      );
    }

    res.json({ message: "Cập nhật nhân viên thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật nhân viên:", error);
    res.status(500).json({ message: "Lỗi cập nhật nhân viên" });
  }
};

// Xóa nhân viên
exports.deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "Xóa nhân viên thành công" });
  } catch (error) {
    console.error("Lỗi xóa nhân viên:", error);
    res.status(500).json({ message: "Lỗi xóa nhân viên" });
  }
};
