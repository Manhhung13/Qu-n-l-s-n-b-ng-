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
  Stack,
  Card,
  CardContent,
  Divider,
  Paper,
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
      function getVietnamDateYYYYMMDD() {
        const now = new Date();
        const vnDate = now.toLocaleDateString("en-CA", {
          timeZone: "Asia/Ho_Chi_Minh",
        });
        return vnDate;
      }

      const today = getVietnamDateYYYYMMDD();
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
      const res = await axiosClient.get("/manager/list_service");
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

  // Thống kê cho header
  const playingCount = bookings.filter(
    (b) => b.status === "Đang sử dụng" || b.status === "Đã xác nhận"
  ).length;
  const pendingCount = bookings.filter(
    (b) => b.status === "Chờ xác nhận"
  ).length;
  const doneCount = bookings.filter((b) => b.status === "Hoàn thành").length;

  // Doanh thu hôm nay (base + extraFee)
  const totalTodayRevenue = bookings.reduce((sum, b) => {
    const base = Number(b.fieldPrice || 0);
    const extra = Number(b.extraFee || 0);
    return sum + base + extra;
  }, 0);

  // Helper format tiền
  const formatVND = (value) =>
    Number(value || 0).toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <ManagerLayout>
      <Container sx={{ mt: 3, mb: 4 }}>
        {/* Header + summary cards */}
        <Box mb={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Operational Check-in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quản lý các trận đang diễn ra, sắp diễn ra và đã hoàn thành hôm
                nay
              </Typography>
            </Box>
            <Chip
              label={new Date().toLocaleDateString("vi-VN")}
              color="success"
              variant="outlined"
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mt={3}>
            <Card sx={{ flex: 1, bgcolor: "#f3f8ff" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Đang chơi
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {playingCount} Matches
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "#fff7e6" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Chờ đến sân
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {pendingCount} Teams
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "#eafaf0" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Hoàn thành hôm nay
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                  {doneCount} Done
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, bgcolor: "#fdf5e6" }}>
              <CardContent>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                >
                  Doanh thu hôm nay (ước tính)
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ mt: 1, fontFamily: "Roboto, system-ui" }}
                >
                  {formatVND(totalTodayRevenue)} VND
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Lịch check-in / check-out hôm nay
            </Typography>
            <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                px={3}
                py={2}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Các trận đang và sắp diễn ra
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sân</TableCell>
                      <TableCell>Khách hàng</TableCell>
                      <TableCell>Khung giờ</TableCell>
                      <TableCell>Chi phí</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} hover>
                        <TableCell>
                          <Stack spacing={0.3}>
                            <Typography fontWeight={600}>
                              {booking.fieldName || "?"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {booking.date
                                ? new Date(booking.date).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : ""}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography>{booking.name || "?"}</Typography>
                        </TableCell>
                        <TableCell>
                          {booking.start_time && booking.end_time ? (
                            <Typography variant="body2">
                              {booking.start_time} - {booking.end_time}
                            </Typography>
                          ) : (
                            "?"
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatVND(booking.fieldPrice)}
                            {booking.extraFee
                              ? ` + ${formatVND(booking.extraFee)}`
                              : ""}
                          </Typography>
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
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có trận nào trong ngày.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </>
        )}

        {/* Dialog check-in */}
        <Dialog
          open={openCheckinDialog}
          onClose={() => setOpenCheckinDialog(false)}
        >
          <DialogTitle>Xác nhận check-in</DialogTitle>
          <DialogActions>
            <Button onClick={() => setOpenCheckinDialog(false)}>Hủy</Button>
            <Button onClick={handleCheckin} variant="contained">
              Xác nhận check-in
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog check-out + dịch vụ */}
        <Dialog
          open={openCheckoutDialog}
          onClose={handleCloseCheckoutDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle>Check-out & dịch vụ ngoài</DialogTitle>
          <DialogContent sx={{ mt: 1 }}>
            {selectedBooking && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#f7fafc",
                }}
              >
                <Typography fontWeight={600}>
                  {selectedBooking.fieldName} • {selectedBooking.start_time} -{" "}
                  {selectedBooking.end_time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Khách: {selectedBooking.name || "?"}
                </Typography>
              </Box>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              {/* Cột dịch vụ */}
              <Box flex={1}>
                <Typography variant="subtitle2" mb={1}>
                  Chọn dịch vụ ngoài
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{ maxHeight: 260, overflow: "auto" }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Dịch vụ</TableCell>
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
                            <TableCell>{formatVND(service.price)}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={quantity}
                                onChange={(e) =>
                                  handleServiceQuantityChange(
                                    service.id,
                                    parseInt(e.target.value)
                                  )
                                }
                                InputProps={{ inputProps: { min: 1 } }}
                                disabled={!checked}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>

              {/* Cột tổng tiền */}
              <Box flex={1}>
                <Typography variant="subtitle2" mb={1}>
                  Tóm tắt thanh toán
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2">Tiền sân</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatVND(selectedBooking?.fieldPrice)} VND
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2">
                        Dịch vụ ngoài ({selectedServices.length})
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {formatVND(getTotalServicesFee())} VND
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2">Chi phí phát sinh</Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={extraFee}
                        onChange={(e) => setExtraFee(e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                        sx={{ width: 130 }}
                      />
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        Tổng thanh toán
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {formatVND(
                          Number(selectedBooking?.fieldPrice || 0) +
                            getTotalServicesFee() +
                            (extraFee ? Number(extraFee) : 0)
                        )}{" "}
                        VND
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
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
