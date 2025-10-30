const express = require("express");
const router = express.Router();
const cors = require("cors");
const bodyParser = require("body-parser");
const usersRoutes = require("./routes/users");
const fieldsRoutes = require("./routes/fields");
const bookingsRoutes = require("./routes/booking");
const notificationsRoutes = require("./routes/notifications");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Gắn các route
app.use("/users", usersRoutes);
app.use("/fields", fieldsRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/notifications", notificationsRoutes);
app.get("/", (req, res) => {
  res.send("Server API đang chạy!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
