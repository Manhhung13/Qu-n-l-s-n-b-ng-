// frontend/src/pages/manager/Customers.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Box,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Paper,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

const rankOptions = [
  { label: "Thường", value: "standard" },
  { label: "VIP", value: "vip" },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [note, setNote] = useState("");
  const [rank, setRank] = useState("standard");

  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [fields, setFields] = useState([]);

  const [editingBooking, setEditingBooking] = useState(null);
  const [fieldName, setFieldName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [search, setSearch] = useState("");

  // ========== FETCH DATA ==========
  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/manager/customers");
      setCustomers(res.data);
    } catch {
      setError("Không lấy được danh sách khách hàng!");
    }
    setLoading(false);
  };

  const fetchFields = async () => {
    try {
      const res = await axiosClient.get("/manager/fields");
      setFields(res.data || []);
    } catch (err) {
      console.error("Không lấy được danh sách sân", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    fetchFields();
  }, []);

  // lấy giá sân theo tên sân
  const getFieldPriceByName = (name) => {
    const f = fields.find((field) => field.name === name);
    if (!f) return 0;
    return Number(f.price || 0);
  };

  // ========== FILTER + STATS ==========
  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const s = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.email.toLowerCase().includes(s) ||
        (c.phone || "").toLowerCase().includes(s)
    );
  }, [customers, search]);

  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.rank === "vip").length;
  const activeBookings = bookings.length;

  // ========== DIALOG SỬA KHÁCH ==========
  const handleOpenDialog = (customer) => {
    setEditingCustomer(customer);
    setNote(customer.note || "");
    setRank(customer.rank || "standard");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  const handleSave = async () => {
    try {
      await axiosClient.put(`/manager/customers/${editingCustomer._id}`, {
        note,
        rank,
      });
      await fetchCustomers();
      handleCloseDialog();
    } catch {
      setError("Không thể cập nhật thông tin khách hàng!");
    }
  };

  // ========== LỊCH SỬ ĐẶT SÂN ==========
  const resetBookingForm = () => {
    setEditingBooking(null);
    setFieldName("");
    setStartTime("");
    setEndTime("");
  };

  const handleOpenHistory = async (customer) => {
    setSelectedCustomer(customer);
    setOpenHistoryDialog(true);
    setBookingError("");
    setBookingLoading(true);
    resetBookingForm();
    try {
      const res = await axiosClient.get(
        `/manager/customers/${customer._id}/bookings`
      );
      setBookings(res.data || []);
    } catch {
      setBookingError("Không lấy được lịch sử đặt sân!");
    }
    setBookingLoading(false);
  };

  const handleCloseHistory = () => {
    setOpenHistoryDialog(false);
    setSelectedCustomer(null);
    setBookings([]);
    resetBookingForm();
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setFieldName(booking.fieldName || "");
    // booking.startTime dạng "YYYY-MM-DDTHH:mm:ss" => cắt còn 16 ký tự
    setStartTime(booking.startTime?.slice(0, 16) || "");
    setEndTime(booking.endTime?.slice(0, 16) || "");
  };

  const handleAddBooking = () => {
    resetBookingForm();
  };

  const handleSaveBooking = async () => {
    if (!selectedCustomer) return;

    const payload = {
      fieldName,
      // giữ nguyên string từ input datetime-local
      startTime: startTime || null,
      endTime: endTime || null,
    };

    try {
      if (editingBooking) {
        await axiosClient.put(
          `/manager/customers/${selectedCustomer._id}/bookings/${editingBooking._id}`,
          payload
        );
      } else {
        await axiosClient.post(
          `/manager/customers/${selectedCustomer._id}/bookings`,
          payload
        );
      }

      const res = await axiosClient.get(
        `/manager/customers/${selectedCustomer._id}/bookings`
      );
      setBookings(res.data || []);
      resetBookingForm();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể lưu thông tin đặt sân!";
      setBookingError(msg);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!selectedCustomer) return;
    if (!window.confirm("Bạn chắc chắn muốn xóa lần đặt sân này?")) return;

    try {
      await axiosClient.delete(
        `/manager/customers/${selectedCustomer._id}/bookings/${bookingId}`
      );
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch {
      setBookingError("Không thể xóa lần đặt sân!");
    }
  };

  // ========== UI ==========
  return (
    <ManagerLayout>
      <Container sx={{ mt: 3, mb: 4 }}>
        {/* Header + search */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          mb={3}
          gap={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Quản lý khách hàng
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem và quản lý danh sách khách đã từng đặt sân
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: "100%", md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Cards thống kê */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Tổng khách hàng
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalCustomers}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Khách VIP
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {vipCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Lần đặt sân đang xem
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {activeBookings}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <Box
              px={3}
              py={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Danh sách khách hàng
              </Typography>
            </Box>
            <Divider />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Khách hàng</TableCell>
                  <TableCell>Liên hệ</TableCell>
                  <TableCell>Xếp hạng</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell align="center">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((cus) => (
                  <TableRow key={cus._id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: "#1976d2" }}>
                          {cus.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{cus.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {cus.user_id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2">{cus.email}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {cus.phone}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cus.rank === "vip" ? "VIP" : "Standard"}
                        color={cus.rank === "vip" ? "warning" : "default"}
                        size="small"
                        variant={cus.rank === "vip" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 220 }}
                      >
                        {cus.note || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDialog(cus)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          size="small"
                          onClick={() => handleOpenHistory(cus)}
                        >
                          <HistoryIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Không tìm thấy khách hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* Dialog cập nhật ghi chú / xếp hạng */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Cập nhật xếp hạng / ghi chú KH</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={2}
            />
            <TextField
              select
              label="Xếp hạng"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            >
              {rankOptions.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSave} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog lịch sử đặt sân */}
        <Dialog
          open={openHistoryDialog}
          onClose={handleCloseHistory}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, overflow: "hidden" },
          }}
        >
          {/* Header thông tin khách */}
          <Box sx={{ p: 3, pb: 2, borderBottom: "1px solid #eee" }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "#1976d2", width: 40, height: 40 }}>
                {selectedCustomer?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {selectedCustomer?.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer?.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • {selectedCustomer?.phone}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} mt={0.5}>
                  <Chip
                    label={
                      selectedCustomer?.rank === "vip"
                        ? "VIP Status"
                        : "Standard"
                    }
                    size="small"
                    color={
                      selectedCustomer?.rank === "vip" ? "warning" : "default"
                    }
                    variant={
                      selectedCustomer?.rank === "vip" ? "filled" : "outlined"
                    }
                  />
                </Stack>
              </Box>
              <Box flexGrow={1} />
              <Button size="small" variant="outlined">
                In hồ sơ
              </Button>
            </Stack>
          </Box>

          <DialogContent sx={{ p: 0 }}>
            {/* Header bảng lịch sử */}
            <Box
              sx={{
                px: 3,
                pt: 2,
                pb: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                Lịch sử đặt sân
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bookings.length} lần đặt sân
              </Typography>
            </Box>

            {bookingError && (
              <Box px={3} pb={1}>
                <Alert severity="error">{bookingError}</Alert>
              </Box>
            )}

            {bookingLoading ? (
              <Box px={3} py={4} display="flex" justifyContent="center">
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Bảng lịch sử */}
                <Box px={3} pb={2}>
                  <Paper
                    variant="outlined"
                    sx={{ borderRadius: 2, overflow: "hidden" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Tên sân</TableCell>
                          <TableCell>Giờ bắt đầu</TableCell>
                          <TableCell>Giờ kết thúc</TableCell>
                          <TableCell>Giá (VNĐ)</TableCell>
                          <TableCell align="center">Thao tác</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bookings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              Chưa có lần đặt sân nào.
                            </TableCell>
                          </TableRow>
                        ) : (
                          bookings.map((b) => (
                            <TableRow key={b._id} hover>
                              <TableCell>{b.fieldName}</TableCell>
                              <TableCell>
                                {b.startTime &&
                                  new Date(b.startTime).toLocaleString("vi-VN")}
                              </TableCell>
                              <TableCell>
                                {b.endTime &&
                                  new Date(b.endTime).toLocaleString("vi-VN")}
                              </TableCell>
                              <TableCell>
                                {getFieldPriceByName(
                                  b.fieldName
                                ).toLocaleString("vi-VN")}
                              </TableCell>
                              <TableCell align="center">
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="center"
                                >
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEditBooking(b)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteBooking(b._id)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>

                {/* Form thêm / sửa booking */}
                <Box
                  sx={{
                    px: 3,
                    pt: 1,
                    pb: 2,
                    borderTop: "1px solid #f0f0f0",
                    mt: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>
                    {editingBooking
                      ? "Sửa thông tin lần đặt sân"
                      : "Thêm lần đặt sân mới"}
                  </Typography>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <TextField
                        select
                        label="Tên sân"
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        sx={{ minWidth: 200, flex: 1 }}
                      >
                        {fields.map((f) => (
                          <MenuItem key={f.id} value={f.name}>
                            {f.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      flexWrap="wrap"
                    >
                      <TextField
                        label="Giờ bắt đầu"
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 220, flex: 1 }}
                      />
                      <TextField
                        label="Giờ kết thúc"
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 220, flex: 1 }}
                      />
                    </Stack>
                  </Stack>
                </Box>
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={handleCloseHistory}>Hủy</Button>
            <Button onClick={handleSaveBooking} variant="contained">
              Lưu thay đổi
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ManagerLayout>
  );
}
