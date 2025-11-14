import React, { useEffect, useState } from "react";
import {
  Container,
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
  Stack,
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

  return (
    <ManagerLayout>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3} align="center">
          Quản lý - Dashboard
        </Typography>
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
            {/* Thống kê nhanh - auto chia đều, luôn full hàng */}
            {stats && (
              <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="stretch"
                sx={{ mb: 3 }}
              >
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tổng số lượt đặt hôm nay
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.totalBookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Sân hoạt động bình thường
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.freeFields}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Doanh thu từ đặt sân
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {stats.fieldRevenue.toLocaleString("vi-VN")} VND
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Doanh thu từ dịch vụ ngoài
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {stats.serviceRevenue.toLocaleString("vi-VN")} VND
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            <Box mb={3} display="flex" justifyContent="center">
              <TextField
                type="date"
                label="Chọn ngày xem lịch sử"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box mb={4}>
              <Typography variant="h6" mb={2} align="center">
                Trạng thái các sân
              </Typography>
              <Grid
                container
                spacing={3}
                justifyContent="center"
                alignItems="stretch"
              >
                {fields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={field.id}>
                    <Card
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        minHeight: 165,
                        boxShadow: 2,
                        borderLeft: `6px solid`,
                        borderColor: `${statusColor(field.status)}.main`,
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
                            width: 48,
                            height: 48,
                            fontSize: 24,
                            mr: 2,
                          }}
                        >
                          {field.name?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{ mb: 0.5 }}
                          >
                            {field.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {field.type} - {field.location}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            color="primary"
                            fontWeight={500}
                            sx={{ mb: 1 }}
                          >
                            {field.price
                              ? `${field.price.toLocaleString("vi-VN")} VND`
                              : "Chưa cập nhật giá"}
                          </Typography>
                          <Chip
                            label={statusLabel(field.status)}
                            color={statusColor(field.status)}
                            size="small"
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Typography variant="h6" mt={3} mb={1} align="center">
              Lịch đặt sân ngày {selectedDate}
            </Typography>
            <Box sx={{ overflowX: "auto", mb: 3 }}>
              <Table sx={{ minWidth: 950, borderRadius: 3, boxShadow: 2 }}>
                <TableHead>
                  <TableRow sx={{ background: "#e3eafc" }}>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Sân
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Khách hàng
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Thời gian
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Số giờ
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Chu kỳ (90 phút)
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Trạng thái
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Ghi chú
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: 15,
                        color: "primary.main",
                      }}
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
            <Typography variant="h6" mt={4} mb={2} align="center">
              Lịch sử đặt dịch vụ ngoài ngày {selectedDate}
            </Typography>
            <Box sx={{ overflowX: "auto", mb: 4 }}>
              <Table sx={{ minWidth: 650, borderRadius: 3, boxShadow: 2 }}>
                <TableHead>
                  <TableRow sx={{ background: "#f0f7fa" }}>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Loại dịch vụ
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Số lượng đặt
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
                      Đơn giá
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", fontSize: 15 }}
                    >
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
                        {order.price.toLocaleString("vi-VN")} VND
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontWeight: 600, color: "blue" }}
                      >
                        {order.totalPrice.toLocaleString("vi-VN")} VND
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
                      Tổng chi dịch vụ ngoài
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
      </Container>
    </ManagerLayout>
  );
}
