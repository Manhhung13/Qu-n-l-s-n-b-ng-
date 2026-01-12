import React from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import PeopleIcon from "@mui/icons-material/People";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

const managerMenu = [
  {
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: <DashboardIcon fontSize="large" />,
  },
  {
    label: "Sân bóng",
    path: "/manager/fields",
    icon: <SportsSoccerIcon fontSize="large" />,
  },
  {
    label: "Khách hàng",
    path: "/manager/customers",
    icon: <PeopleIcon fontSize="large" />,
  },
  {
    label: "Check-in/Check-out",
    path: "/manager/checkin-checkout",
    icon: <ConfirmationNumberIcon fontSize="large" />,
  },
];

const drawerWidth = 88; // Sidebar mini

export default function ManagerLayout({
  children,
  showSidebar = true,
  sidebarMenu = managerMenu,
}) {
  return (
    <>
      <Header />

      <Box sx={{ display: "flex", bgcolor: "#f5f7fb", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} mini />}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: showSidebar ? `${drawerWidth}px` : 0,
            minHeight: "100vh",
            transition: "margin-left 0.3s",
          }}
        >
          {/* chừa chỗ cho AppBar */}
          <Toolbar sx={{ minHeight: 64 }} />

          {/* vùng content full width, chỉ chừa padding nhỏ */}
          <Box
            sx={{
              width: "100%",
              px: 3, // khoảng cách với sidebar
              py: 3,
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  );
}
