const db = require("../db");

exports.listBookings = async (req, res) => {
  const { userId } = req.query;
  let rows;
  if (userId) {
    [rows] = await db.query("SELECT * FROM bookings WHERE user_id = ?", [
      userId,
    ]);
  } else {
    [rows] = await db.query("SELECT * FROM bookings");
  }
  res.json(rows);
};

exports.createBooking = async (req, res) => {
  const { user_id, field_id, date, start_time, end_time } = req.body;
  await db.query(
    "INSERT INTO bookings (user_id, field_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
    [user_id, field_id, date, start_time, end_time]
  );
  res.json({ message: "Đặt sân thành công!" });
};
