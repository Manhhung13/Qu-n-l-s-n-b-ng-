const db = require("../db");

const db = require("../db");

// Lấy danh sách booking theo ngày (có kèm thông tin sân và khách hàng)
exports.listBookings = async (req, res) => {
  try {
    const { userId, date } = req.query;
    let query = `
      SELECT 
        b.id, 
        b.user_id, 
        b.field_id, 
        b.date, 
        b.start_time, 
        b.end_time,
        b.status,
        b.note,
        f.name as field_name,
        f.type as field_type,
        f.location as field_location,
        u.name as customer_name,
        u.email as customer_email
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    let params = [];

    if (userId) {
      query += " AND b.user_id = ?";
      params.push(userId);
    }

    if (date) {
      query += " AND DATE(b.date) = ?";
      params.push(date);
    }

    query += " ORDER BY b.start_time ASC";

    const [rows] = await db.query(query, params);

    // Format response theo cấu trúc giao diện React
    const formattedRows = rows.map((booking) => ({
      _id: booking.id,
      field: {
        name: booking.field_name,
        type: booking.field_type,
        location: booking.field_location,
      },
      customerName: booking.customer_name,
      date: booking.date,
      timeSlot: `${booking.start_time} - ${booking.end_time}`,
      status: booking.status || "pending",
      note: booking.note,
    }));

    res.json(formattedRows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy booking!", error: error.message });
  }
};

exports.createBooking = async (req, res) => {
  const { user_id, field_id, date, start_time, end_time } = req.body;
  await db.query(
    "INSERT INTO bookings (user_id, field_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)",
    [user_id, field_id, date, start_time, end_time]
  );
  res.json({ message: "Đặt sân thành công!" });
};
