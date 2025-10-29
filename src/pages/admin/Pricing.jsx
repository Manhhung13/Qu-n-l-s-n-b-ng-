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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AdminLayout from "../../layouts/AdminLayout";
import axiosClient from "../../api/axiosClient";

export default function Pricing() {
  const [pricings, setPricings] = useState([]);
  const [fieldTypes, setFieldTypes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [form, setForm] = useState({ type: "", timeSlot: "", price: "" });
  const [error, setError] = useState("");

  // Lấy cả ba loại data khi load component
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [pricingsRes, typesRes, slotsRes] = await Promise.all([
          axiosClient.get("/pricings"),
          axiosClient.get("/fieldtypes"),
          axiosClient.get("/timeslots"),
        ]);
        setPricings(pricingsRes.data);
        setFieldTypes(typesRes.data);
        setTimeSlots(slotsRes.data);
      } catch {
        setError("Không lấy được bảng giá hoặc danh mục!");
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleOpenDialog = (price = null) => {
    setEditingPrice(price);
    setForm(
      price
        ? { type: price.type, timeSlot: price.timeSlot, price: price.price }
        : { type: "", timeSlot: "", price: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPrice(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPrice) {
        await axiosClient.put(`/pricings/${editingPrice._id}`, form);
      } else {
        await axiosClient.post("/pricings", form);
      }
      // Reload sau mỗi thao tác
      const res = await axiosClient.get("/pricings");
      setPricings(res.data);
      handleCloseDialog();
    } catch {
      setError("Không thể lưu giá!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn muốn xóa mức giá này?")) return;
    try {
      await axiosClient.delete(`/pricings/${id}`);
      setPricings((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError("Không thể xóa giá!");
    }
  };

  return (
    <AdminLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Bảng giá sân theo khung giờ
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Thêm mức giá mới
        </Button>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loại sân</TableCell>
                <TableCell>Khung giờ</TableCell>
                <TableCell>Giá (VND)</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pricings.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.timeSlot}</TableCell>
                  <TableCell>{item.price.toLocaleString("vi-VN")}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(item)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item._id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialog thêm/sửa giá */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingPrice ? "Cập nhật giá" : "Thêm mức giá mới"}
            </DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                select
                label="Loại sân"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
              >
                {fieldTypes.map((t) => (
                  <MenuItem key={t._id || t} value={t.name || t}>
                    {t.name || t}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Khung giờ"
                value={form.timeSlot}
                onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                required
              >
                {timeSlots.map((ts) => (
                  <MenuItem key={ts._id || ts} value={ts.name || ts}>
                    {ts.name || ts}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                label="Giá (VND)"
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: parseInt(e.target.value) || "" })
                }
              />
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
    </AdminLayout>
  );
}
