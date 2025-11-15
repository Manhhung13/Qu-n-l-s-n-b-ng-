import React from "react";
import { Box, Container, Toolbar, Paper } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
const adminMenu = [
  {
    label: "Báo cáo",
    path: "/admin/reports",
    icon: <BarChartIcon fontSize="large" />,
  },
  {
    label: "Quản lý nhân sự",
    path: "/admin/manage-staff",
    icon: <PeopleAltIcon fontSize="large" />,
  },
  {
    label: "Quản lý sân bóng ",
    path: "/admin/field",
    icon: <LocalOfferIcon fontSize="large" />,
  },
  {
    label: "Quản lý dịch vụ ngoài",
    path: "/admin/services",
    icon: <MiscellaneousServicesIcon fontSize="large" />,
  },
  // Có thể bổ sung mục khác cho admin ở đây
];

const drawerWidth = 88; // Sidebar dạng mini

export default function AdminLayout({
  children,
  showSidebar = true,
  sidebarMenu = adminMenu,
}) {
  return (
    <>
      <Header />
      <Box sx={{ display: "flex", bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} mini />}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            minHeight: "100vh",
            bgcolor: "#f5f7fa",
            // Đảm bảo layout luôn căn giữa cho content chính
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Toolbar sx={{ minHeight: 64 }} />
          <Container
            maxWidth="xl"
            sx={{
              pt: 5,
              pb: 4,
              minHeight: "calc(100vh - 80px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center", // căn giữa theo chiều ngang
              position: "relative",
            }}
          >
            <Paper
              elevation={3}
              sx={{
                width: "100%",
                maxWidth: 960, // to hơn, phù hợp desktop
                minHeight: 320,
                px: { xs: 2, md: 6 },
                py: { xs: 2, md: 3 },
                bgcolor: "#fff",
                borderRadius: 4,
                boxShadow: 3,
                margin: "0 auto",
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
