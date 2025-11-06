const nodemailer = require("nodemailer");
const db = require("../../db");
const tk_email = process.env.tk_email;
const mk_email = process.env.mk_email;
exports.checkinBooking = async (req, res) => {
  const bookingId = req.params.id;
  const { services, totalServicesFee } = req.body;
  try {
    // Cập nhật trạng thái booking
    const updateBookingSQL = `
      UPDATE bookings
      SET status = 'Đã xác nhận'
      WHERE id = ?
    `;
    await db.execute(updateBookingSQL, [bookingId]);

    // Lấy field_id liên quan đến booking
    const [rows] = await db.execute(
      `SELECT field_id FROM bookings WHERE id = ?`,
      [bookingId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }
    const fieldId = rows[0].field_id;

    // Cập nhật trạng thái sân thành "Đã đặt"
    const updateFieldSQL = `
      UPDATE fields
      SET status = 'Đã đặt'
      WHERE id = ?
    `;
    await db.execute(updateFieldSQL, [fieldId]);

    // 2. Lưu các dịch vụ ngoài vào bảng booking_services (nếu có)
    if (Array.isArray(services) && services.length > 0) {
      for (const item of services) {
        await db.execute(
          "INSERT INTO booking_services (booking_id, service_id, quantity) VALUES (?, ?, ?)",
          [bookingId, item.serviceId, item.quantity]
        );
      }
    }

    // 3. Lấy thông tin booking & user/sân để thông báo
    const [bookingRows] = await db.execute(
      `SELECT b.*, u.email, u.name as userName, f.name as fieldName
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN fields f ON b.field_id = f.id
      WHERE b.id = ?`,
      [bookingId]
    );
    const booking = bookingRows[0];

    // 4. Gửi notification vào bảng notifications
    const notificationContent = `Sân [${booking.fieldName}] đã được xác nhận đặt thành công cho bạn.`;
    await db.execute(
      "INSERT INTO notifications (user_id, content, type, is_read, created_at, status) VALUES (?, ?, ?, 0, NOW(), ?)",
      [booking.user_id, notificationContent, "xac nhan", "chưa xác nhận"]
    );

    // 5. Gửi email cho user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tk_email",
        pass: "mk_email",
      },
    });

    const mailOptions = {
      from: "tk_email",
      to: booking.email,
      subject: "Xác nhận đặt sân thành công",
      html: `
        <h3>Đặt sân thành công!</h3>
        <p>Xin chào ${booking.userName},</p>
        <p>Bạn đã đặt thành công sân <b>${booking.fieldName}</b> vào ngày <b>${booking.date}</b> khung giờ <b>${booking.start_time} - ${booking.end_time}</b>.</p>
        <p>Chúng tôi sẽ hỗ trợ bạn tốt nhất khi đến sân!</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      // Không gửi lỗi về frontend/tránh chờ đợi, chỉ log
      if (error) console.log("Email error:", error);
      else console.log("Email sent:", info.response);
    });

    res.json({ message: "Check-in & gửi thông báo thành công!" });
  } catch (error) {
    console.error("Lỗi check-in:", error);
    res.status(500).json({ message: "Lỗi server khi check-in" });
  }
};

// Check-out: cập nhật trạng thái booking "Hoàn thành", cập nhật phí phát sinh (extraFee),
// đồng thời cập nhật trạng thái sân sang "Trống"
exports.checkoutBooking = async (req, res) => {
  const bookingId = req.params.id;
  const { extraFee = 0 } = req.body;

  try {
    // Cập nhật trạng thái booking và extra fee
    const updateBookingSQL = `
      UPDATE bookings
      SET status = 'Hoàn thành', extraFee = ?
      WHERE id = ?
    `;
    await db.execute(updateBookingSQL, [extraFee, bookingId]);

    // Lấy field_id liên quan đến booking
    const [rows] = await db.execute(
      `SELECT field_id FROM bookings WHERE id = ?`,
      [bookingId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }
    const fieldId = rows[0].field_id;

    // Cập nhật trạng thái sân thành "Trống"
    const updateFieldSQL = `
      UPDATE fields
      SET status = 'Trống'
      WHERE id = ?
    `;
    await db.execute(updateFieldSQL, [fieldId]);

    res.json({ message: "Check-out thành công" });
  } catch (error) {
    console.error("Lỗi check-out:", error);
    res.status(500).json({ message: "Lỗi server khi check-out" });
  }
};

// Lấy danh sách booking của ngày (theo query ?date=YYYY-MM-DD)
exports.getBookingsByDate = async (req, res) => {
  const dateFilter = req.query.date;
  try {
    const sql = `
      SELECT b.*, f.name as fieldName, f.price as fieldPrice
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      WHERE b.date = ?
      ORDER BY b.start_time
    `;
    const [rows] = await db.execute(sql, [dateFilter]);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách booking:", error);
    res.status(500).json({ message: "Lỗi server khi lấy booking" });
  }
};
