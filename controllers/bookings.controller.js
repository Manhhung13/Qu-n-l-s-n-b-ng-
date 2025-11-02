const db = require("../db"); // Kết nối mysql2/promise

// Giả sử đã cấu hình middleware xác thực JWT, gán user info vào req.user

exports.createBooking = async (req, res) => {
  try {
    const { customerName, phone, email, fieldId, date, timeSlot } = req.body;
    const userId = req.user.id;

    if (
      !userId ||
      !customerName ||
      !phone ||
      !email ||
      !fieldId ||
      !date ||
      !timeSlot
    ) {
      return res.status(400).json({ message: "Thiếu thông tin đặt sân!" });
    }

    // Tách khung giờ
    const [start_time, end_time] = timeSlot.split("-").map((s) => s.trim());

    // Kiểm tra bản ghi đã xác nhận cho sân trong khung giờ và ngày đó
    const checkSql = `
      SELECT * FROM bookings
      WHERE field_id = ?
        AND date = ?
        AND start_time = ?
        AND end_time = ?
        AND status = ?
      LIMIT 1
    `;
    const [exist] = await db.query(checkSql, [
      fieldId,
      date,
      start_time,
      end_time,
      "Đã xác nhận",
    ]);
    if (exist.length > 0) {
      return res.status(409).json({
        message:
          "Sân đã được đặt và xác nhận vào thời gian này. Vui lòng chọn khung giờ khác!",
      });
    }

    // Thêm booking mới
    const sql = `
      INSERT INTO bookings (user_id, name, phone, email, field_id, date, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId,
      customerName,
      phone,
      email,
      fieldId,
      date,
      start_time,
      end_time,
      "Chờ xác nhận",
    ];
    await db.query(sql, params);

    res.json({ message: "Đặt sân thành công!" });
  } catch (err) {
    console.log("Booking Error:", err);
    res.status(500).json({ message: "Lỗi khi đặt sân!" });
  }
};

// Lấy danh sách sân (để dùng trong frontend chọn combobox)
exports.getFields = async (req, res) => {
  try {
    const [fields] = await db.query("SELECT * FROM fields");
    res.json(fields);
  } catch (err) {
    res.status(500).json({ message: "Không lấy được danh sách sân." });
  }
};
