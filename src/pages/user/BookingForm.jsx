import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";

// bookingInfo và onClose nhận từ Home
export default function BookingForm({ bookingInfo, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Nếu bookingInfo chưa sẵn sàng thì không render gì cả
  if (!bookingInfo) return null;

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
      await axiosClient.post("/bookings", {
        field_id: bookingInfo.field_id,
        date: bookingInfo.date,
        start_time: bookingInfo.start_time,
        end_time: bookingInfo.end_time,
        name,
        phone,
        email,
        note,
      });
      setSuccess("Đặt sân thành công!");
    } catch {
      setError("Đặt sân thất bại, vui lòng thử lại!");
    }
    setSubmitting(false);
  };

  return (
    <Box maxWidth={480} mx="auto" mt={2} component={Paper} p={3}>
      <Typography variant="h5" mb={2}>
        Nhập Thông Tin Đặt Sân
      </Typography>
      <Typography mb={2}>
        Sân: <b>{bookingInfo.field_name}</b>
        <br />
        Địa chỉ: <b>{bookingInfo.location}</b>
        <br />
        Ngày: <b>{bookingInfo.date}</b>
        <br />
        Giờ:{" "}
        <b>
          {bookingInfo.start_time} - {bookingInfo.end_time}
        </b>
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
          label="Ghi chú"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mb: 2 }}
          multiline
          rows={2}
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
        <Button
          variant="contained"
          type="submit"
          disabled={submitting}
          fullWidth
        >
          Xác nhận đặt sân
        </Button>
      </form>
    </Box>
  );
}
