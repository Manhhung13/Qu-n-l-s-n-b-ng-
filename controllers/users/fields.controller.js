// controllers/fieldsController.js
const db = require("../../db"); // import db kết nối DB

function buildPriceCondition(price) {
  switch (price) {
    case "1":
      return "AND f.price < 300000";
    case "2":
      return "AND f.price BETWEEN 300000 AND 500000";
    case "3":
      return "AND f.price > 500000";
    default:
      return "";
  }
}

exports.getFields = async (req, res) => {
  try {
    const {
      q = "",
      type = "",
      price = "",
      date,
      start_time,
      end_time,
    } = req.query;

    // Kiểm tra bắt buộc param date và khung giờ phải có nếu cần thiết
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ message: "Thiếu ngày hoặc khung giờ" });
    }

    const priceCondition = buildPriceCondition(price);

    // Query tìm tất cả sân kèm trạng thái booked dựa trên ngày và khung giờ
    const sql = `
      SELECT f.*,
       (EXISTS (
         SELECT 1 FROM bookings b
         WHERE b.field_id = f.id
           AND b.date = ?
           AND b.start_time < TIME(?)
           AND b.end_time > TIME(?)
           AND b.status IN ('Đã đặt', 'Đã xác nhận','Chờ xác nhận')
  )
           Or f.status <> 'sân hoạt động bình thường' ) AS booked
  FROM fields f
 WHERE f.name LIKE ?
   AND (? = '' OR f.type = ?)
   ${priceCondition}
 ORDER BY f.name
    `;

    const params = [date, end_time, start_time, `%${q}%`, type, type];

    const [rows] = await db.execute(sql, params);

    const result = rows.map((row) => ({
      ...row,
      booked: Boolean(row.booked),
    }));

    res.json(result);
  } catch (error) {
    console.error("Lỗi lấy danh sách sân:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sân" });
  }
};
