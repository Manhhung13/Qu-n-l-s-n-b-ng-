import React, { useEffect, useState } from "react";
import demoFieldImage from "../../assets/san-bong-mini.jpg";

import {
  Grid,
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Button,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axiosClient from "../../api/axiosClient";
import UserLayout from "../../layouts/UserLayout";
const fieldTypes = [
  { value: "", label: "Tất cả" },
  { value: "5vs5", label: "5 người" },
  { value: "7vs7", label: "7 người" },
  { value: "11vs11", label: "11 người" },
];

const statusColors = {
  Trống: "success",
  "Đã đặt": "warning",
};

export default function Home() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // State cho filter/tìm kiếm
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");

  // Gọi API lấy danh sách sân
  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      setError("");
      try {
        // Nhận filter gửi lên backend nếu có API hỗ trợ
        const params = {};
        if (type) params.type = type;
        if (status) params.status = status;
        if (price) params.price = price;
        if (search) params.q = search;
        const res = await axiosClient.get("/fields", { params });
        setFields(res.data);
      } catch {
        setError("Không thể tải danh sách sân!");
      }
      setLoading(false);
    };

    fetchFields();
  }, [search, type, status, price]);

  return (
    <UserLayout>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h4" mb={3}>
          Tìm Sân Bóng
        </Typography>
        {/* Thanh tìm kiếm */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          mb={2}
          alignItems="center"
        >
          <TextField
            placeholder="Tìm theo tên sân, địa chỉ..."
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 260 }}
          />
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Loại sân</InputLabel>
            <Select
              value={type}
              label="Loại sân"
              onChange={(e) => setType(e.target.value)}
            >
              {fieldTypes.map((opt) => (
                <MenuItem value={opt.value} key={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={status}
              label="Trạng thái"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="Trống">Trống</MenuItem>
              <MenuItem value="Đã đặt">Đã đặt</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 130 }}>
            <InputLabel>Giá</InputLabel>
            <Select
              value={price}
              label="Giá"
              onChange={(e) => setPrice(e.target.value)}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="1">Dưới 300.000đ</MenuItem>
              <MenuItem value="2">300.000đ - 500.000đ</MenuItem>
              <MenuItem value="3">Trên 500.000đ</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Nội dung */}
        {loading ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field._id}>
                <Card>
                  {/* Ảnh demo hoặc lấy từ backend */}
                  <CardMedia
                    component="img"
                    height="150"
                    alt={field.name}
                    image={demoFieldImage}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {field.name}
                    </Typography>
                    <Typography color="text.secondary" noWrap>
                      {field.location}
                    </Typography>
                    <Box mt={1} mb={1}>
                      <Chip
                        label={field.status}
                        color={statusColors[field.status] || "default"}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip label={field.type} color="info" size="small" />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "bold" }}
                    >
                      {field.price?.toLocaleString("vi-VN")}đ / trận
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={field.status !== "Trống"}
                      href={`/booking?field=${field._id}`}
                    >
                      Đặt sân
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!fields.length && (
              <Grid item xs={12}>
                <Alert severity="info">Không có sân phù hợp</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </UserLayout>
  );
}
