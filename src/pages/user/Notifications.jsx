import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/HighlightOff";
import UserLayout from "../../layouts/UserLayout";
import axiosClient from "../../api/axiosClient";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError("");
      try {
        // Giả sử backend trả về: [{_id, message, status, createdAt}, ...]
        const res = await axiosClient.get("/notifications");
        setNotifications(res.data);
      } catch (error) {
        setError("Không lấy được danh sách thông báo.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Xử lý xác nhận/xoá thông báo (nếu backend cho phép thao tác)
  const handleConfirm = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/confirm`);
      setNotifications((prev) =>
        prev.map((noti) =>
          noti._id === id ? { ...noti, status: "Đã xác nhận" } : noti
        )
      );
    } catch (error) {
      setError("Không thể xác nhận thông báo.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((noti) => noti._id !== id));
    } catch (error) {
      setError("Không thể xoá thông báo.");
    }
  };

  return (
    <UserLayout>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" mb={3}>
          Danh sách thông báo
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : notifications.length === 0 ? (
          <Alert severity="info">Không có thông báo nào!</Alert>
        ) : (
          <List sx={{ bgcolor: "#f5f5f5", borderRadius: 1 }}>
            {notifications.map((noti) => (
              <React.Fragment key={noti._id}>
                <ListItem>
                  <ListItemText
                    primary={noti.message}
                    secondary={
                      <>
                        <Typography component="span" variant="caption">
                          {new Date(noti.createdAt).toLocaleString("vi-VN")}
                        </Typography>
                        {" — "}
                        <Chip
                          size="small"
                          color={
                            noti.status === "Đã xác nhận"
                              ? "success"
                              : "warning"
                          }
                          label={noti.status}
                        />
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {noti.status !== "Đã xác nhận" && (
                      <IconButton
                        edge="end"
                        color="success"
                        title="Xác nhận"
                        onClick={() => handleConfirm(noti._id)}
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      edge="end"
                      color="error"
                      title="Xoá"
                      onClick={() => handleDelete(noti._id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Container>
    </UserLayout>
  );
}
