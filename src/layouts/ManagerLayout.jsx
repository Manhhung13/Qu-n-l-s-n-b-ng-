import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// Import Icons cho menu Manager
import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PeopleIcon from "@mui/icons-material/People";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

// Menu mặc định cho Manager
const managerMenu = [
  {
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: <DashboardIcon />,
  },
  {
    label: "Khách hàng",
    path: "/manager/customers",
    icon: <PeopleIcon />,
  },
  {
    label: "Check-in/Check-out",
    path: "/manager/checkin-checkout",
    icon: <ConfirmationNumberIcon />,
  },
];

// 1. Cập nhật width khớp với file Sidebar.jsx (260px)
const drawerWidth = 260;

export default function ManagerLayout({
  children,
  showSidebar = true,
  sidebarMenu = managerMenu,
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <CssBaseline />

      {/* 2. Header cố định */}
      <Header />

      {/* 3. Sidebar Container */}
      {showSidebar && (
        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth },
            flexShrink: 0,
          }}
        >
          {/* Bỏ prop 'mini' vì giờ ta dùng sidebar full 260px */}
          <Sidebar menuItems={sidebarMenu} />
        </Box>
      )}

      {/* 4. Main Content: Logic giống hệt UserLayout */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Tự động chiếm hết khoảng trống
          p: 3, // Padding nội dung (24px)
          mt: "64px", // Đẩy xuống dưới Header

          // Logic tính width:
          // Có sidebar -> 100% - 260px
          // Không sidebar -> 100%
          width: {
            sm: showSidebar ? `calc(100% - ${drawerWidth}px)` : "100%",
          },

          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Wrapper nội dung full width */}
        <Box sx={{ width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}
