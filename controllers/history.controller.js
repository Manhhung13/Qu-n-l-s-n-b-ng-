const db = require("../db");
// Giả sử đã dùng middleware xác thực, userId lấy từ JWT hoặc session.
exports.listHistory = async (req, res) => {
  // giả định userId được lấy từ middleware xác thực
  const userId = req.user.id;
  const query = `
    SELECT
      bookings.id AS _id,
      fields.name,
      fields.type,
      fields.location,
      fields.price,
      bookings.date,
      bookings.start_time,
      bookings.end_time,  
      bookings.status
    FROM bookings
    JOIN fields ON bookings.field_id = fields.id
    WHERE bookings.user_id = ?
    ORDER BY bookings.date DESC
  `;
  db.query(query, [userId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Không thể lấy lịch sử đặt sân!" });
    }
    const history = results.map((row) => ({
      _id: row._id,
      field: {
        name: row.name,
        type: row.type,
        location: row.location,
        price: row.price,
      },
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      status: row.status,
    }));
    res.json(history);
  });
};
