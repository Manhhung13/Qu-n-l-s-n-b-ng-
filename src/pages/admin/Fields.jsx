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
} from "@mui/material";
import { Edit, Delete, Sync } from "@mui/icons-material";
import axiosClient from "../../api/axiosClient";

const typeOptions = ["5vs5", "7vs7", "11vs11"];
const statusOptions = [
  { value: "Sân hoạt động bình thường", color: "green" },
  { value: "Đã đặt", color: "blue" },
  { value: "Bảo trì", color: "orange" },
  { value: "Đang sử dụng", color: "gray" },
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

  return (
    <Container sx={{ mt: 6 }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        color="primary"
        fontWeight="bold"
      >
        Quản Lý Sân Bóng
      </Typography>
      <Box display="flex" justifyContent="center" mb={3}>
        <Button variant="contained" size="large" href="/fields/add">
          + Thêm Sân Mới
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {fields.map((field) => {
            const status = statusOptions.find((s) => s.value === field.status);
            return (
              <Grid key={field.id} item xs={12} sm={6} md={4}>
                <Card
                  sx={{ boxShadow: 4, borderRadius: 3, bgcolor: "#f9f9f9" }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {field.name}
                    </Typography>
                    <Typography variant="subtitle2">
                      Loại sân: {field.type}
                    </Typography>
                    <Typography variant="subtitle2">
                      Địa chỉ: {field.location}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                      Giá: {Number(field.price).toLocaleString("vi-VN")} VND
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: "bold",
                        color: status?.color || "black",
                      }}
                    >
                      Trạng thái: {field.status}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenStatusDialog(field)}
                    >
                      <Sync />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() =>
                        window.confirm("Chắc chắn xóa sân này?") &&
                        axiosClient
                          .delete(`/fields/${field.id}`)
                          .then(() =>
                            setFields((prev) =>
                              prev.filter((f) => f.id !== field.id)
                            )
                          )
                          .catch(() => setError("Không thể xóa sân"))
                      }
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

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
            {error && <Alert severity="error">{error}</Alert>}
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
