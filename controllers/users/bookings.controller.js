const db = require("../../db");
exports.createBooking = async (req, res) => {
  try {
    // Lấy user_id từ thông tin đã xác thực, ví dụ req.user.user_id hoặc req.user.id
    const user_id = req.user.id;
    const { field_id, date, start_time, end_time, name, phone, email, note } =
      req.body;

    // Kiểm tra thiếu thông tin (thêm user_id)
    if (
      !user_id ||
      !field_id ||
      !date ||
      !start_time ||
      !end_time ||
      !name ||
      !phone ||
      !email
    ) {
      return res.status(400).json({ message: "Thiếu thông tin đặt sân" });
    }

    // Ghi vào CSDL: thêm user_id cột đầu tiên
    await db.execute(
      `INSERT INTO bookings (user_id, field_id, date, start_time, end_time, name, phone, email, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, field_id, date, start_time, end_time, name, phone, email, note]
    );

    res.status(201).json({ message: "Đặt sân thành công!" });
  } catch (error) {
    console.error("Error booking:", error);
    res.status(500).json({ message: "Lỗi server khi đặt sân" });
  }
};
