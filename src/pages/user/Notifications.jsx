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
  Paper,
  Box,
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
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Typography
          variant="h4"
          align="center"
          mb={3}
          sx={{ fontWeight: 700, color: "#1976d2", letterSpacing: 1 }}
        >
          Danh sách thông báo
        </Typography>
        <Box display="flex" justifyContent="center">
          <Paper
            elevation={4}
            sx={{
              p: { xs: 1, sm: 2 },
              maxWidth: 480,
              width: "100%",
              borderRadius: 4,
              bgcolor: "#fff",
            }}
          >
            {loading ? (
              <Box p={3} textAlign="center">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : notifications.length === 0 ? (
              <Alert severity="info">Không có thông báo nào!</Alert>
            ) : (
              <List>
                {notifications.map((noti, idx) => (
                  <React.Fragment key={noti._id}>
                    <ListItem
                      sx={{
                        borderRadius: 3,
                        bgcolor: idx % 2 === 0 ? "#f9fafb" : "#f3f7fd",
                        mb: 1.5,
                        boxShadow: 1,
                        px: { xs: 1, sm: 2 },
                        py: 1.5,
                        alignItems: "flex-start",
                        transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: 3 },
                      }}
                      secondaryAction={
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {noti.status !== "Đã xác nhận" && (
                            <IconButton
                              edge="end"
                              color="success"
                              title="Xác nhận"
                              sx={{
                                "&:hover": { bgcolor: "#e3fcec" },
                              }}
                              onClick={() => handleConfirm(noti._id)}
                            >
                              <CheckIcon sx={{ fontSize: 26 }} />
                            </IconButton>
                          )}
                          <IconButton
                            edge="end"
                            color="error"
                            title="Xoá"
                            sx={{
                              "&:hover": { bgcolor: "#fdecea" },
                            }}
                            onClick={() => handleDelete(noti._id)}
                          >
                            <CloseIcon sx={{ fontSize: 26 }} />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography
                            fontSize={17}
                            fontWeight={500}
                            sx={{ mb: 1 }}
                          >
                            {noti.content}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ flexShrink: 0, fontWeight: 500 }}
                            >
                              {new Date(noti.created_at).toLocaleString(
                                "vi-VN"
                              )}
                            </Typography>
                            <Chip
                              size="small"
                              color={
                                noti.status === "Đã xác nhận"
                                  ? "success"
                                  : "warning"
                              }
                              label={noti.status}
                              sx={{
                                minWidth: 110,
                                borderRadius: 2,
                                fontSize: 13,
                                ml: 1,
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
    </UserLayout>
  );
}
