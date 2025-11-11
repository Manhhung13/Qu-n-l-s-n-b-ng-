const db = require("../../db"); // File kết nối MySQL đã cấu hình (dùng mysql2/promise)

// Lấy danh sách sân
exports.getAllFields = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM fields");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching fields" });
  }
};

// Lấy lịch đặt sân theo ngày
exports.getBookingsByDate = async (req, res) => {
  const { date } = req.query;
  try {
    const sql = `
      SELECT 
        b.id,
        b.date,
        b.name,
        b.status,
        b.start_time,
        b.end_time,
        CONCAT(DATE_FORMAT(b.start_time, '%H:%i'), ' - ', DATE_FORMAT(b.end_time, '%H:%i')) AS timeSlot,
        f.name as fieldName
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      WHERE b.date = ?
    `;
    const [results] = await db.query(sql, [date]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
};

// Thống kê nhanh hôm nay với doanh thu tách sân và dịch vụ
exports.getStatsToday = async (req, res) => {
  function getVietnamDateYYYYMMDD() {
    const now = new Date();
    // Lấy ngày theo timezone Việt Nam
    const vnDate = now.toLocaleDateString("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    return vnDate;
  }

  const date = getVietnamDateYYYYMMDD();
  console.log("Fetching stats for date:", date);
  try {
    // Tổng booking
    const totalBookingsQuery =
      "SELECT COUNT(*) as totalBookings FROM bookings WHERE date = ?";
    const [totalBookingsResult] = await db.query(totalBookingsQuery, [date]);
    const totalBookings = totalBookingsResult[0].totalBookings;

    // Tổng sân trống
    const freeFieldsQuery =
      "SELECT COUNT(*) as freeFields FROM fields WHERE status = 'sân hoạt động bình thường'";
    const [freeFieldsResult] = await db.query(freeFieldsQuery);
    const freeFields = freeFieldsResult[0].freeFields;

    // Doanh thu đặt sân
    const fieldRevenueQuery = `
     SELECT 
    COALESCE(
        SUM(
            GREATEST(
                ROUND(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) / 90), 1
            ) * f.price
        ), 
        0
    ) AS fieldRevenue
FROM 
    bookings b
JOIN 
    fields f ON b.field_id = f.id
WHERE 
    b.date = ? 
    AND b.status = 'Hoàn thành';

    `;
    const [fieldRevenueResult] = await db.query(fieldRevenueQuery, [date]);
    const fieldRevenue = fieldRevenueResult[0].fieldRevenue;

    // Doanh thu dịch vụ
    const serviceRevenueQuery = `
      SELECT COALESCE(SUM(s.price * bs.quantity), 0) as serviceRevenue
      FROM bookings b
      JOIN booking_services bs ON b.id = bs.booking_id
      JOIN services s ON bs.service_id = s.id
      WHERE b.date = ? AND b.status = 'Hoàn thành'
    `;
    const [serviceRevenueResult] = await db.query(serviceRevenueQuery, [date]);
    const serviceRevenue = serviceRevenueResult[0].serviceRevenue;

    res.json({
      totalBookings,
      freeFields,
      fieldRevenue,
      serviceRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching statistics" });
  }
};
