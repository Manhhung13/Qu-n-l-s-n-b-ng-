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
const auth = require("./middlewares/auth");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/users", usersRoutes);
app.use(auth);

// Gắn các route

app.use("/fields", roleAuth("user"), fieldsRoutes);
app.use("/bookings", roleAuth("user"), bookingsRoutes);
app.use("/notifications", roleAuth("user"), notificationsRoutes);
app.use("/manager", roleAuth("manager"), manager_Checkin_Checkout);
app.get("/", (req, res) => {
  res.send("Server API đang chạy!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
