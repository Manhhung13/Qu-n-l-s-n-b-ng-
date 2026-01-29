// backend/routes/manager/customers.routes.js
const express = require("express");
const router = express.Router();
const customersController = require("../../controllers/manager/customers.controller");

// /api/manager/customers
router.get("/", customersController.getCustomers);
router.put("/:customerId", customersController.updateCustomer);

router.get("/:customerId/bookings", customersController.getCustomerBookings);
router.post("/:customerId/bookings", customersController.createBooking);
router.put(
  "/:customerId/bookings/:bookingId",
  customersController.updateBooking
);
router.delete(
  "/:customerId/bookings/:bookingId",
  customersController.deleteBooking
);

module.exports = router;
