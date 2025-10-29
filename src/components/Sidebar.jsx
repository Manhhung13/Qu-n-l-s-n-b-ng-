import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Link, useLocation } from "react-router-dom";

// Menu mẫu cho user, có thể props từ ngoài để tái sử dụng cho từng vai trò
const menu = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/" },
  { label: "Đặt sân", icon: <AccountCircleIcon />, path: "/booking" },
  { label: "Lịch sử", icon: <HistoryIcon />, path: "/history" },
  { label: "Thông báo", icon: <NotificationsIcon />, path: "/notifications" },
];

const drawerWidth = 220;

export default function Sidebar({ menuItems = menu }) {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        zIndex: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: "#f5f5f5",
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            button
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon
              sx={{
                color:
                  location.pathname === item.path ? "primary.main" : "inherit",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
