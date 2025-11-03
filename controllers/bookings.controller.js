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

exports.getBookingHistory = async (req, res) => {
  const userId = req.user.id; // User ID từ xác thực, ví dụ middleware bỏ user vào req

  if (!userId) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User chưa đăng nhập" });
  }

  try {
    const sql = `
      SELECT 
        b.id AS _id, b.date, b.start_time, b.end_time, b.status,
        f.name, f.type, f.location, f.price
      FROM bookings b
      INNER JOIN fields f ON b.field_id = f.id
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.start_time
    `;

    const [rows] = await db.execute(sql, [userId]);

    const history = rows.map((item) => ({
      _id: item._id,
      date: item.date,
      start_time: item.start_time,
      end_time: item.end_time,
      status: item.status,
      field: {
        name: item.name,
        type: item.type,
        location: item.location,
        price: item.price,
      },
    }));

    res.json(history);
  } catch (error) {
    console.error("Lỗi lấy lịch sử:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
