const db = require("../../db");

exports.getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Tổng doanh thu
    const [totalRevenueRow] = await db.execute(
      `SELECT IFNULL(SUM(
          GREATEST(ROUND(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) / 90), 1) * f.price + COALESCE(b.extraFee, 0)
        ), 0) AS totalRevenue
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       WHERE b.date BETWEEN ? AND ?`,
      [startDate, endDate]
    );
    const totalRevenue = totalRevenueRow[0].totalRevenue;

    // Tổng số đơn
    const [totalOrdersRow] = await db.execute(
      "SELECT COUNT(*) AS totalOrders FROM bookings WHERE date BETWEEN ? AND ?",
      [startDate, endDate]
    );
    const totalOrders = totalOrdersRow[0].totalOrders;

    // Khách hàng quay lại
    const [returningCustomersRow] = await db.execute(
      `SELECT COUNT(DISTINCT user_id) AS returningCustomers
       FROM bookings
       WHERE date BETWEEN ? AND ?
         AND user_id IN (
           SELECT user_id FROM bookings GROUP BY user_id HAVING COUNT(*) > 1
         )`,
      [startDate, endDate]
    );
    const returningCustomers = returningCustomersRow[0].returningCustomers;

    // Doanh thu theo ngày
    const [revenueByDayRows] = await db.execute(
      `SELECT
         b.date,
         IFNULL(SUM(
           GREATEST(ROUND(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) / 90), 1) * f.price + COALESCE(b.extraFee, 0)
         ), 0) AS revenue
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       WHERE b.date BETWEEN ? AND ?
       GROUP BY b.date ORDER BY b.date`,
      [startDate, endDate]
    );
    const revenueByDay = revenueByDayRows.map((row) => ({
      date: row.date,
      revenue: row.revenue,
    }));

    // Doanh thu theo sân
    const [revenueByFieldRows] = await db.execute(
      `SELECT
         f.name AS field,
         IFNULL(SUM(
           GREATEST(ROUND(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) / 90), 1) * f.price + COALESCE(b.extraFee, 0)
         ), 0) AS revenue
       FROM bookings b
       JOIN fields f ON b.field_id = f.id
       WHERE b.date BETWEEN ? AND ?
       GROUP BY f.name`,
      [startDate, endDate]
    );
    const revenueByField = revenueByFieldRows.map((row) => ({
      field: row.field,
      revenue: row.revenue,
    }));

    // Danh sách đơn đặt
    const [ordersRows] = await db.execute(
      `SELECT
         b.id AS orderId,
         u.name AS customerName,
         f.name AS fieldName,
         CONCAT(b.start_time, '-', b.end_time) AS timeSlot,
         b.status,
         (GREATEST(
           ROUND(TIMESTAMPDIFF(MINUTE, b.start_time, b.end_time) / 90), 1
         ) * f.price + COALESCE(b.extraFee, 0)) AS amount
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN fields f ON b.field_id = f.id
       WHERE b.date BETWEEN ? AND ?
       ORDER BY b.date DESC
       LIMIT 100`,
      [startDate, endDate]
    );
    console.log("RevenueByField", revenueByField);
    res.json({
      stats: { totalRevenue, totalOrders, returningCustomers },
      revenueByDay,
      revenueByField,
      orders: ordersRows,
    });
  } catch (err) {
    console.error("Error fetching dashboard:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
