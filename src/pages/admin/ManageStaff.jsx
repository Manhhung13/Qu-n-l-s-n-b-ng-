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
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminLayout from "../../layouts/AdminLayout";
import axiosClient from "../../api/axiosClient";

const roleOptions = [
  { label: "Nhân viên", value: "manager" },
  { label: "Quản trị viên", value: "admin" },
];

export default function ManageStaff() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "manager",
    password: "",
  });

  // Lấy toàn bộ nhân viên/admin từ backend
  const fetchStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/admin/staffs");
      setStaffs(res.data);
    } catch {
      console.log("Error fetching staffs :", error);
      setError("Không thể tải danh sách nhân sự!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // Mở form thêm hoặc sửa nhân viên
  const handleOpenDialog = (staff = null) => {
    setEditingStaff(staff);
    setForm(
      staff
        ? { ...staff, password: "" } // khi sửa không hiện password cũ
        : { name: "", email: "", phone: "", role: "manager", password: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStaff(null);
  };

  // Thêm mới hoặc cập nhật nhân viên
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Update (không gửi password nếu bỏ trống)
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await axiosClient.put(`/admin/staffs/${editingStaff.id}`, updateData);
      } else {
        // Create
        await axiosClient.post("/admin/staffs", form);
      }
      await fetchStaffs();
      handleCloseDialog();
    } catch {
      setError("Không lưu được thông tin nhân viên!");
    }
  };

  // Xóa nhân viên
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) return;
    try {
      await axiosClient.delete(`/admin/staffs/${id}`);
      await fetchStaffs();
    } catch {
      setError("Không xóa được nhân viên!");
    }
  };

  return (
    <AdminLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Quản lý nhân sự
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenDialog()}
          sx={{ mb: 2 }}
        >
          Thêm nhân viên
        </Button>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Điện thoại</TableCell>
                <TableCell>Phân quyền</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>{staff.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={staff.role === "admin" ? "Admin" : "Nhân viên"}
                      color={staff.role === "admin" ? "warning" : "primary"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenDialog(staff)}
                      size="small"
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(staff.id)}
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

        {/* Dialog thêm / sửa nhân viên */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
            </DialogTitle>
            <DialogContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <TextField
                required
                label="Họ tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                required
                label="Email"
                // type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <TextField
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <TextField
                select
                label="Phân quyền"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {roleOptions.map((r) => (
                  <MenuItem key={r.value} value={r.value}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Mật khẩu"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={editingStaff ? "Để trống nếu không đổi" : ""}
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
