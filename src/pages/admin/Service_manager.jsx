import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  Stack,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: "", price: "" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/services");
      setServices(res.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Không thể tải dịch vụ!",
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      setForm({ name: service.name, price: service.price.toString() });
    } else {
      setEditingService(null);
      setForm({ name: "", price: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name || !form.price || isNaN(form.price)) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập tên và giá hợp lệ",
        severity: "warning",
      });
      return;
    }
    try {
      if (editingService) {
        await axiosClient.put(`/admin/services/${editingService.id}`, {
          name: form.name,
          price: parseFloat(form.price),
        });
        setSnackbar({
          open: true,
          message: "Cập nhật dịch vụ thành công",
          severity: "success",
        });
      } else {
        await axiosClient.post("/admin/services", {
          name: form.name,
          price: parseFloat(form.price),
        });
        setSnackbar({
          open: true,
          message: "Thêm dịch vụ thành công",
          severity: "success",
        });
      }
      fetchServices();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi lưu dịch vụ",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/admin/services/${id}`);
      setSnackbar({
        open: true,
        message: "Xóa dịch vụ thành công",
        severity: "success",
      });
      fetchServices();
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Lỗi khi xóa dịch vụ",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header + nút thêm */}
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Quản lý dịch vụ đính kèm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tùy chỉnh danh mục đồ uống, thức ăn và trang phục cho thuê.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: "#22c55e",
            borderRadius: 999,
            px: 3,
            "&:hover": { bgcolor: "#16a34a" },
          }}
        >
          Thêm dịch vụ
        </Button>
      </Box>

      {/* Danh sách dịch vụ */}
      <Box mb={1}>
        <Typography variant="subtitle2" color="text.secondary">
          Danh sách dịch vụ đang hoạt động
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        {services.map((service) => (
          <Paper
            key={service.id}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 3,
              boxShadow: 0,
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  bgcolor: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#16a34a",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {service.name.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Typography fontWeight={600}>{service.name}</Typography>
                <Chip
                  label="DỊCH VỤ"
                  size="small"
                  sx={{
                    mt: 0.3,
                    bgcolor: "#e5f2ff",
                    color: "#2563eb",
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={3}>
              <Typography
                fontWeight={700}
                color="success.main"
                sx={{ minWidth: 120, textAlign: "right" }}
              >
                {service.price.toLocaleString("vi-VN")} VND
              </Typography>
              <IconButton
                color="primary"
                onClick={() => handleOpenDialog(service)}
              >
                <Edit />
              </IconButton>
              <IconButton
                color="error"
                onClick={() => handleDelete(service.id)}
              >
                <Delete />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {!loading && services.length === 0 && (
          <Paper
            sx={{
              py: 4,
              borderRadius: 3,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            Không có dịch vụ nào
          </Paper>
        )}
      </Stack>

      {/* Dialog thêm/sửa */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingService ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên dịch vụ"
            fullWidth
            variant="standard"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Giá (VNĐ)"
            fullWidth
            variant="standard"
            name="price"
            value={form.price}
            onChange={handleChange}
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingService ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({ open: false, message: "", severity: "success" })
        }
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
