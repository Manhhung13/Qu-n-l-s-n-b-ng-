import React, { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Modal,
} from "@mui/material";

// Hàm tính số phút giữa hai chuỗi hh:mm
function diffMinutes(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

// Hàm tính tiền cọc 50%
function calculateDeposit(start, end, price) {
  const minutes = diffMinutes(start, end);
  const session = Math.max(1, Math.round(minutes / 90));
  return Math.round(session * price * 0.5);
}

// Đường dẫn QR code tĩnh, có thể đổi thành dynamic nếu cần
import qrImage from "../../assets/ma_QR.png"; // Thay bằng đường dẫn thực tế
const qrAccountName = "Trần Mạnh Hùng"; // Đổi tên theo nhu cầu

export default function BookingForm({ bookingInfo, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(900); // 900s = 15 phút

  if (!bookingInfo) return null;

  const deposit = calculateDeposit(
    bookingInfo.start_time,
    bookingInfo.end_time,
    bookingInfo.price
  );

  // Đếm ngược khi showQR
  useEffect(() => {
    if (!showQR) return;
    if (countdown <= 0) {
      setShowQR(false);
      setError("Đã hết thời gian chờ chuyển khoản, vui lòng đặt lại!");
      // Có thể gọi API xóa booking, nhưng backend nên tự động xử lý.
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [showQR, countdown]);

  // Đặt sân (trạng thái pending)
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
        status: "chờ xác nhận",
      });
      setShowQR(true);
      setSuccess(""); // Ẩn success message, show QR
      setCountdown(900);
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
        <br />
        Giá/90 phút: <b>{bookingInfo.price?.toLocaleString()}đ</b>
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
      {/* Modal hiển thị QR chuyển khoản */}
      <Modal open={showQR} onClose={() => setShowQR(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fff",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
            minWidth: 320,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Quét mã QR & chuyển khoản đặt cọc
          </Typography>
          <img
            src={qrImage}
            alt="QR Code"
            width={270}
            style={{ marginBottom: 8 }}
          />
          <Typography>
            Chủ tài khoản: <b>{qrAccountName}</b>
          </Typography>
          <Typography>
            Số tiền đặt cọc: <b>{deposit && deposit.toLocaleString()}đ</b>
          </Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            Vui lòng chuyển khoản đặt cọc trong{" "}
            <b>
              {Math.floor(countdown / 60)}:
              {(countdown % 60).toString().padStart(2, "0")}
            </b>{" "}
            phút.Nội dung chuyển khoản là thông tin đặt sân . Sau 15 phút nếu
            chưa chuyển khoản, sân sẽ tự động huỷ!
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            fullWidth
            onClick={() => {
              setShowQR(false);
              if (onClose) onClose();
            }}
          >
            Đóng
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
