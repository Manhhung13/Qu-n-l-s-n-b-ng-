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
import { Man } from "@mui/icons-material";

export default function CheckinCheckout() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [extraFee, setExtraFee] = useState("");

  // Lấy booking cần check-in/out trong ngày
  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axiosClient.get(`/bookings?date=${today}`);
      setBookings(res.data);
    } catch {
      setError("Không thể tải danh sách booking!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Mở dialog bổ sung phí/dịch vụ phát sinh khi check-out
  const handleOpenDialog = (booking) => {
    setSelectedBooking(booking);
    setExtraFee(booking.extraFee || "");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  // Check-in: Đổi trạng thái booking
  const handleCheckin = async (id) => {
    try {
      await axiosClient.put(`/bookings/${id}/checkin`);
      await fetchBookings();
    } catch {
      setError("Không thể check-in!");
    }
  };

  // Check-out: Đổi trạng thái booking, cập nhật extraFee (nếu có)
  const handleCheckout = async () => {
    try {
      await axiosClient.put(`/bookings/${selectedBooking._id}/checkout`, {
        extraFee: extraFee ? parseInt(extraFee) : 0,
      });
      await fetchBookings();
      handleCloseDialog();
    } catch {
      setError("Không thể check-out!");
    }
  };

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
                  <TableRow key={booking._id}>
                    <TableCell>{booking.field?.name || "?"}</TableCell>
                    <TableCell>{booking.customerName || "?"}</TableCell>
                    <TableCell>
                      {booking.date
                        ? new Date(booking.date).toLocaleDateString("vi-VN")
                        : ""}
                      {" | "}
                      {booking.timeSlot}
                    </TableCell>
                    <TableCell>
                      {booking.field?.price
                        ? booking.field.price.toLocaleString("vi-VN")
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
                          booking.status === "Đang sử dụng"
                            ? "warning"
                            : booking.status === "Hoàn thành"
                            ? "success"
                            : booking.status === "Đặt"
                            ? "info"
                            : "default"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {booking.status === "Đặt" && (
                        <Button
                          size="small"
                          color="success"
                          variant="outlined"
                          onClick={() => handleCheckin(booking._id)}
                        >
                          Check-in
                        </Button>
                      )}
                      {booking.status === "Đang sử dụng" && (
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          onClick={() => handleOpenDialog(booking)}
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

        {/* Dialog nhập phí phát sinh khi check-out */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Check-out & dịch vụ phát sinh</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Chi phí phát sinh (VND)"
              type="number"
              value={extraFee}
              onChange={(e) => setExtraFee(e.target.value)}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleCheckout} variant="contained">
              Xác nhận check-out
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ManagerLayout>
  );
}
