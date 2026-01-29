// backend/controllers/manager/customers.controller.js
const db = require("../../db");

// GET /api/manager/customers
exports.getCustomers = async (req, res) => {
  const sql = `
    SELECT 
      c.id AS customer_id,
      u.id AS user_id,
      u.name,
      u.email,
      u.phone,
      c.ranking,
      c.note
    FROM customers c
    JOIN users u ON c.user_id = u.id
    ORDER BY c.created_at DESC
  `;

  try {
    const [rows] = await db.query(sql);
    const customers = rows.map((row) => ({
      _id: row.customer_id,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      rank: row.ranking >= 1 ? "vip" : "standard",
      note: row.note,
    }));
    res.json(customers);
  } catch (err) {
    console.error("getCustomers error:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách khách hàng" });
  }
};

// PUT /api/manager/customers/:customerId
exports.updateCustomer = async (req, res) => {
  const { customerId } = req.params;
  const { note, rank } = req.body;

  const ranking = rank === "vip" ? 1 : 0;

  const sql = `UPDATE customers SET note = ?, ranking = ? WHERE id = ?`;
  try {
    const [result] = await db.query(sql, [note || null, ranking, customerId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    res.json({ message: "Cập nhật khách hàng thành công" });
  } catch (err) {
    console.error("updateCustomer error:", err);
    res.status(500).json({ message: "Lỗi cập nhật khách hàng" });
  }
};

// GET /api/manager/customers/:customerId/bookings
exports.getCustomerBookings = async (req, res) => {
  const { customerId } = req.params;

  const findUserSql = `SELECT user_id FROM customers WHERE id = ?`;
  try {
    const [cusRows] = await db.query(findUserSql, [customerId]);
    if (cusRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    const userId = cusRows[0].user_id;

    const sql = `
      SELECT 
        b.id,
        b.field_id,
        f.name AS field_name,
        b.date,
        b.start_time,
        b.end_time,
        b.status,
        b.note,
        b.extraFee
      FROM bookings b
      JOIN fields f ON b.field_id = f.id
      WHERE b.user_id = ?
      ORDER BY b.date DESC, b.start_time DESC
    `;
    const [rows] = await db.query(sql, [userId]);

    const bookings = rows.map((r) => {
      // r.date là kiểu Date của MySQL (DATE), luôn là 00:00:00 local
      const dateStr = r.date.toISOString().slice(0, 10); // YYYY-MM-DD
      return {
        _id: r.id,
        fieldId: r.field_id,
        fieldName: r.field_name,
        startTime: `${dateStr}T${r.start_time}`,
        endTime: `${dateStr}T${r.end_time}`,
        status: r.status,
        note: r.note,
        // không dùng extraFee để tính giá sân nữa, để 0 hoặc dùng cho phụ phí sau này
        price: 0,
      };
    });

    res.json(bookings);
  } catch (err) {
    console.error("getCustomerBookings error:", err);
    res.status(500).json({ message: "Lỗi lấy lịch sử đặt sân" });
  }
};

// Hàm tiện ích: tách ngày / giờ từ chuỗi datetime-local "YYYY-MM-DDTHH:mm"
function extractDateTimeParts(startTime, endTime) {
  const [startDatePart, startTimePart] = startTime.split("T");
  const [endDatePart, endTimePart] = endTime.split("T");

  if (!startDatePart || !startTimePart || !endDatePart || !endTimePart) {
    throw new Error("Định dạng thời gian không hợp lệ");
  }

  const dateStr = startDatePart;
  const startTimeStr = `${startTimePart}:00`; // HH:mm:00
  const endTimeStr = `${endTimePart}:00`;

  // kiểm tra cùng ngày
  if (endDatePart !== startDatePart) {
    throw new Error("Hiện tại chỉ hỗ trợ đặt trong cùng một ngày");
  }

  // kiểm tra end > start
  const startDate = new Date(`${startDatePart}T${startTimeStr}`);
  const endDate = new Date(`${endDatePart}T${endTimeStr}`);
  if (endDate <= startDate) {
    throw new Error("Giờ kết thúc phải sau giờ bắt đầu");
  }

  return { dateStr, startTimeStr, endTimeStr };
}

// POST /api/manager/customers/:customerId/bookings
exports.createBooking = async (req, res) => {
  const { customerId } = req.params;
  const { fieldName, startTime, endTime } = req.body;

  if (!fieldName || !startTime || !endTime) {
    return res.status(400).json({ message: "Thiếu thông tin đặt sân" });
  }

  try {
    // 1. Lấy user_id của customer
    const [cusRows] = await db.query(
      "SELECT user_id FROM customers WHERE id = ?",
      [customerId]
    );
    if (cusRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    const userId = cusRows[0].user_id;

    // 2. Lấy thông tin user (để lưu vào bảng bookings)
    const [userRows] = await db.query(
      "SELECT name, phone, email FROM users WHERE id = ?",
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy user tương ứng" });
    }
    const { name, phone, email } = userRows[0];

    // 3. Tìm field_id theo tên sân
    const [fieldRows] = await db.query(
      "SELECT id FROM fields WHERE name = ? LIMIT 1",
      [fieldName]
    );
    if (fieldRows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sân" });
    }
    const fieldId = fieldRows[0].id;

    // 4. Chuẩn hóa thời gian từ chuỗi datetime-local (không dùng UTC)
    let dateStr, startTimeStr, endTimeStr;
    try {
      ({ dateStr, startTimeStr, endTimeStr } = extractDateTimeParts(
        startTime,
        endTime
      ));
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    // 5. Kiểm tra trùng giờ cùng sân, cùng ngày
    const checkSql = `
      SELECT id FROM bookings
      WHERE field_id = ?
        AND date = ?
        AND ( ? < end_time )
        AND ( ? > start_time )
    `;
    const [overlaps] = await db.query(checkSql, [
      fieldId,
      dateStr,
      startTimeStr,
      endTimeStr,
    ]);

    if (overlaps.length > 0) {
      return res
        .status(409)
        .json({ message: "Khung giờ này đã có người đặt sân rồi" });
    }

    // 6. Không trùng, cho phép thêm + lưu tên / sđt / email, extraFee = 0
    const insertSql = `
      INSERT INTO bookings
      (user_id, field_id, date, start_time, end_time, status, note, extraFee, booked, name, phone, email)
      VALUES (?, ?, ?, ?, ?, 'Đã xác nhận', NULL, 0, 1, ?, ?, ?)
    `;
    const [result] = await db.query(insertSql, [
      userId,
      fieldId,
      dateStr,
      startTimeStr,
      endTimeStr,
      name,
      phone,
      email,
    ]);

    res
      .status(201)
      .json({ message: "Thêm lần đặt sân thành công", id: result.insertId });
  } catch (err) {
    console.error("createBooking error:", err);
    res.status(500).json({ message: "Lỗi thêm lần đặt sân" });
  }
};

// PUT /api/manager/customers/:customerId/bookings/:bookingId
exports.updateBooking = async (req, res) => {
  const { customerId, bookingId } = req.params;
  const { fieldName, startTime, endTime } = req.body;

  try {
    const [cusRows] = await db.query(
      "SELECT user_id FROM customers WHERE id = ?",
      [customerId]
    );
    if (cusRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    const userId = cusRows[0].user_id;

    const [bookingRows] = await db.query(
      "SELECT id FROM bookings WHERE id = ? AND user_id = ?",
      [bookingId, userId]
    );
    if (bookingRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy lần đặt sân" });
    }

    const [fieldRows] = await db.query(
      "SELECT id FROM fields WHERE name = ? LIMIT 1",
      [fieldName]
    );
    if (fieldRows.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy sân" });
    }
    const fieldId = fieldRows[0].id;

    let dateStr, startTimeStr, endTimeStr;
    try {
      ({ dateStr, startTimeStr, endTimeStr } = extractDateTimeParts(
        startTime,
        endTime
      ));
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }

    // kiểm tra trùng giờ khi sửa, loại trừ chính booking đang sửa
    const checkSql = `
      SELECT id FROM bookings
      WHERE field_id = ?
        AND date = ?
        AND ( ? < end_time )
        AND ( ? > start_time )
        AND id <> ?
    `;
    const [overlaps] = await db.query(checkSql, [
      fieldId,
      dateStr,
      startTimeStr,
      endTimeStr,
      bookingId,
    ]);
    if (overlaps.length > 0) {
      return res
        .status(409)
        .json({ message: "Khung giờ này đã có người đặt sân rồi" });
    }

    const sql = `
      UPDATE bookings
      SET field_id = ?, date = ?, start_time = ?, end_time = ?
      WHERE id = ? AND user_id = ?
    `;
    await db.query(sql, [
      fieldId,
      dateStr,
      startTimeStr,
      endTimeStr,
      bookingId,
      userId,
    ]);

    res.json({ message: "Cập nhật lần đặt sân thành công" });
  } catch (err) {
    console.error("updateBooking error:", err);
    res.status(500).json({ message: "Lỗi cập nhật lần đặt sân" });
  }
};

// DELETE /api/manager/customers/:customerId/bookings/:bookingId
exports.deleteBooking = async (req, res) => {
  const { customerId, bookingId } = req.params;

  try {
    const [cusRows] = await db.query(
      "SELECT user_id FROM customers WHERE id = ?",
      [customerId]
    );
    if (cusRows.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    }
    const userId = cusRows[0].user_id;

    const sql = `DELETE FROM bookings WHERE id = ? AND user_id = ?`;
    const [result] = await db.query(sql, [bookingId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy lần đặt sân" });
    }

    res.json({ message: "Xóa lần đặt sân thành công" });
  } catch (err) {
    console.error("deleteBooking error:", err);
    res.status(500).json({ message: "Lỗi xóa lần đặt sân" });
  }
};
