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
import useAuth from "../../context/useAuth"; // hoặc nơi bạn lưu AuthContext
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.post("/users/login", form);
      setUser(res.data); // Lưu user/token toàn cục
      localStorage.setItem("user", JSON.stringify(res.data)); // lưu phiên
      navigate("/home"); // Đổi route về trang chính hoặc dashboard
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Sai tài khoản hoặc mật khẩu, vui lòng thử lại!"
      );
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <Container maxWidth="xs" sx={{ mt: 8 }}>
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
            Đăng nhập hệ thống
          </Typography>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
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
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            size="large"
          >
            {loading ? <CircularProgress size={26} /> : "Đăng nhập"}
          </Button>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}
