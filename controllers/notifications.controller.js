const db = require("../db");

exports.listNotifications = async (req, res) => {
  const { userId } = req.query;
  let rows;
  if (userId) {
    [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ?", [
      userId,
    ]);
  } else {
    [rows] = await db.query("SELECT * FROM notifications");
  }
  res.json(rows);
};
