import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import axiosClient from "../../api/axiosClient";

const typeOptions = ["5vs5", "7vs7", "11vs11"];
const statusOptions = [
  "Sân hoạt động bình thường",
  "Đã đặt",
  "Bảo trì",
  "Đang sử dụng",
];

export default function AddField() {
  const [field, setField] = useState({
    name: "",
    type: "",
    location: "",
    image_url: "",
    price: "",
    status: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setField({ ...field, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axiosClient.post("/admin/fields", field);
      setSuccess("Thêm sân mới thành công!");
      setField({
        name: "",
        type: "",
        location: "",
        image_url: "",
        price: "",
        status: "",
        description: "",
      });
    } catch {
      setError("Thêm sân thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <Container sx={{ mt: 6, maxWidth: 600 }}>
      <Typography
        variant="h4"
        align="center"
        color="primary"
        fontWeight="bold"
        gutterBottom
      >
        Thêm Sân Mới
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="Tên sân"
          name="name"
          value={field.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <FormControl fullWidth required margin="normal">
          <InputLabel>Loại sân</InputLabel>
          <Select
            name="type"
            value={field.type}
            label="Loại sân"
            onChange={handleChange}
          >
            {typeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Địa chỉ"
          name="location"
          value={field.location}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          label="URL ảnh"
          name="image_url"
          value={field.image_url}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Giá sân (VND)"
          name="price"
          value={field.price}
          onChange={handleChange}
          type="number"
          fullWidth
          required
          margin="normal"
        />
        <FormControl fullWidth required margin="normal">
          <InputLabel>Trạng thái</InputLabel>
          <Select
            name="status"
            value={field.status}
            label="Trạng thái"
            onChange={handleChange}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Mô tả"
          name="description"
          value={field.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ my: 2 }}>
            {success}
          </Alert>
        )}
        <Box textAlign="center" mt={3}>
          <Button type="submit" variant="contained" size="large">
            Lưu sân mới
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
