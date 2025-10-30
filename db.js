const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "manhhunghm1303",
  database: "quanlysanbong",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Kết nối database thành công!");
    connection.release();
  } catch (error) {
    console.error("Kết nối database thất bại:", error.message);
  }
})();
module.exports = pool;
