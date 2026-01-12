import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

const statusOptions = ["Trống", "Đang sử dụng", "Bảo trì"];
const typeOptions = ["5 người", "7 người", "11 người"];

export default function Fields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({
    name: "",
    type: "",
    location: "",
    price: "",
    status: "Trống",
  });

  // Lấy tất cả sân từ backend
  const fetchFields = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/fields");
      setFields(res.data);
    } catch {
      setError("Không thể tải danh sách sân!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFields();
  }, []);

  // Mở form thêm hoặc sửa
  const handleOpenDialog = (field = null) => {
    setEditingField(field);
    setForm(
      field
        ? { ...field }
        : { name: "", type: "", location: "", price: "", status: "Trống" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingField(null);
  };

  // Lưu (thêm mới hoặc cập nhật) sân
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        // Update
        await axiosClient.put(`/fields/${editingField._id}`, form);
      } else {
        // Create
        await axiosClient.post("/fields", form);
      }
      await fetchFields();
      handleCloseDialog();
    } catch {
      setError("Không lưu được thông tin sân!");
    }
  };

  // Xóa sân
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa sân này?")) return;
    try {
      await axiosClient.delete(`/fields/${id}`);
      await fetchFields();
    } catch {
      setError("Không xóa được sân");
    }
  };

  return (
    <ManagerLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Quản lý danh sách sân
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Thêm sân mới
        </Button>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên sân</TableCell>
                <TableCell>Loại sân</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Giá (VND)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field._id}>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>{field.type}</TableCell>
                  <TableCell>{field.location}</TableCell>
                  <TableCell>
                    {field.price ? field.price.toLocaleString("vi-VN") : ""}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={
                        field.status === "Trống"
                          ? "success"
                          : field.status === "Đang sử dụng"
                            ? "warning"
                            : "error"
                      }
                      label={field.status}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(field)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(field._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialog Thêm/Sửa sân */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingField ? "Cập nhật sân" : "Thêm sân mới"}
            </DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                required
                label="Tên sân"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                select
                required
                label="Loại sân"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {typeOptions.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                label="Địa điểm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <TextField
                required
                label="Giá (VND)"
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseInt(e.target.value) || "" })
                }
              />
              <TextField
                select
                label="Trạng thái"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Hủy</Button>
              <Button type="submit" variant="contained">
                Lưu
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </ManagerLayout>
  );
}
