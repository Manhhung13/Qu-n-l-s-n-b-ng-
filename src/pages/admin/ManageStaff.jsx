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
  useMediaQuery,
  Grid,
  Paper,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
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

  const theme = useTheme();
  const xsDown = useMediaQuery(theme.breakpoints.down("sm"));
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const fetchStaffs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/admin/staffs");
      setStaffs(res.data);
    } catch {
      setError("Không thể tải danh sách nhân sự!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const handleOpenDialog = (staff = null) => {
    setEditingStaff(staff);
    setForm(
      staff
        ? { ...staff, password: "" }
        : { name: "", email: "", phone: "", role: "manager", password: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        await axiosClient.put(`/admin/staffs/${editingStaff.id}`, updateData);
      } else {
        await axiosClient.post("/admin/staffs", form);
      }
      await fetchStaffs();
      handleCloseDialog();
    } catch {
      setError("Không lưu được thông tin nhân viên!");
    }
  };

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
      <Container
        maxWidth="lg"
        sx={{ mt: 5, mb: 4, minHeight: "calc(100vh - 120px)" }}
      >
        <Box
          sx={{
            mx: "auto",
            bgcolor: "background.paper",
            borderRadius: 5,
            boxShadow: 4,
            py: 4,
            px: { xs: 2, md: 5 },
            maxWidth: 780,
          }}
        >
          <Typography
            variant={xsDown ? "h5" : "h4"}
            align="center"
            mb={3}
            fontWeight={700}
          >
            Quản lý nhân sự
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              size={mdDown ? "small" : "medium"}
              sx={{
                borderRadius: 3,
                fontWeight: 500,
                boxShadow: 1,
                px: 3,
                py: 1,
              }}
            >
              Thêm nhân viên
            </Button>
          </Box>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={180}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size={xsDown ? "small" : "medium"}>
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
                          sx={{
                            fontWeight: 500,
                            fontSize: 14,
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(staff)}
                          color="primary"
                          size={xsDown ? "small" : "medium"}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(staff.id)}
                          color="error"
                          size={xsDown ? "small" : "medium"}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Dialog thêm / sửa nhân viên */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
          >
            <form onSubmit={handleSubmit}>
              <DialogTitle sx={{ textAlign: "center", fontWeight: 600 }}>
                {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
              </DialogTitle>
              <DialogContent sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Họ tên"
                      fullWidth
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Email"
                      fullWidth
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Số điện thoại"
                      fullWidth
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      label="Phân quyền"
                      fullWidth
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                    >
                      {roleOptions.map((r) => (
                        <MenuItem key={r.value} value={r.value}>
                          {r.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Mật khẩu"
                      type="password"
                      fullWidth
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder={editingStaff ? "Để trống nếu không đổi" : ""}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2, justifyContent: "center" }}>
                <Button
                  onClick={handleCloseDialog}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ borderRadius: 2 }}
                >
                  Lưu
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Container>
    </AdminLayout>
  );
}
