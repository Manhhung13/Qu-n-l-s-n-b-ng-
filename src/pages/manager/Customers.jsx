import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ManagerLayout from "../../layouts/ManagerLayout";
import axiosClient from "../../api/axiosClient";

const rankOptions = [
  { label: "Thường", value: "standard" },
  { label: "VIP", value: "vip" },
];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [note, setNote] = useState("");
  const [rank, setRank] = useState("standard");

  // Lấy toàn bộ khách hàng từ backend
  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/customers");
      setCustomers(res.data);
    } catch {
      setError("Không lấy được danh sách khách hàng!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Mở dialog sửa thông tin khách hàng
  const handleOpenDialog = (customer) => {
    setEditingCustomer(customer);
    setNote(customer.note || "");
    setRank(customer.rank || "standard");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCustomer(null);
  };

  // Lưu thông tin khách hàng (ghi chú, xếp hạng)
  const handleSave = async () => {
    try {
      await axiosClient.put(`/customers/${editingCustomer._id}`, {
        note,
        rank,
      });
      await fetchCustomers();
      handleCloseDialog();
    } catch {
      setError("Không thể cập nhật thông tin khách hàng!");
    }
  };

  return (
    <ManagerLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Quản lý khách hàng
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Họ tên KH</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Điện thoại</TableCell>
                <TableCell>Xếp hạng</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((cus) => (
                <TableRow key={cus._id}>
                  <TableCell>{cus.name}</TableCell>
                  <TableCell>{cus.email}</TableCell>
                  <TableCell>{cus.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={cus.rank === "vip" ? "VIP" : "Thường"}
                      color={cus.rank === "vip" ? "warning" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{cus.note}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(cus)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Dialog cập nhật ghi chú hoặc xếp hạng */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Cập nhật xếp hạng / ghi chú KH</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <TextField
              label="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={2}
            />
            <TextField
              select
              label="Xếp hạng"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            >
              {rankOptions.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSave} variant="contained">
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ManagerLayout>
  );
}
