import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";
import useAuth from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [keepLogin, setKeepLogin] = useState(true);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.post("/users/login", form);
      console.log(res.data);
      login(res.data.user, res.data.token);
      // Kiểm tra role và điều hướng
      const role = res.data?.user?.role;
      if (role === "admin") {
        navigate("/admin/reports");
      } else if (role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Sai tài khoản hoặc mật khẩu, vui lòng thử lại!"
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
      <Paper elevation={3} sx={{ width: 380, p: 4 }}>
        <Box textAlign="center" mb={2}>
          <img
            alt="Logo"
            src="/logo192.png"
            style={{ width: 48, height: 48 }}
          />
        </Box>
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
          Hi, Welcome Back
        </Typography>
        <Typography color="text.secondary" textAlign="center" mb={3}>
          Enter your credentials to continue
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address / Username"
            name="email"
            fullWidth
            size="small"
            value={form.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
            autoComplete="username"
            required
          />
          <TextField
            label="Password"
            name="password"
            fullWidth
            size="small"
            type={showPw ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 2 }}
            required
            autoComplete="current-password"
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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={2}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                />
              }
              label="Keep me logged in"
            />
            <Link href="#" underline="hover" fontSize={14}>
              Forgot Password?
            </Link>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}
          <Button
            variant="contained"
            fullWidth
            size="large"
            type="submit"
            sx={{ mb: 2, bgcolor: "#6a47ca" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign In"}
          </Button>
        </form>
        <Typography textAlign="center" fontSize={14}>
          Don't have an account? <Link to="/register">Register</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
