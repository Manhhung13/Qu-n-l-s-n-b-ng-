const nodemailer = require("nodemailer");
const db = require("../../db");
const tk_email = process.env.tk_email;
const mk_email = process.env.mk_email;
const hotline = process.env.hotline;

// Check-in: cập nhật trạng thái booking "Đã xác nhận", gửi email & notification cho user
exports.checkinBooking = async (req, res) => {
  const bookingId = req.params.id;

  try {
    // Cập nhật trạng thái booking
    const updateBookingSQL = `
      UPDATE bookings
      SET status = 'Đã xác nhận'
      WHERE id = ?
    `;
    await db.execute(updateBookingSQL, [bookingId]);
    function getBookingSlotPrice(startTime, endTime, fieldPrice) {
      // startTime, endTime: "HH:mm", fieldPrice: số tiền mỗi slot (90 phút)
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const start = sh * 60 + sm;
      const end = eh * 60 + em;
      const minutes = end - start;
      // Làm tròn lên số slot 90 phút
      const slotCount = Math.max(Math.round(minutes / 90), 1);
      return slotCount * fieldPrice;
    }

    // 3. Lấy thông tin booking & user/sân để thông báo
    const [bookingRows] = await db.execute(
      `SELECT b.*, b.email, u.name as userName, f.name as fieldName, f.price as fieldPrice
   FROM bookings b
   JOIN users u ON b.user_id = u.id
   JOIN fields f ON b.field_id = f.id
   WHERE b.id = ?`,
      [bookingId],
    );
    const booking = bookingRows[0];
    const totalPrice = getBookingSlotPrice(
      booking.start_time,
      booking.end_time,
      booking.fieldPrice,
    );

    // 4. Gửi notification vào bảng notifications
    function formatDateVN(isoDateStr) {
      if (typeof isoDateStr !== "string") {
        // Thử parse từ Date object, hoặc trả về giá trị mặc định
        if (isoDateStr instanceof Date) {
          const year = isoDateStr.getFullYear();
          const month = String(isoDateStr.getMonth() + 1).padStart(2, "0");
          const day = String(isoDateStr.getDate()).padStart(2, "0");
          return `${day}/${month}/${year}`;
        }
        return ""; // hoặc throw error/cảnh báo
      }
      const [year, month, day] = isoDateStr.split("-");
      return `${day}/${month}/${year}`;
    }

    // Dùng trong nội dung thông báo:
    //  console.log("booking.date:", booking.date);
    let dateString;
    if (booking.date instanceof Date) {
      // Lấy năm-tháng-ngày theo giờ local Việt Nam
      const year = booking.date.getFullYear();
      const month = (booking.date.getMonth() + 1).toString().padStart(2, "0");
      const day = booking.date.getDate().toString().padStart(2, "0");
      dateString = `${year}-${month}-${day}`;
    } else {
      dateString = String(booking.date);
    }
    const ngayVN = formatDateVN(dateString);

    const notificationContent = `Bạn đã đặt thành công  ${booking.fieldName} vào ngày ${ngayVN} khung giờ ${booking.start_time} - ${booking.end_time}`;

    await db.execute(
      "INSERT INTO notifications (user_id, content, type, is_read, created_at, status) VALUES (?, ?, ?, 0, NOW(), ?)",
      [booking.user_id, notificationContent, "xac nhan", "chưa xác nhận"],
    );
    // console.log("MAIL_USER:", process.env.tk_email);
    //console.log("MAIL_PASS:", process.env.mk_email);

    // 5. Gửi email cho user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: tk_email,
        pass: mk_email,
      },
    });
    console.log("tài khoản đến ", booking.email);
    const mailOptions = {
      from: tk_email,
      to: booking.email,
      subject: "Xác nhận đặt sân thành công",
      html: `
    <div style="font-family: Arial,sans-serif; background: #f7f7f7; padding: 20px; border-radius: 8px; max-width: 500px; margin: auto;">
      <div style="text-align:center;">
        <img src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/background_bong_da_0_7b8d7f07d4.jpg" alt="Logo Sân Bóng" style="width:100px; margin-bottom:16px;" />
      </div>
      <h2 style="color: #1e90ff;">Đặt sân thành công!</h2>
      <p>Kính gửi <b>${booking.userName}</b>, bạn đã đặt sân thành công tại <b>${booking.fieldName}</b>.</p>
      <ul style="list-style:none; padding-left:0;">
        <li><b>Thời gian:</b> ${ngayVN} ${booking.start_time} - ${booking.end_time}</li>
        <li><b>Sân:</b> ${booking.fieldName}</li>
        <li><b>Tổng số tiền:</b> ${totalPrice.toLocaleString()} vnđ</li>
        <li>Xin vui lòng đến trước <b>10 phút</b> để chuẩn bị.</li>
        <li>Mọi thắc mắc xin liên hệ <b>${process.env.hotline || "[Hotline]"}</b>.</li>
      </ul>
      <p style="color: #38b000;">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!</p>
    </div>
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
  const { extraFee = 0, services = [], totalServicesFee = 0 } = req.body || {};
  try {
    // Cập nhật trạng thái booking và extra fee
    const updateBookingSQL = `
      UPDATE bookings
      SET status = 'Hoàn thành', extraFee = ?
      WHERE id = ?
    `;
    await db.execute(updateBookingSQL, [extraFee, bookingId]);
    // 2. Lưu các dịch vụ ngoài vào bảng booking_services (nếu có)
    if (Array.isArray(services) && services.length > 0) {
      for (const item of services) {
        await db.execute(
          "INSERT INTO booking_services (booking_id, service_id, quantity) VALUES (?, ?, ?)",
          [bookingId, item.serviceId, item.quantity],
        );
      }
    }

    res.json({ message: "Check-out thành công" });
  } catch (error) {
    console.error("Lỗi check-out:", error);
    res.status(500).json({ message: "Lỗi server khi check-out" });
  }
};

// Lấy danh sách booking của ngày (theo query ?date=YYYY-MM-DD)
exports.getBookingsByDate = async (req, res) => {
  const dateFilter = req.query.date;
  console.log("Date filter:", dateFilter);
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
exports.getAllServices = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT id, name, price FROM services");
    res.json(rows);
  } catch (error) {
    console.error("Lỗi lấy danh sách dịch vụ ngoài:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách dịch vụ ngoài" });
  }
};
