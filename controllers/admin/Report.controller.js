const db = require("../../db");

exports.getReports = async (req, res) => {
  try {
    // nhận tham số lọc từ query
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Truy vấn tổng lượt đặt và tổng doanh thu
    const [summaryRows] = await db.query(
      `SELECT 
         COUNT(*) AS totalBookings, 
         SUM(price) AS totalRevenue 
       FROM bookings 
       WHERE MONTH(date) = ? AND YEAR(date) = ?`,
      [month, year],
    );

    // Truy vấn top sân theo số lượt đặt
    const [topFields] = await db.query(
      `SELECT fields.name, COUNT(*) AS count
       FROM bookings 
       JOIN fields ON bookings.field_id = fields.id
       WHERE MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY fields.name
       ORDER BY count DESC
       LIMIT 1`,
      [month, year],
    );

    // Truy vấn top khách hàng VIP
    const [topCustomers] = await db.query(
      `SELECT users.name, COUNT(*) AS count
       FROM bookings 
       JOIN users ON bookings.customer_id = users.id
       WHERE MONTH(date) = ? AND YEAR(date) = ?
       GROUP BY users.name
       ORDER BY count DESC
       LIMIT 1`,
      [month, year],
    );

    // Lấy tất cả các lượt đặt chi tiết
    const [bookings] = await db.query(
      `SELECT bookings.*, fields.name AS field_name, users.name AS customerName
       FROM bookings
       JOIN fields ON bookings.field_id = fields.id
       JOIN users ON bookings.customer_id = users.id
       WHERE MONTH(bookings.date) = ? AND YEAR(bookings.date) = ?
       ORDER BY bookings.date DESC`,
      [month, year],
    );

    res.json({
      summary: {
        totalBookings: summaryRows[0]?.totalBookings || 0,
        totalRevenue: summaryRows[0]?.totalRevenue || 0,
        topFields,
        topCustomers,
      },
      bookings: bookings.map((b) => ({
        _id: b.id,
        date: b.date,
        field: { name: b.field_name },
        customerName: b.customerName,
        price: b.price,
        status: b.status,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Không thể tải báo cáo!" });
  }
};
