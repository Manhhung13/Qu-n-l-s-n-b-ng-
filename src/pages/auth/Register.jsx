import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Header from "../../components/Header";
import axiosClient from "../../api/axiosClient";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm
    )
      return "Vui lòng điền đầy đủ thông tin!";
    if (form.password !== form.confirm)
      return "Mật khẩu nhập lại không trùng khớp!";
    if (form.password.length < 6) return "Mật khẩu phải từ 6 ký tự trở lên!";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      // Đăng ký gửi lên backend
      const res = await axiosClient.post("/users/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setUser(res.data); // Lưu user/toàn cục
      localStorage.setItem("user", JSON.stringify(res.data));
      setSuccess("Đăng ký thành công! Đang chuyển trang...");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Đăng ký thất bại, kiểm tra lại thông tin!"
      );
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <Container maxWidth="xs" sx={{ mt: 5 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 3,
            bgcolor: "#fff",
            borderRadius: 2,
            boxShadow: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h5" align="center" mb={2}>
            Đăng ký tài khoản mới
          </Typography>
          <TextField
            label="Họ tên"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            //type="email"
          />
          <TextField
            label="Mật khẩu"
            name="password"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPw((show) => !show)}
                  >
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Nhập lại mật khẩu"
            name="confirm"
            type={showPw ? "text" : "password"}
            value={form.confirm}
            onChange={handleChange}
            required
          />
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={26} /> : "Đăng ký"}
          </Button>
        </Box>
      </Container>
    </>
  );
}
