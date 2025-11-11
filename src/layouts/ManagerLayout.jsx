import React from "react";
import { Box, Container, Toolbar, Paper } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// Icon material mẫu
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
      <Box sx={{ display: "flex", bgcolor: "#f7f7fa", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} mini />}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            minHeight: "100vh",
            transition: "margin-left 0.3s",
            bgcolor: "#f7f7fa",
          }}
        >
          <Toolbar sx={{ minHeight: 64 }} />
          <Container
            maxWidth="lg"
            disableGutters
            sx={{
              pt: 5,
              pb: 4,
              minHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Paper nổi bật cho vùng content */}
            <Paper
              elevation={2}
              sx={{
                width: "100%",
                maxWidth: 960,
                minHeight: 360,
                px: 4,
                py: 4,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 10px rgba(30,60,90,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {children}
            </Paper>
          </Container>
        </Box>
      </Box>
    </>
  );
}
