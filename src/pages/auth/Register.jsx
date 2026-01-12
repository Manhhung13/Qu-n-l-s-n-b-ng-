import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Container,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.jpg";
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    // Thêm các trường khác ở đây nếu muốn (ví dụ: address, gender...)
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
        // Thêm trường khác như address: form.address nếu có
      });
      setUser(res.data);
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
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={3} sx={{ width: 400, p: 4 }}>
        <Box textAlign="center" mb={2}>
          <img alt="Logo" src={logo} style={{ width: 200, height: 200 }} />
        </Box>
        <Typography variant="h5" fontWeight="bold" align="center" mb={1}>
          Create Your Account
        </Typography>
        <Typography color="text.secondary" textAlign="center" mb={3}>
          Sign up with your email and password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Họ tên"
            name="name"
            fullWidth
            value={form.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            fullWidth
            value={form.phone}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Email"
            name="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            // type="email"
          />
          <TextField
            label="Mật khẩu"
            name="password"
            fullWidth
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
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
            fullWidth
            type={showPw ? "text" : "password"}
            value={form.confirm}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
          />
          {/* Thêm trường khác bên dưới (nếu cần) */}
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
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
            fullWidth
            sx={{ mb: 2, bgcolor: "#6a47ca" }}
          >
            {loading ? <CircularProgress size={26} /> : "Register"}
          </Button>
        </form>
        <Typography textAlign="center" fontSize={14}>
          Already have an account? <Link to="/">Sign In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
