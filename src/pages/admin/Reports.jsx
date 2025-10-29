import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
} from "@mui/material";
import AdminLayout from "../../layouts/AdminLayout";
import axiosClient from "../../api/axiosClient";

// Xuất excel có thể dùng thư viện như xlsx nếu cần
// import * as XLSX from "xlsx";

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Lấy dữ liệu báo cáo động từ backend
  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      // giả sử backend hỗ trợ filter theo month/year
      const res = await axiosClient.get(`/reports?month=${month}&year=${year}`);
      setSummary(res.data.summary); // { totalBookings, totalRevenue, topFields, topCustomers }
      setBookings(res.data.bookings); // chi tiết
    } catch {
      setError("Không thể tải báo cáo!");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [month, year]);

  // Xuất excel về phía client nếu muốn
  // const handleExportExcel = () => { ... }

  return (
    <AdminLayout>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Báo cáo tổng hợp đặt sân và doanh thu
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Tháng</InputLabel>
              <Select
                label="Tháng"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12).keys()].map((m) => (
                  <MenuItem key={m + 1} value={m + 1}>
                    {m + 1}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth>
              <InputLabel>Năm</InputLabel>
              <Select
                label="Năm"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {[2025, 2024, 2023].map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {/* <Grid item xs={12} sm={4}>
            <Button variant="outlined" onClick={handleExportExcel}>Xuất Excel</Button>
          </Grid> */}
        </Grid>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Box mb={2}>
              <Typography variant="h6">Tổng quan</Typography>
              <ul>
                <li>
                  Tổng lượt đặt:{" "}
                  <b>{summary?.totalBookings?.toLocaleString("vi-VN") || 0}</b>
                </li>
                <li>
                  Tổng doanh thu:{" "}
                  <b>
                    {summary?.totalRevenue?.toLocaleString("vi-VN") || 0} VND
                  </b>
                </li>
                <li>
                  Sân có nhiều lượt đặt nhất:{" "}
                  <b>
                    {summary?.topFields?.[0]?.name
                      ? `${summary.topFields[0].name} (${summary.topFields[0].count} lượt)`
                      : "Không có dữ liệu"}
                  </b>
                </li>
                <li>
                  Khách hàng VIP/thường xuyên nhất:{" "}
                  <b>
                    {summary?.topCustomers?.[0]?.name
                      ? `${summary.topCustomers[0].name} (${summary.topCustomers[0].count} lượt)`
                      : "Không có dữ liệu"}
                  </b>
                </li>
              </ul>
            </Box>
            <Typography variant="h6" mb={1}>
              Bảng chi tiết các lượt đặt
            </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Sân</TableCell>
                    <TableCell>Khách hàng</TableCell>
                    <TableCell>Giá trị</TableCell>
                    <TableCell>Trạng thái</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((row) => (
                    <TableRow key={row._id}>
                      <TableCell>
                        {new Date(row.date).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>{row.field?.name || ""}</TableCell>
                      <TableCell>{row.customerName || ""}</TableCell>
                      <TableCell>
                        {row.price ? row.price.toLocaleString("vi-VN") : ""}
                      </TableCell>
                      <TableCell>{row.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </Container>
    </AdminLayout>
  );
}
