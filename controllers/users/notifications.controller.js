const db = require("../../db");

// Lấy danh sách thông báo của user (giả sử có user.id từ xác thực)
exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const sql = `
      SELECT id as _id, content, status, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(sql, [userId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Xác nhận thông báo
exports.confirmNotification = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const sqlCheck = `SELECT user_id FROM notifications WHERE id = ?`;
    const [rows] = await db.execute(sqlCheck, [notificationId]);
    if (rows.length === 0 || rows[0].user_id !== userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const sqlUpdate = `UPDATE notifications SET status = 'xác nhận' WHERE id = ?`;
    await db.execute(sqlUpdate, [notificationId]);
    res.json({ message: "Notification confirmed" });
  } catch (error) {
    console.error("Error confirming notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Xoá thông báo
exports.deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const notificationId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const sqlCheck = `SELECT user_id FROM notifications WHERE id = ?`;
    const [rows] = await db.execute(sqlCheck, [notificationId]);
    if (rows.length === 0 || rows[0].user_id !== userId) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const sqlDelete = `DELETE FROM notifications WHERE id = ?`;
    await db.execute(sqlDelete, [notificationId]);
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};
