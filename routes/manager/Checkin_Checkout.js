const express = require("express");
const router = express.Router();
const checkin_Checkout_Controller = require("../../controllers/manager/Checkin_Checkout.controller");
router.get("/list_bookings", checkin_Checkout_Controller.getBookingsByDate);
router.put("/checkin/:id", checkin_Checkout_Controller.checkinBooking);
router.put("/checkout/:id", checkin_Checkout_Controller.checkoutBooking);
module.exports = router;
