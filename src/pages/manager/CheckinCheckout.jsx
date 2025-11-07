import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

export default function CheckinCheckout() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check-in dialog states
  const [openCheckinDialog, setOpenCheckinDialog] = useState(false);
  const [checkinBookingId, setCheckinBookingId] = useState(null);

  // Check-out dialog states
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [extraFee, setExtraFee] = useState("");

  // Dịch vụ ngoài cho check-out
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const getTotalServicesFee = () =>
    selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axiosClient.get(`/manager/list_bookings?date=${today}`);
      setBookings(res.data);
    } catch {
      setError("Không thể tải danh sách booking!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ----- CHECK-IN HANDLING -----
  const handleOpenCheckinDialog = (booking) => {
    setCheckinBookingId(booking.id);
    setOpenCheckinDialog(true);
  };
  const handleCheckin = async () => {
    try {
      await axiosClient.put(`/manager/checkin/${checkinBookingId}`);
      await fetchBookings();
      setOpenCheckinDialog(false);
      setCheckinBookingId(null);
    } catch {
      setError("Không thể xác nhận!");
    }
  };

  // ----- CHECK-OUT HANDLING -----
  const handleOpenCheckoutDialog = async (booking) => {
    setSelectedBooking(booking);
    setExtraFee(booking.extraFee || "");
    try {
      const res = await axiosClient.get("/manager/services");
      setServices(res.data);
      setSelectedServices([]);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dịch vụ:", error);
      setError("Không thể tải danh sách dịch vụ.");
      setServices([]);
    }
    setOpenCheckoutDialog(true);
  };
  const handleCloseCheckoutDialog = () => {
    setOpenCheckoutDialog(false);
    setSelectedBooking(null);
    setSelectedServices([]);
  };
  const handleServiceCheck = (service, checked) => {
    if (checked) {
      setSelectedServices((prev) => [...prev, { ...service, quantity: 1 }]);
    } else {
      setSelectedServices((prev) => prev.filter((s) => s.id !== service.id));
    }
  };
  const handleServiceQuantityChange = (serviceId, quantity) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, quantity: quantity < 1 ? 1 : quantity } : s
      )
    );
  };
  const handleCheckout = async () => {
    try {
      await axiosClient.put(`/manager/checkout/${selectedBooking.id}`, {
        extraFee: extraFee ? parseInt(extraFee) : 0,
        services: selectedServices.map((s) => ({
          serviceId: s.id,
          quantity: s.quantity,
        })),
        totalServicesFee: getTotalServicesFee(),
      });
      await fetchBookings();
      handleCloseCheckoutDialog();
    } catch {
      setError("Không thể check-out!");
    }
  };

  // ---- UI ----
  return (
    <ManagerLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Check-in / Check-out
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên sân</TableCell>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Chi phí</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.fieldName || "?"}</TableCell>
                    <TableCell>{booking.name || "?"}</TableCell>
                    <TableCell>
                      {booking.date
                        ? new Date(booking.date).toLocaleDateString("vi-VN")
                        : ""}
                      {" | "}
                      {booking.start_time && booking.end_time
                        ? `${booking.start_time} - ${booking.end_time}`
                        : "?"}
                    </TableCell>
                    <TableCell>
                      {booking.fieldPrice
                        ? booking.fieldPrice.toLocaleString("vi-VN")
                        : ""}
                      {booking.extraFee ? (
                        <span>
                          {" "}
                          + {booking.extraFee.toLocaleString("vi-VN")}
                        </span>
                      ) : (
                        ""
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={
                          booking.status === "Đã xác nhận"
                            ? "warning"
                            : booking.status === "Hoàn thành"
                            ? "success"
                            : booking.status === "Chờ xác nhận"
                            ? "info"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {booking.status === "Chờ xác nhận" && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleOpenCheckinDialog(booking)}
                        >
                          Check-in
                        </Button>
                      )}
                      {booking.status === "Đã xác nhận" && (
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          onClick={() => handleOpenCheckoutDialog(booking)}
                        >
                          Check-out
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Dialog đơn giản cho check-in */}
        <Dialog
          open={openCheckinDialog}
          onClose={() => setOpenCheckinDialog(false)}
        >
          <DialogTitle>Check-in xác nhận sân</DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpenCheckinDialog(false)}>Hủy</Button>
            <Button onClick={handleCheckin} variant="contained">
              Xác nhận check-in
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog chọn dịch vụ ngoài khi check-out */}
        <Dialog open={openCheckoutDialog} onClose={handleCloseCheckoutDialog}>
          <DialogTitle>Check-out & chọn dịch vụ ngoài</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Typography variant="subtitle1">
              Chọn dịch vụ ngoài sử dụng:
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Tên dịch vụ</TableCell>
                  <TableCell>Giá (VND)</TableCell>
                  <TableCell>Số lượng</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => {
                  const checked = selectedServices.some(
                    (s) => s.id === service.id
                  );
                  const quantity =
                    selectedServices.find((s) => s.id === service.id)
                      ?.quantity || 1;
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) =>
                            handleServiceCheck(service, e.target.checked)
                          }
                        />
                      </TableCell>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>
                        {service.price.toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={quantity}
                          onChange={(e) =>
                            handleServiceQuantityChange(
                              service.id,
                              parseInt(e.target.value)
                            )
                          }
                          InputProps={{ inputProps: { min: 1 } }}
                          size="small"
                          disabled={!checked}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Typography variant="subtitle1">
              Tổng dịch vụ ngoài:{" "}
              {getTotalServicesFee().toLocaleString("vi-VN")} VND
            </Typography>
            <TextField
              label="Chi phí phát sinh (VND)"
              type="number"
              value={extraFee}
              onChange={(e) => setExtraFee(e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCheckoutDialog}>Hủy</Button>
            <Button onClick={handleCheckout} variant="contained">
              Xác nhận check-out
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ManagerLayout>
  );
}
