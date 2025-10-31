const db = require("../db");

exports.listNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM notifications WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "error", error: e.message });
  }
};

// controllers/notifications.controller.js
exports.notifyBookingConfirm = async (req, res) => {
  try {
    const { user_id, booking_id, content } = req.body;

    // Gửi thông báo xác nhận đặt sân cho user
    await db.query(
      "INSERT INTO notifications (user_id, content, type, is_read) VALUES (?, ?, ?, ?)",
      [
        user_id,
        content,
        "xac nhan", // enum type của bạn ('nhac nho', 'xac nhan',...)
        0,
      ]
    );

    res.json({ message: "Đã gửi thông báo xác nhận cho user!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gửi thông báo thất bại!", error: error.message });
  }
};
