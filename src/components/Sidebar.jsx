import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Tooltip,
  Box,
  Toolbar,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { label: "Trang chủ", icon: <HomeIcon />, path: "/home" },
  { label: "Lịch sử", icon: <HistoryIcon />, path: "/history" },
  { label: "Thông báo", icon: <NotificationsIcon />, path: "/notifications" },
];
const drawerWidth = 88; // Mini variant (icon-only)

export default function Sidebar({ menuItems = menu }) {
  const location = useLocation();
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          bgcolor: "#FAFAFB",
          borderRight: "1px solid #e0e0e0",
          boxSizing: "border-box",
          zIndex: 1299,
        },
      }}
    >
      <Toolbar />
      {/* Logo hoặc avatar ở trên cùng */}
      <Box sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            mx: "auto",
            borderRadius: "12px",
            bgcolor: "#eee",
            mb: 2,
            lineHeight: "40px",
            fontWeight: 800,
            fontSize: 20,
            color: "#127CFF",
          }}
        >
          B
        </Box>
      </Box>
      <Divider />
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <Tooltip title={item.label} placement="right" arrow key={item.path}>
            <ListItem
              button
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                my: 1,
                px: 2,
                justifyContent: "center",
                borderRadius: 2,
                bgcolor:
                  location.pathname === item.path ? "#E8F0FE" : "transparent",
                color: location.pathname === item.path ? "#127CFF" : "#222",
                "&:hover": { bgcolor: "#f0f4ff" },
                transition: "all 0.2s",
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  color: "inherit",
                  justifyContent: "center",
                  fontSize: 32,
                }}
              >
                {item.icon}
              </ListItemIcon>
            </ListItem>
          </Tooltip>
        ))}
      </List>
    </Drawer>
  );
}
