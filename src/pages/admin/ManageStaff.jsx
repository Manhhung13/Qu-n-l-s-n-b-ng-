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
  Avatar,
  Stack,
  Divider,
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

  const workingCount = staffs.length;
  const onLeaveCount = 0;
  const newRecruitCount = 0;

  return (
    <AdminLayout>
      <Container
        maxWidth={false}
        sx={{
          mt: 4,
          mb: 4,
          minHeight: "calc(100vh - 120px)",
          px: 4,
          bgcolor: "#f3f4f6",
        }}
      >
        <Box
          sx={{
            mx: "auto",
            bgcolor: "background.paper",
            borderRadius: 5,
            boxShadow: 3,
            py: 4,
            px: { xs: 2, md: 4 },
            maxWidth: 1100,
            width: "100%",
          }}
        >
          {/* Header + nút thêm */}
          <Box
            mb={3}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography variant={xsDown ? "h5" : "h4"} fontWeight={700}>
                Quản lý nhân sự
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {staffs.length} nhân viên đang hoạt động trong hệ thống
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog()}
              size={mdDown ? "small" : "medium"}
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                px: 3,
                py: 1,
                bgcolor: "#22c55e",
                "&:hover": { bgcolor: "#16a34a" },
              }}
            >
              + Thêm nhân viên
            </Button>
          </Box>

          {/* Ô tìm kiếm UI */}
          <Paper
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              fullWidth
            />
          </Paper>

          {/* Bảng nhân sự */}
          <Paper
            sx={{
              borderRadius: 3,
              boxShadow: 3,
              overflow: "hidden",
            }}
          >
            {loading ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box p={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : (
              <>
                <Box
                  px={3}
                  py={2}
                  borderBottom="1px solid #e5e7eb"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Danh sách nhân viên
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hiển thị {staffs.length} nhân viên
                  </Typography>
                </Box>
                <Box sx={{ overflowX: "auto" }}>
                  <Table size={xsDown ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Họ tên &amp; Email</TableCell>
                        <TableCell>Vai trò</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {staffs.map((staff) => (
                        <TableRow key={staff.id} hover>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              alignItems="center"
                            >
                              <Avatar sx={{ bgcolor: "#22c55e" }}>
                                {staff.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography fontWeight={600}>
                                  {staff.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ maxWidth: 200 }}
                                >
                                  {staff.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                staff.role === "admin" ? "ADMIN" : "MANAGER"
                              }
                              color={
                                staff.role === "admin" ? "warning" : "default"
                              }
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: 12,
                                borderRadius: 999,
                              }}
                            />
                          </TableCell>
                          <TableCell>{staff.phone}</TableCell>
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
                      {staffs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Chưa có nhân viên nào.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </>
            )}
          </Paper>

          {/* Thống kê nhỏ phía dưới */}
          <Grid container spacing={2} mt={3}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    bgcolor: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#16a34a",
                    fontWeight: 700,
                  }}
                >
                  ✔
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Đang làm việc
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {workingCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    bgcolor: "#fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#dc2626",
                    fontWeight: 700,
                  }}
                >
                  ☕
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Đang nghỉ phép
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {onLeaveCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    bgcolor: "#e0f2fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0284c7",
                    fontWeight: 700,
                  }}
                >
                  ✨
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tuyển dụng mới
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {newRecruitCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Dialog thêm / sửa nhân viên */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden",
              },
            }}
          >
            <form onSubmit={handleSubmit}>
              <DialogTitle
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  pb: 1,
                }}
              >
                {editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên"}
              </DialogTitle>
              <DialogContent sx={{ mt: 1, pb: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Cập nhật thông tin hồ sơ và quyền truy cập hệ thống.
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Nên dùng mật khẩu tối thiểu 8 ký tự, bao gồm chữ và số.
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{
                  px: 3,
                  pb: 2,
                  pt: 1,
                  justifyContent: "space-between",
                  bgcolor: "#f9fafb",
                }}
              >
                <Button
                  onClick={handleCloseDialog}
                  variant="text"
                  sx={{ borderRadius: 2 }}
                >
                  Hủy thay đổi
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    bgcolor: "#22c55e",
                    "&:hover": { bgcolor: "#16a34a" },
                  }}
                >
                  Lưu nhân viên
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </Container>
    </AdminLayout>
  );
}
