const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET = process.env.SECRET;

// Đăng ký tài khoản
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await db.query(
    "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
    [name, email, hash, phone]
  );
  res.json({ message: "Đăng ký thành công!" });
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (!rows.length)
    return res.status(400).json({ message: "Sai email/mật khẩu" });
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Sai email/mật khẩu" });
  delete user.password;
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
    expiresIn: "7d",
  });
  res.json({ user, token });
};
