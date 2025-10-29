import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";

// Component Booking
export default function Booking() {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    field: "",
    date: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [fetchingFields, setFetchingFields] = useState(true);

  // Lấy danh sách sân từ backend
  useEffect(() => {
    const fetchFields = async () => {
      setFetchingFields(true);
      try {
        const response = await axiosClient.get("/fields");
        setFields(response.data);
      } catch (error) {
        setErrorMsg("Không lấy được danh sách sân.");
      } finally {
        setFetchingFields(false);
      }
    };
    fetchFields();
  }, []);

  // Gửi dữ liệu đặt sân
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await axiosClient.post("/bookings", {
        customerName: form.name,
        phone: form.phone,
        email: form.email,
        fieldId: form.field,
        date: form.date,
        timeSlot: form.time,
      });
      setSuccessMsg("Đặt sân thành công!");
      setForm({
        name: "",
        phone: "",
        email: "",
        field: "",
        date: "",
        time: "",
      });
    } catch (error) {
      setErrorMsg(error?.response?.data?.message || "Đặt sân thất bại!");
    }
    setLoading(false);
  };

  return (
    <UserLayout>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Đặt sân online
        </Typography>

        {fetchingFields ? (
          <CircularProgress />
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Họ và tên"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              required
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Email"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              select
              label="Chọn sân"
              value={form.field}
              required
              onChange={(e) => setForm({ ...form, field: e.target.value })}
            >
              {fields.map((f) => (
                <MenuItem key={f._id} value={f._id}>
                  {f.name} - {f.type} ({f.location})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Ngày"
              InputLabelProps={{ shrink: true }}
              value={form.date}
              required
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <TextField
              select
              label="Khung giờ"
              value={form.time}
              required
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            >
              <MenuItem value="6:00 - 8:00">6:00 - 8:00</MenuItem>
              <MenuItem value="8:00 - 10:00">8:00 - 10:00</MenuItem>
              <MenuItem value="10:00 - 12:00">10:00 - 12:00</MenuItem>
              {/* Có thể mở rộng thêm các khung giờ khác */}
            </TextField>
            {successMsg && <Alert severity="success">{successMsg}</Alert>}
            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Xác nhận đặt sân"}
            </Button>
          </Box>
        )}
      </Container>
    </UserLayout>
  );
}
