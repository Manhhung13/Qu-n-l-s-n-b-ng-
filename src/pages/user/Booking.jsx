import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function BookingForm() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [address, setAddress] = useState(""); // địa chỉ sân
  const [fieldName, setFieldName] = useState(""); // tên sân
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const field = searchParams.get("field");
  const date = searchParams.get("date");
  const start_time = searchParams.get("start_time");
  const end_time = searchParams.get("end_time");

  useEffect(() => {
    async function fetchField() {
      if (field) {
        try {
          const res = await axiosClient.get(`/fields/${field}`);
          setAddress(res.data.location || "");
          setFieldName(res.data.name || "");
        } catch {
          setAddress("");
        }
      }
    }
    fetchField();
  }, [field]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !phone || !email) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setSubmitting(true);
    try {
      // Giữ nguyên logic backend (chưa gọi thật)
      // await axiosClient.post("/booking", { field, date, start_time, end_time, name, phone, email, note });
      setSuccess("Đặt sân thành công!");
    } catch {
      setError("Đặt sân thất bại, vui lòng thử lại!");
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        py: 6,
        px: 2,
      }}
    >
      <Box maxWidth={1100} mx="auto">
        {/* Header giống banner nhỏ */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "linear-gradient(90deg, #111827, #020617)",
            background:
              "linear-gradient(135deg, #020617 0%, #111827 40%, #0f766e 100%)",
            color: "white",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Tìm Sân Cháy Đam Mê
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Nhập thông tin để hoàn tất đặt sân của bạn chỉ trong vài giây.
            </Typography>
          </Box>
          <Chip
            label="Bước 2 / Hoàn tất thông tin"
            sx={{ bgcolor: "rgba(15,118,110,0.2)", color: "#a5f3fc" }}
          />
        </Paper>

        {/* Nội dung chính: tóm tắt booking + form */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          alignItems="flex-start"
        >
          {/* Card tóm tắt đặt sân */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 3,
              bgcolor: "white",
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Thông tin đặt sân
            </Typography>
            <Typography variant="h6" fontWeight={700} mb={1}>
              {fieldName || "Sân bóng"}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {address || "Địa chỉ sẽ hiển thị tại đây"}
            </Typography>

            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, p: 2, mb: 2, bgcolor: "#f9fafb" }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Ngày
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {date || "--/--/----"}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Giờ chơi
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {start_time && end_time
                      ? `${start_time} - ${end_time}`
                      : "--:-- - --:--"}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            <Typography variant="caption" color="text.secondary">
              * Vui lòng kiểm tra kỹ thời gian và sân trước khi xác nhận đặt.
            </Typography>
          </Paper>

          {/* Form nhập thông tin khách */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              borderRadius: 3,
              p: 3,
              bgcolor: "white",
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Thông tin liên hệ
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Chúng tôi sẽ sử dụng thông tin này để xác nhận và liên hệ khi cần.
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Họ tên"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ghi chú cho sân / quản lý"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={3}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Button
                variant="contained"
                type="submit"
                disabled={submitting}
                fullWidth
                sx={{
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  borderRadius: 2,
                }}
              >
                Xác nhận đặt sân
              </Button>
            </form>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
