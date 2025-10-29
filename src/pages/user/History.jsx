import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Alert,
  CircularProgress,
  Box,
} from "@mui/material";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";

const statusColors = {
  Đặt: "info",
  "Hoàn thành": "success",
  Hủy: "error",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        // API /bookings?userId={...} hoặc tự động từ token đăng nhập
        const res = await axiosClient.get("/bookings/history");
        setHistory(res.data);
      } catch (err) {
        setError("Không thể lấy lịch sử đặt sân!");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <UserLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Lịch sử đặt sân
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : history.length === 0 ? (
          <Alert severity="info">Bạn chưa có lịch sử đặt sân.</Alert>
        ) : (
          <Box sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tên sân</TableCell>
                  <TableCell>Loại sân</TableCell>
                  <TableCell>Địa điểm</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Khung giờ</TableCell>
                  <TableCell>Chi phí</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.field?.name || "?"}</TableCell>
                    <TableCell>{item.field?.type || "?"}</TableCell>
                    <TableCell>{item.field?.location || "?"}</TableCell>
                    <TableCell>
                      {new Date(item.date).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>{item.timeSlot}</TableCell>
                    <TableCell>
                      {item.field?.price
                        ? item.field.price.toLocaleString("vi-VN") + " VND"
                        : "?"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={statusColors[item.status] || "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Container>
    </UserLayout>
  );
}
