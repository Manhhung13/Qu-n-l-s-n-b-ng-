const db = require("../../db");
exports.getFields = async (req, res) => {
  // <-- phải thêm 'async' ở đây
  const { type, status, price, q } = req.query;
  console.log("type:", type, "| status:", status, "| price:", price, "| q:", q);

  let sql = "SELECT * FROM fields WHERE 1=1";
  let params = [];

  if (type) {
    console.log("LOG type trước push:", type, typeof type);
    sql += " AND type = ?";
    params.push(type);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (price) {
    if (price === "1") {
      sql += " AND price < 300000";
    } else if (price === "2") {
      sql += " AND price >= 300000 AND price <= 500000";
    } else if (price === "3") {
      sql += " AND price > 500000";
    }
  }
  if (q) {
    sql += " AND (name LIKE ? OR location LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  console.log("SQL:", sql);
  console.log("Params:", params);

  try {
    const [results] = await db.query(sql, params);
    console.log("DB Results:", results);
    res.json(results);
  } catch (err) {
    console.log("DB Error:", err);
    res.status(500).json({ message: "Lỗi truy vấn dữ liệu!" });
  }
};
