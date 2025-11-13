import React from "react";
import { Box, Container, Toolbar, Paper } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BarChartIcon from "@mui/icons-material/BarChart";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

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
            transition: "margin-left 0.3s",
            bgcolor: "#f5f7fa",
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
            <Paper
              elevation={2}
              sx={{
                width: "100%",
                maxWidth: 1200,
                minHeight: 400,
                px: { xs: 2, md: 6 },
                py: 4,
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 10px rgba(30,60,90,0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                margin: "0 auto",
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
