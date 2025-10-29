import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
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
} from "@mui/material";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

// Hàm chuyển đổi màu trạng thái sân
const statusColor = (status) => {
  if (status === "Trống") return "success";
  if (status === "Đang sử dụng") return "warning";
  if (status === "Bảo trì") return "error";
  return "default";
};

export default function Dashboard() {
  const [fields, setFields] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // Lấy danh sách sân, lịch đặt hôm nay và thống kê nhanh
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // Lấy danh sách sân
        const fieldsRes = await axiosClient.get("/fields");
        setFields(fieldsRes.data);

        // Lấy lịch đặt hôm nay
        const today = new Date().toISOString().slice(0, 10);
        const bookingsRes = await axiosClient.get(`/bookings?date=${today}`);
        setBookings(bookingsRes.data);

        // Lấy thống kê
        const statsRes = await axiosClient.get("/stats/today");
        setStats(statsRes.data);
      } catch {
        setError("Không thể tải Dashboard. Hãy thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Tổng sân trống</Typography>
                      <Typography variant="h4" color="success.main">
                        {stats.freeFields}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">
                        Tổng doanh thu hôm nay
                      </Typography>
                      <Typography variant="h4" color="secondary.main">
                        {stats.revenue?.toLocaleString("vi-VN")} VND
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Bảng trạng thái các sân */}
            <Box mb={3}>
              <Typography variant="h6" mb={1}>
                Trạng thái các sân
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {fields.map((field) => (
                  <Card key={field._id} sx={{ minWidth: 220, mb: 1 }}>
                    <CardHeader
                      title={field.name}
                      subheader={field.type + " - " + field.location}
                      action={
                        <Chip
                          label={field.status}
                          color={statusColor(field.status)}
                          size="small"
                        />
                      }
                    />
                  </Card>
                ))}
              </Stack>
            </Box>

            {/* Lịch đặt sân trong ngày */}
            <Typography variant="h6" mt={3} mb={1}>
              Lịch đặt sân hôm nay
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
                    <TableRow key={booking._id}>
                      <TableCell>{booking.field?.name || "?"}</TableCell>
                      <TableCell>{booking.customerName || "?"}</TableCell>
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
