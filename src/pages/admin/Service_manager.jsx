import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: "", price: "" });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Load danh sách dịch vụ ngoài
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/services"); // endpoint lấy danh sách
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

  // Mở dialog thêm hoặc sửa
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

  // Xử lý nhập form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Thêm hoặc sửa dịch vụ
  const handleSave = async () => {
    // validate đơn giản
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
        // Sửa
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
        // Thêm mới
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
      console.error(error);
      setSnackbar({
        open: true,
        message: "Lỗi khi lưu dịch vụ",
        severity: "error",
      });
    }
  };

  // Xóa dịch vụ
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
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý dịch vụ ngoài
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ mb: 2 }}
        onClick={() => handleOpenDialog()}
      >
        Thêm dịch vụ
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên dịch vụ</TableCell>
              <TableCell>Giá (VNĐ)</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.price.toLocaleString("vi-VN")}</TableCell>
                <TableCell align="right">
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
                </TableCell>
              </TableRow>
            ))}
            {!loading && services.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Không có dịch vụ nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog thêm/sửa */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
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

      {/* Thông báo */}
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
