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
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import axiosClient from "../../api/axiosClient";
import UserLayout from "../../layouts/UserLayout";
import BookingForm from "./BookingForm";

const fieldTypes = [
  { value: "", label: "Tất cả" },
  { value: "5vs5", label: "5 người" },
  { value: "7vs7", label: "7 người" },
  { value: "11vs11", label: "11 người" },
];

function generateTimeSlots(start = "05:00", end = "23:30") {
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  while (h < endH || (h === endH && m <= endM)) {
    slots.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
    m += 30;
    if (m === 60) {
      h += 1;
      m = 0;
    }
  }
  return slots;
}
const slotOptions = generateTimeSlots();

// Map trạng thái thành màu chip trực quan
const statusColors = {
  "sân hoạt động bình thường": "success",
  "sân đang bảo trì": "warning",
  "đã đặt": "primary",
  "đang sử dụng": "default",
};
const defaultStatusColor = "default";

export default function Home() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState(""); // Add status filter if muốn filter theo trạng thái
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [openBooking, setOpenBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);

  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) {
      setTimeError(
        "Khung giờ không hợp lệ: Giờ bắt đầu phải trước giờ kết thúc."
      );
    } else setTimeError("");
  }, [startTime, endTime]);

  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) return;
    const fetchFields = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {};
        if (type) params.type = type;
        if (status) params.status = status;
        if (price) params.price = price;
        if (search) params.q = search;
        if (date) params.date = date;
        if (startTime) params.start_time = startTime;
        if (endTime) params.end_time = endTime;
        const res = await axiosClient.get("/fields", { params });
        setFields(res.data); // Nếu API trả về `fields: [...]` thì setFields(res.data.fields)
      } catch {
        setError("Vui lòng nhập date, start_time và end_time để chọn sân!");
      }
      setLoading(false);
    };
    fetchFields();
  }, [search, type, status, price, date, startTime, endTime]);

  const handleOpenBooking = (field) => {
    setBookingInfo({
      field_id: field.id,
      field_name: field.name,
      location: field.location,
      type: field.type,
      price: field.price,
      date: date,
      start_time: startTime,
      end_time: endTime,
    });
    setOpenBooking(true);
  };

  // Giao diện phần Home
  return (
    <UserLayout>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h4" mb={3}>
          Tìm Sân Bóng
        </Typography>
        {/* Bộ lọc */}
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
            sx={{ minWidth: 240 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
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
          <FormControl sx={{ minWidth: 120 }}>
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

          <TextField
            label="Ngày"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 130 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Giờ bắt đầu</InputLabel>
            <Select
              value={startTime}
              label="Giờ bắt đầu"
              onChange={(e) => setStartTime(e.target.value)}
            >
              {slotOptions.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Giờ kết thúc</InputLabel>
            <Select
              value={endTime}
              label="Giờ kết thúc"
              onChange={(e) => setEndTime(e.target.value)}
            >
              {slotOptions.map((slot) => (
                <MenuItem key={slot} value={slot}>
                  {slot}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        {timeError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {timeError}
          </Alert>
        )}

        {/* Popup booking */}
        <Dialog
          open={openBooking}
          onClose={() => setOpenBooking(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ position: "relative", pt: 2 }}>
            <IconButton
              aria-label="close"
              onClick={() => setOpenBooking(false)}
              sx={{ position: "absolute", right: 8, top: 8, zIndex: 10 }}
            >
              <CloseIcon />
            </IconButton>
            {bookingInfo && (
              <BookingForm
                bookingInfo={bookingInfo}
                onClose={() => setOpenBooking(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Hiển thị danh sách sân bóng với trạng thái */}
        {loading ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} key={field.id}>
                <Card>
                  <CardMedia
                    component="img"
                    height="150"
                    alt={field.name}
                    image={field.image_url || demoFieldImage}
                  />
                  <CardContent>
                    <Typography variant="h6" noWrap>
                      {field.name}
                    </Typography>
                    <Typography color="text.secondary" noWrap>
                      {field.location}
                    </Typography>
                    <Box mt={1} mb={1}>
                      {/* Trạng thái sân */}
                      <Chip
                        label={field.status || "Không rõ trạng thái"}
                        color={statusColors[field.status] || defaultStatusColor}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip label={field.type} color="info" size="small" />
                      {field.status !== "sân đang bảo trì" && (
                        <Chip
                          label={
                            field.booked
                              ? `Đã đặt: ${field.booked}`
                              : "Trống khung giờ này"
                          }
                          color={field.booked ? "warning" : "success"}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "bold" }}
                    >
                      {field.price?.toLocaleString("vi-VN")}đ / trận/90 phút
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={Boolean(field.booked)}
                      onClick={() => handleOpenBooking(field)}
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
