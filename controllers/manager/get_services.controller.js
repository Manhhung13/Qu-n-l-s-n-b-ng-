const db = require("../../db");

exports.getServices = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM services");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể lấy danh sách dịch vụ" });
  }
};
