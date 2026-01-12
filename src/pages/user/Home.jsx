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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeError, setTimeError] = useState("");
  const [openBooking, setOpenBooking] = useState(false);
  const [bookingInfo, setBookingInfo] = useState(null);

  // Kiểm tra giờ hợp lệ
  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) {
      setTimeError(
        "Khung giờ không hợp lệ: Giờ bắt đầu phải trước giờ kết thúc."
      );
    } else setTimeError("");
  }, [startTime, endTime]);

  // Chỉ fetch khi đã chọn đủ date + giờ và không lỗi
  useEffect(() => {
    if (!date || !startTime || !endTime || timeError) {
      setFields([]);
      return;
    }

    const fetchFields = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          date,
          start_time: startTime,
          end_time: endTime,
        };
        if (type) params.type = type;
        if (status) params.status = status;
        if (price) params.price = price;
        if (search) params.q = search;

        const res = await axiosClient.get("/fields", { params });
        setFields(res.data);
      } catch {
        setError("Không thể tải danh sách sân. Hãy thử lại.");
        setFields([]);
      }
      setLoading(false);
    };

    fetchFields();
  }, [date, startTime, endTime, search, type, status, price, timeError]);

  const handleOpenBooking = (field) => {
    if (!date || !startTime || !endTime || timeError) {
      setError(
        "Vui lòng chọn ngày, giờ bắt đầu và giờ kết thúc hợp lệ trước khi đặt sân."
      );
      return;
    }
    setError("");
    setBookingInfo({
      field_id: field.id,
      field_name: field.name,
      location: field.location,
      type: field.type,
      price: field.price,
      date,
      start_time: startTime,
      end_time: endTime,
    });
    setOpenBooking(true);
  };

  function formatVND(price) {
    if (!price) return "0 VND";
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  }

  return (
    <UserLayout>
      {/* Wrapper chung: banner + filter + list đều căn theo maxWidth này */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          pb: 6,
        }}
      >
        {/* BANNER */}
        <Box
          sx={{
            position: "relative",
            height: 260,
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Ảnh nền – không chặn click */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1600), linear-gradient(135deg,#066839,#0b9b4c)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.85)",
              pointerEvents: "none",
            }}
          />
          {/* Lớp phủ – không chặn click */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.35)",
              pointerEvents: "none",
            }}
          />
          {/* Nội dung chữ */}
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
                color: "#fff",
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: 28, md: 36 },
                  textShadow: "0 2px 6px rgba(0,0,0,0.45)",
                }}
              >
                Tìm Sân Cháy{" "}
                <Box component="span" sx={{ color: "#34ff85" }}>
                  Đam Mê
                </Box>
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: 24, md: 32 },
                  textShadow: "0 2px 6px rgba(0,0,0,0.45)",
                }}
              >
                Nâng Tầm Trận Đấu
              </Typography>
              <Typography
                sx={{
                  maxWidth: 600,
                  mx: "auto",
                  fontSize: 14,
                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                }}
              >
                Đặt sân cỏ nhân tạo chất lượng cao, vị trí thuận tiện, giá tốt
                và thanh toán linh hoạt.
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Card filter nổi trên banner, cùng chiều rộng với banner */}
        <Box
          sx={{
            mt: -8,
            position: "relative",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
              p: 2.5,
              mb: 3,
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                placeholder="Tìm sân, quận, hoặc địa chỉ..."
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
                sx={{ flex: 2, minWidth: 220 }}
              />

              <FormControl sx={{ minWidth: 140 }}>
                <InputLabel>Loại sân</InputLabel>
                <Select
                  value={type}
                  label="Loại sân"
                  onChange={(e) => setType(e.target.value)}
                >
                  {fieldTypes.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Ngày"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <FormControl sx={{ minWidth: 130 }}>
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

              <FormControl sx={{ minWidth: 130 }}>
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

              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#00c853",
                  px: 4,
                  height: 48,
                  "&:hover": { bgcolor: "#00b34a" },
                }}
              >
                TÌM KIẾM
              </Button>
            </Stack>

            {timeError && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                {timeError}
              </Alert>
            )}
            {error && !timeError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {!date || !startTime || !endTime ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                Vui lòng chọn ngày, giờ bắt đầu và giờ kết thúc để hiển thị danh
                sách sân.
              </Alert>
            ) : null}
          </Box>
        </Box>

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

        {/* Danh sách sân bóng – nằm trong cùng wrapper, nên ngang với banner */}
        {loading ? (
          <Box mt={6} textAlign="center">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={field.id}>
                <Card
                  sx={{
                    height: 370,
                    minWidth: 260,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    boxShadow: 2,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    alt={field.name}
                    image={field.image_url || demoFieldImage}
                    sx={{
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      pt: 1.5,
                    }}
                  >
                    <Typography variant="h6" noWrap>
                      {field.name}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: 13,
                        mb: 1,
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                      noWrap
                    >
                      {field.location}
                    </Typography>

                    <Box
                      mt={0.5}
                      mb={1}
                      minHeight={38}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Chip
                        label={field.status || "Không rõ trạng thái"}
                        color={statusColors[field.status] || defaultStatusColor}
                        size="small"
                        sx={{
                          minWidth: 90,
                          justifyContent: "center",
                          borderRadius: 2,
                          fontWeight: 500,
                        }}
                      />
                      <Chip
                        label={field.type}
                        color="info"
                        size="small"
                        sx={{
                          minWidth: 60,
                          justifyContent: "center",
                          borderRadius: 2,
                        }}
                      />
                      {field.status !== "sân đang bảo trì" && (
                        <Chip
                          label={
                            field.booked
                              ? `Đã đặt: ${field.booked}`
                              : "Trống khung giờ này"
                          }
                          color={field.booked ? "warning" : "success"}
                          size="small"
                          sx={{
                            minWidth: 110,
                            justifyContent: "center",
                            borderRadius: 2,
                            backgroundColor: field.booked
                              ? "#ffe082"
                              : "#bbf7d0",
                            color: field.booked ? "#8d6e63" : "#218838",
                            fontWeight: 500,
                            fontSize: 13,
                          }}
                        />
                      )}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, fontWeight: "bold", minHeight: 28 }}
                    >
                      {formatVND(field.price)} / trận/90 phút
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} />

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={Boolean(field.booked)}
                      sx={{
                        mt: 1,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: "0.5px",
                      }}
                      onClick={() => handleOpenBooking(field)}
                    >
                      Đặt sân
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!fields.length &&
              date &&
              startTime &&
              endTime &&
              !loading &&
              !error && (
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
