import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Box,
  TextField,
  Avatar,
} from "@mui/material";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

// Map màu chip trực quan
const statusColor = (status) => {
  const s = status?.trim().toLowerCase();
  if (s === "sân hoạt động bình thường") return "success";
  if (s === "đang sử dụng") return "warning";
  if (s === "sân đang bảo trì") return "error";
  if (s === "bảo trì") return "error";
  return "default";
};

const statusLabel = (status) => {
  if (!status) return "Không rõ";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Dashboard() {
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [serviceOrders, setServiceOrders] = useState([]);
  const [serviceOrdersTotal, setServiceOrdersTotal] = useState(0);

  useEffect(() => {
    const fetchFieldsAndStats = async () => {
      setLoading(true);
      setError("");
      try {
        const fieldsRes = await axiosClient.get("/manager/dashboard/fields");
        setFields(fieldsRes.data || []);
        const statsRes = await axiosClient.get(
          "/manager/dashboard/stats/today"
        );
        setStats(statsRes.data || {});
      } catch {
        setError("Không thể tải Dashboard. Hãy thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchFieldsAndStats();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");
        const bookingsRes = await axiosClient.get(
          `/manager/dashboard/bookings?date=${selectedDate}`
        );
        setBookings(bookingsRes.data || []);
      } catch {
        setError("Không thể tải lịch đặt sân. Hãy thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [selectedDate]);

  useEffect(() => {
    const fetchServiceOrders = async () => {
      try {
        const res = await axiosClient.get(
          `/manager/dashboard/service-orders?date=${selectedDate}`
        );
        setServiceOrders(res.data.orders || []);
        setServiceOrdersTotal(res.data.total || 0);
      } catch {
        setServiceOrders([]);
        setServiceOrdersTotal(0);
      }
    };
    fetchServiceOrders();
  }, [selectedDate]);

  function formatVND(price) {
    if (!price) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  }

  return (
    <ManagerLayout>
      {/* Card lớn chiếm full vùng content bên phải sidebar */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
          p: 3,
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header nhỏ phía trên */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Quản lý - Tổng quan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chào mừng trở lại, Quản trị viên
            </Typography>
          </Box>

          <TextField
            type="date"
            size="small"
            label="Chọn ngày"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* Thống kê nhanh */}
            {stats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%", borderRadius: 3 }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Tổng số lượt đặt hôm nay
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.totalBookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%", borderRadius: 3 }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Sân đang hoạt động
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.freeFields}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%", borderRadius: 3 }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Doanh thu đặt sân
                      </Typography>
                      <Typography variant="h5" color="secondary.main">
                        {formatVND(stats.fieldRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%", borderRadius: 3 }}>
                    <CardContent>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Doanh thu dịch vụ
                      </Typography>
                      <Typography variant="h5" color="secondary.main">
                        {formatVND(stats.serviceRevenue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Trạng thái các sân */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                Trạng thái các sân
              </Typography>
              <Grid container spacing={2}>
                {fields.map((field) => (
                  <Grid item xs={12} sm={6} md={3} key={field.id}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 170,
                        borderRadius: 3,
                        boxShadow: 1,
                        borderLeft: 4,
                        borderLeftColor: `${statusColor(field.status)}.main`,
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${statusColor(field.status)}.main`,
                            width: 44,
                            height: 44,
                            fontSize: 22,
                          }}
                        >
                          {field.name?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            {field.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 0.5 }}
                          >
                            {field.type} • {field.location}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "primary.main",
                            }}
                          >
                            {field.price
                              ? formatVND(field.price)
                              : "Chưa cập nhật giá"}
                          </Typography>
                          <Chip
                            size="small"
                            label={statusLabel(field.status)}
                            color={statusColor(field.status)}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Lịch đặt sân */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Lịch đặt sân hôm nay
            </Typography>
            <Box sx={{ overflowX: "auto", mb: 3 }}>
              <Table
                sx={{
                  minWidth: 950,
                  borderRadius: 3,
                  boxShadow: 1,
                  overflow: "hidden",
                }}
              >
                <TableHead>
                  <TableRow sx={{ background: "#e3eafc" }}>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Sân
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Khách hàng
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Thời gian
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Số giờ
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Chu kỳ (90 phút)
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Trạng thái
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Ghi chú
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      Giá trị hóa đơn
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => {
                    let durationMinutes = 90;
                    if (booking.start_time && booking.end_time) {
                      const [h1, m1] = booking.start_time
                        .split(":")
                        .map(Number);
                      const [h2, m2] = booking.end_time.split(":").map(Number);
                      durationMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
                      durationMinutes =
                        durationMinutes > 0 ? durationMinutes : 90;
                    }
                    const blocks = Math.max(
                      Math.round(durationMinutes / 90),
                      1
                    );
                    const price = booking.fieldPrice
                      ? booking.fieldPrice * blocks
                      : 0;

                    return (
                      <TableRow key={booking.id} hover>
                        <TableCell align="center">
                          {booking.fieldName || "?"}
                        </TableCell>
                        <TableCell align="center">
                          {booking.name || "?"}
                        </TableCell>
                        <TableCell align="center">
                          {booking.date
                            ? new Date(booking.date).toLocaleDateString("vi-VN")
                            : "?"}
                          {" | "}
                          {booking.start_time} - {booking.end_time}
                        </TableCell>
                        <TableCell align="center">
                          {(durationMinutes / 60).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">{blocks}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusLabel(booking.status)}
                            color={statusColor(booking.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {booking.note || ""}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: 600, color: "green" }}
                        >
                          {price > 0
                            ? `${price.toLocaleString("vi-VN")} VND`
                            : "Chưa xác định"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {/* Dịch vụ ngoài */}
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Dịch vụ & tiện ích kèm theo
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table
                sx={{
                  minWidth: 650,
                  borderRadius: 3,
                  boxShadow: 1,
                  overflow: "hidden",
                }}
              >
                <TableHead>
                  <TableRow sx={{ background: "#f0f7fa" }}>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Loại dịch vụ
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Số lượng đặt
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Đơn giá
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Thành tiền
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceOrders.map((order) => (
                    <TableRow key={order.name}>
                      <TableCell align="center">{order.name}</TableCell>
                      <TableCell align="center">{order.count}</TableCell>
                      <TableCell align="center">
                        {formatVND(order.price)}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "blue" }}
                      >
                        {formatVND(order.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {serviceOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        Không có lượt đặt dịch vụ ngoài
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell
                      align="center"
                      colSpan={3}
                      sx={{ fontWeight: "bold", fontSize: 16 }}
                    >
                      Tổng doanh thu dịch vụ ngoài
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: 600, color: "red", fontSize: 16 }}
                    >
                      {serviceOrdersTotal.toLocaleString("vi-VN")} VND
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </Box>
    </ManagerLayout>
  );
}
