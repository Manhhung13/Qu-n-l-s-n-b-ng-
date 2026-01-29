import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
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
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            minHeight: "100vh",
            bgcolor: "#f5f7fa",
          }}
        >
          {/* chừa khoảng cho header */}
          <Toolbar sx={{ minHeight: 64 }} />
          <Container
            maxWidth="xl"
            sx={{
              pt: 4,
              pb: 4,
            }}
          >
            {/* children tự quyết định dùng Paper / card như thế nào */}
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
}
