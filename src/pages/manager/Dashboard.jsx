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

  return (
    <ManagerLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Quản lý - Dashboard
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Thống kê nhanh */}
            {stats && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Tổng số lượt đặt hôm nay
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {stats.totalBookings}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Sân hoạt động bình thường
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.freeFields}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Doanh thu từ đặt sân</Typography>
                      <Typography variant="h4" color="secondary.main">
                        {stats.fieldRevenue?.toLocaleString("vi-VN")} VND
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Doanh thu từ dịch vụ ngoài
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {stats.serviceRevenue?.toLocaleString("vi-VN")} VND
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Chọn ngày để xem lịch sử booking */}
            <Box mb={2}>
              <TextField
                type="date"
                label="Chọn ngày xem lịch sử"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Trạng thái các sân - Giao diện rõ ràng, màu sắc đẹp, bố trí grid responsive */}
            <Box mb={3}>
              <Typography variant="h6" mb={2}>
                Trạng thái các sân
              </Typography>
              <Grid container spacing={2}>
                {fields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={field.id}>
                    <Card
                      sx={{
                        borderLeft: `6px solid`,
                        borderColor: `${statusColor(field.status)}.main`,
                        boxShadow: 2,
                      }}
                    >
                      <CardContent
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: `${statusColor(field.status)}.main`,
                            mr: 2,
                          }}
                        >
                          {field.name?.[0]?.toUpperCase() || "?"}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Typography variant="h6">{field.name}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {field.type} - {field.location}
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

            {/* Lịch đặt sân ngày đã chọn */}
            <Typography variant="h6" mt={3} mb={1}>
              Lịch đặt sân ngày {selectedDate}
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên sân</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Thời gian</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ghi chú</TableCell>
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
                          : "?"}
                        {" | "}
                        {booking.timeSlot}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={booking.status}
                          color={statusColor(booking.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{booking.note || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </Container>
    </ManagerLayout>
  );
}
