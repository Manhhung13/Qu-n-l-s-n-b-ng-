import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  DialogActions,
  Alert,
  CircularProgress,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import { Delete, Sync, Add } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";

const typeOptions = ["5vs5", "7vs7", "11vs11"];
const statusOptions = [
  { value: "Sân hoạt động bình thường", color: "#22c55e", label: "HOẠT ĐỘNG" },
  { value: "Đã đặt", color: "#3b82f6", label: "ĐÃ ĐẶT" },
  { value: "Bảo trì", color: "#f97316", label: "BẢO TRÌ" },
  { value: "Đang sử dụng", color: "#6b7280", label: "ĐANG SỬ DỤNG" },
];

export default function FieldManager() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("/admin/fields");
        setFields(res.data);
      } catch {
        setError("Không thể tải dữ liệu sân");
      }
      setLoading(false);
    })();
  }, []);

  const handleOpenStatusDialog = (field) => {
    setSelectedField(field);
    setNewStatus(field.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedField(null);
    setError("");
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedField) return;
    try {
      await axiosClient.put(`/admin/fields/${selectedField.id}/status`, {
        status: newStatus,
        name: selectedField.name,
        type: selectedField.type,
        location: selectedField.location,
        price: selectedField.price,
      });
      setFields((prev) =>
        prev.map((f) =>
          f.id === selectedField.id ? { ...f, status: newStatus } : f
        )
      );
      handleCloseStatusDialog();
    } catch {
      setError("Cập nhật trạng thái thất bại");
    }
  };

  const totalFields = fields.length;
  const activeFields = fields.filter(
    (f) => f.status === "Sân hoạt động bình thường"
  ).length;
  const maintenanceFields = fields.filter((f) => f.status === "Bảo trì").length;
  const bookedFields = fields.filter((f) => f.status === "Đã đặt").length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header + ô search đơn giản */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Field Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tình trạng và thông tin các sân bóng.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<Add />}
          href="/admin/addfield"
          sx={{ borderRadius: 999, px: 3 }}
        >
          Thêm sân mới
        </Button>
      </Box>

      {/* Cards thống kê trên cùng */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 0,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                TỔNG SỐ SÂN
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {totalFields}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 0,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                ĐANG HOẠT ĐỘNG
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {activeFields}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 0,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                BẢO TRÌ
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {maintenanceFields}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: 0,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                ĐÃ ĐẶT
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1}>
                {bookedFields}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {fields.map((field) => {
            const statusMeta = statusOptions.find(
              (s) => s.value === field.status
            );
            return (
              <Grid key={field.id} item xs={12} sm={6} md={4} lg={3}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: 0,
                    border: "1px solid #e5e7eb",
                    bgcolor: "#f9fafb",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ pb: 1 }}>
                    {/* Header sân + status chip */}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={1}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ maxWidth: "70%" }}
                        noWrap
                      >
                        {field.name}
                      </Typography>
                      {statusMeta && (
                        <Chip
                          label={statusMeta.label}
                          size="small"
                          sx={{
                            bgcolor: `${statusMeta.color}1a`,
                            color: statusMeta.color,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Loại:{" "}
                      {typeOptions.includes(field.type)
                        ? field.type
                        : field.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Khu vực: {field.location}
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight={700}
                      mt={1}
                      color="success.main"
                    >
                      {Number(field.price).toLocaleString("vi-VN")} VND
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{
                      mt: "auto",
                      pt: 0,
                      pb: 1,
                      px: 1.5,
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      size="small"
                      onClick={() => handleOpenStatusDialog(field)}
                      startIcon={<Sync fontSize="small" />}
                    >
                      Cập nhật trạng thái
                    </Button>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() =>
                        window.confirm("Chắc chắn xóa sân này?") &&
                        axiosClient
                          .delete(`/admin/fields/${field.id}`)
                          .then(() =>
                            setFields((prev) =>
                              prev.filter((f) => f.id !== field.id)
                            )
                          )
                          .catch(() => setError("Không thể xóa sân"))
                      }
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}

          {/* Card thêm sân mới */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 0,
                border: "2px dashed #d1d5db",
                bgcolor: "#f9fafb",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#22c55e",
                  bgcolor: "#ecfdf3",
                },
              }}
              onClick={() => (window.location.href = "/admin/addfield")}
            >
              <Box textAlign="center">
                <IconButton color="success">
                  <Add />
                </IconButton>
                <Typography fontWeight={600}>Thêm sân mới</Typography>
                <Typography variant="body2" color="text.secondary">
                  Tạo mới một sân bóng
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Dialog cập nhật trạng thái */}
      <Dialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật trạng thái sân</DialogTitle>
        <form onSubmit={handleUpdateStatus}>
          <DialogContent>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                label="Trạng thái"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog}>Hủy</Button>
            <Button variant="contained" type="submit">
              Lưu trạng thái
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
