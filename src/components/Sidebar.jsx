import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer"; // Icon logo (thêm vào cho đẹp)
import { Link, useLocation } from "react-router-dom";

// Giữ nguyên menu của bạn
const menu = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/home" },
  { label: "Tin tức", icon: <ArticleIcon />, path: "/new_user" },
  { label: "Thông báo", icon: <NotificationsIcon />, path: "/notifications" },
];

// 1. Thay đổi chiều rộng: 88px -> 260px để hiển thị chữ
const drawerWidth = 260;

export default function Sidebar({ menuItems = menu }) {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          bgcolor: "#ffffff", // Màu nền trắng chuẩn giao diện web
          borderRight: "1px solid #e0e0e0",
          boxSizing: "border-box",
          zIndex: 1299,
        },
      }}
    >
      {/* 2. Thêm phần Logo và Tên Brand ở đầu (Thay cho <Toolbar /> trống) */}
      <Box
        sx={{
          height: 64, // Chiều cao bằng Header
          display: "flex",
          alignItems: "center",
          px: 3,
          borderBottom: "1px solid #f0f0f0", // Đường kẻ nhẹ ngăn cách logo
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Box icon logo giả lập */}
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: "#127CFF", // Dùng màu xanh của bạn
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <SportsSoccerIcon fontSize="small" />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#111827", fontSize: "1.1rem" }}
          >
            Stadium Pro
          </Typography>
        </Stack>
      </Box>

      {/* 3. Danh sách Menu (Giữ logic cũ, đổi giao diện hiển thị) */}
      <List sx={{ px: 2, mt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            // Bỏ Tooltip vì đã hiện chữ
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                sx={{
                  borderRadius: "10px", // Bo tròn góc nút
                  py: 1.2, // Padding dọc
                  px: 2, // Padding ngang
                  // Logic màu sắc giữ nguyên tone xanh dương của bạn
                  bgcolor: isActive ? "#E8F0FE" : "transparent",
                  color: isActive ? "#127CFF" : "#4B5563", // Màu chữ khi không active là xám
                  "&:hover": {
                    bgcolor: isActive ? "#E8F0FE" : "#F3F4F6", // Hover nhẹ
                    color: isActive ? "#127CFF" : "#111827",
                  },
                  transition: "all 0.2s",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40, // Khoảng cách giữa icon và chữ
                    color: "inherit", // Icon đổi màu theo text
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {/* 4. Thêm Text hiển thị */}
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
}
