const db = require("../../db");

// Lưu các setTimeout để sau này nếu cần hủy hay kiểm soát dễ hơn
const timeouts = new Map();
exports.createBooking = async (req, res) => {
  try {
    // Lấy user_id từ phiên đăng nhập
    const user_id = req.user.id; // Nếu dùng JWT middleware hoặc session

    const { field_id, date, start_time, end_time, name, phone, email, note } =
      req.body;

    // Nhớ thêm user_id vào câu INSERT và mảng tham số
    const [result] = await db.execute(
      `INSERT INTO bookings 
      (user_id, field_id, date, start_time, end_time, name, phone, email, note, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'chờ xác nhận', NOW())`,
      [user_id, field_id, date, start_time, end_time, name, phone, email, note]
    );

    const bookingId = result.insertId;

    const timeoutId = setTimeout(
      async () => {
        console.log("Running timeout for bookingId:", bookingId);
        const [checkResult] = await db.execute(
          `SELECT status FROM bookings WHERE id = ?`,
          [bookingId]
        );
        console.log("Timeout checkResult:", checkResult);
        if (
          checkResult.length > 0 &&
          checkResult[0].status === "Chờ xác nhận"
        ) {
          await db.execute(`DELETE FROM bookings WHERE id = ?`, [bookingId]);
          console.log("Deleted booking:", bookingId);
        }
        timeouts.delete(bookingId);
      },
      15 * 60 * 1000
    );

    timeouts.set(bookingId, timeoutId);

    res.status(201).json({
      id: bookingId,
      message: "Booking created, pending confirmation",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
