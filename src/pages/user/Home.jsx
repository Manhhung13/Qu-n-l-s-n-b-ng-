import React, { useEffect, useState } from "react";
import demoFieldImage from "../../assets/san-bong-mini.jpg"; // Đảm bảo đường dẫn đúng
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
  Divider,
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

  useEffect(() => {
    if (startTime && endTime && startTime >= endTime) {
      setTimeError(
        "Khung giờ không hợp lệ: Giờ bắt đầu phải trước giờ kết thúc."
      );
    } else setTimeError("");
  }, [startTime, endTime]);

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
    <UserLayout showSidebar={true}>
      <Box
        sx={{
          width: "100%",
          px: { xs: 2, md: 3 },
          pb: 4,
          bgcolor: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        {/* BANNER */}
        <Box
          sx={{
            position: "relative",
            height: 260,
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "url(https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1600), linear-gradient(135deg,#066839,#0b9b4c)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "brightness(0.85)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.3)",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: 2,
              textAlign: "center",
              color: "#fff",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: 24, md: 36 },
                textShadow: "0 2px 10px rgba(0,0,0,0.5)",
              }}
            >
              Tìm Sân Cháy{" "}
              <Box component="span" sx={{ color: "#4ade80" }}>
                Đam Mê
              </Box>
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: { xs: 20, md: 28 },
                opacity: 0.9,
              }}
            >
              Nâng Tầm Trận Đấu
            </Typography>
          </Box>
        </Box>

        {/* FILTER BAR */}
        <Box
          sx={{
            mt: -4,
            mx: { xs: 0, md: 4 },
            position: "relative",
            zIndex: 2,
            bgcolor: "#fff",
            borderRadius: 3,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            p: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              placeholder="Tìm tên sân, địa điểm..."
              variant="outlined"
              size="medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 2 }}
            />

            <FormControl sx={{ minWidth: 120, flex: 1 }} size="medium">
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
              label="Ngày đá"
              type="date"
              size="medium"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150, flex: 1 }}
            />

            <Stack
              direction="row"
              spacing={2}
              sx={{ flex: 1.5, width: "100%" }}
            >
              <FormControl fullWidth size="medium">
                <InputLabel>Bắt đầu</InputLabel>
                <Select
                  value={startTime}
                  label="Bắt đầu"
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {slotOptions.map((slot) => (
                    <MenuItem key={slot} value={slot}>
                      {slot}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel>Kết thúc</InputLabel>
                <Select
                  value={endTime}
                  label="Kết thúc"
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

            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#00BA74",
                px: 4,
                height: 56,
                fontWeight: "bold",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "#00965E",
                  boxShadow: "0 4px 12px rgba(0,186,116,0.3)",
                },
              }}
            >
              TÌM KIẾM
            </Button>
          </Stack>

          {(timeError || error) && (
            <Alert severity={timeError ? "warning" : "error"} sx={{ mt: 2 }}>
              {timeError || error}
            </Alert>
          )}
          {(!date || !startTime || !endTime) && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
                border: "1px solid #bae6fd",
                bgcolor: "#e0f2fe",
                color: "#0369a1",
              }}
            >
              Vui lòng chọn <b>Ngày</b> và <b>Khung giờ</b> để xem sân trống.
            </Alert>
          )}
        </Box>

        {/* DANH SÁCH SÂN */}
        <Box sx={{ mt: 4 }}>
          {loading ? (
            <Box textAlign="center" py={5}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {fields.map((field) => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={field.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      border: "1px solid #e0e0e0",
                      boxShadow: "none",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                        borderColor: "transparent",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={field.image_url || demoFieldImage}
                      alt={field.name}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="start"
                        mb={1}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          noWrap
                          sx={{ maxWidth: "70%" }}
                        >
                          {field.name}
                        </Typography>
                        <Chip
                          label={field.type}
                          size="small"
                          sx={{
                            bgcolor: "#F3F4F6",
                            fontWeight: "bold",
                            color: "#374151",
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        📍 {field.location}
                      </Typography>

                      <Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

                      <Stack
                        direction="row"
                        justifyContent="space_between"
                        alignItems="center"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          color="#00BA74"
                        >
                          {formatVND(field.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          / 90p
                        </Typography>
                      </Stack>

                      <Box mt={2}>
                        {field.booked ? (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            disabled
                          >
                            Đã có người đặt
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="contained"
                            sx={{
                              bgcolor: "#00BA74",
                              "&:hover": { bgcolor: "#00965E" },
                            }}
                            onClick={() => handleOpenBooking(field)}
                          >
                            Đặt sân ngay
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {!loading &&
            fields.length === 0 &&
            date &&
            startTime &&
            endTime &&
            !error && (
              <Box textAlign="center" py={5}>
                <Typography variant="h6" color="text.secondary">
                  Không tìm thấy sân phù hợp trong khung giờ này.
                </Typography>
              </Box>
            )}
        </Box>

        {/* Popup Booking */}
        <Dialog
          open={openBooking}
          onClose={() => setOpenBooking(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ position: "relative", pt: 4, pb: 4 }}>
            <IconButton
              onClick={() => setOpenBooking(false)}
              sx={{ position: "absolute", right: 8, top: 8 }}
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
      </Box>
    </UserLayout>
  );
}
