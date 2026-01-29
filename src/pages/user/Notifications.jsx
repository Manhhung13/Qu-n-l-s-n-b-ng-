import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Box,
  Stack,
} from "@mui/material";
// Sử dụng icon tròn đậm để giống ảnh
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- GIỮ NGUYÊN LOGIC FETCH DATA ---
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosClient.get("/notifications");
        setNotifications(res.data);
      } catch (error) {
        setError("Không lấy được danh sách thông báo.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // --- GIỮ NGUYÊN LOGIC CONFIRM ---
  const handleConfirm = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/confirm`);
      setNotifications((prev) =>
        prev.map((noti) =>
          noti._id === id ? { ...noti, status: "Đã xác nhận" } : noti
        )
      );
    } catch (error) {
      setError("Không thể xác nhận thông báo.");
    }
  };

  // --- GIỮ NGUYÊN LOGIC DELETE ---
  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((noti) => noti._id !== id));
    } catch (error) {
      setError("Không thể xoá thông báo.");
    }
  };

  return (
    <UserLayout showSidebar={true}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* TIÊU ĐỀ GIỐNG ẢNH */}
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            mb: 4,
            textTransform: "none", // Không viết hoa toàn bộ nếu muốn giống ảnh
          }}
        >
          Danh sách thông báo
        </Typography>

        {loading ? (
          <Box textAlign="center" py={5}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Alert severity="info" sx={{ justifyContent: "center" }}>
            Bạn chưa có thông báo nào!
          </Alert>
        ) : (
          // DANH SÁCH DẠNG THẺ RỜI (STACK)
          <Stack spacing={2.5}>
            {notifications.map((noti) => (
              <Paper
                key={noti._id}
                elevation={3}
                sx={{
                  p: 3,
                  borderRadius: 3, // Bo góc tròn như ảnh
                  display: "flex",
                  alignItems: "flex-start", // Căn hàng ngang, nội dung lên trên
                  justifyContent: "space-between",
                  bgcolor: "#fff",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 6,
                  },
                }}
              >
                {/* PHẦN NỘI DUNG BÊN TRÁI */}
                <Box sx={{ flex: 1, mr: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.1rem",
                      color: "#333",
                      mb: 1.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {noti.content}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                  >
                    {/* Thời gian text xám nhỏ */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6b7280",
                        fontSize: "0.85rem",
                      }}
                    >
                      {new Date(noti.created_at).toLocaleString("vi-VN")}
                    </Typography>

                    {/* Chip trạng thái màu cam/xanh */}
                    <Chip
                      label={noti.status || "chưa xác nhận"}
                      size="small"
                      sx={{
                        bgcolor:
                          noti.status === "Đã xác nhận" ? "#2e7d32" : "#ed6c02", // Xanh đậm hoặc Cam
                        color: "#fff",
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 26,
                        px: 0.5,
                      }}
                    />
                  </Stack>
                </Box>

                {/* PHẦN NÚT BẤM BÊN PHẢI */}
                <Stack direction="row" alignItems="center" spacing={1}>
                  {/* Nút xác nhận (Xanh lá) - Chỉ hiện khi chưa xác nhận */}
                  {noti.status !== "Đã xác nhận" && (
                    <IconButton
                      onClick={() => handleConfirm(noti._id)}
                      sx={{
                        color: "#4caf50", // Màu xanh lá
                        p: 0.5,
                        "&:hover": { bgcolor: "#e8f5e9" },
                      }}
                      title="Xác nhận"
                    >
                      {/* Icon tròn có dấu tích */}
                      <CheckCircleIcon sx={{ fontSize: 34, opacity: 0.8 }} />
                    </IconButton>
                  )}

                  {/* Nút xóa (Đỏ) */}
                  <IconButton
                    onClick={() => handleDelete(noti._id)}
                    sx={{
                      color: "#d32f2f", // Màu đỏ
                      p: 0.5,
                      "&:hover": { bgcolor: "#ffebee" },
                    }}
                    title="Xoá thông báo"
                  >
                    {/* Icon tròn có dấu X */}
                    <CancelIcon sx={{ fontSize: 34, opacity: 0.8 }} />
                  </IconButton>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>
    </UserLayout>
  );
}
