const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/user/users");
const fieldsRoutes = require("./routes/user/fields");
const bookingsRoutes = require("./routes/user/booking");
const notificationsRoutes = require("./routes/user/notifications");
const roleAuth = require("./middlewares/role");
const manager_Checkin_Checkout = require("./routes/manager/Checkin_Checkout");
const manager_Dashboard = require("./routes/manager/Dashboard");
const updateFieldStatus = require("./routes/admin/update_field");
const Staff_Manager = require("./routes/admin/Staff_Manager");
const auth = require("./middlewares/auth");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/users", usersRoutes);
app.use(auth);

// Gắn các route
app.use("/manager/dashboard", roleAuth("manager"), manager_Dashboard);
app.use("/fields", roleAuth("user"), fieldsRoutes);
app.use("/bookings", roleAuth("user"), bookingsRoutes);
app.use("/notifications", roleAuth("user"), notificationsRoutes);
app.use("/manager", roleAuth("manager"), manager_Checkin_Checkout);
app.use("/admin/fields", roleAuth("admin"), updateFieldStatus);
app.use("/admin/staffs", roleAuth("admin"), Staff_Manager);
app.get("/", (req, res) => {
  res.send("Server API đang chạy!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
