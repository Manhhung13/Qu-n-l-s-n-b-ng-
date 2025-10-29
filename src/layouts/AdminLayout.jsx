import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// Menu đặc trưng cho admin
const adminMenu = [
  {
    label: "Báo cáo",
    path: "/admin/reports",
    icon: <i className="fa-solid fa-chart-bar" />,
  },
  {
    label: "Quản lý nhân sự",
    path: "/admin/manage-staff",
    icon: <i className="fa-solid fa-user-tie" />,
  },
  {
    label: "Bảng giá",
    path: "/admin/pricing",
    icon: <i className="fa-solid fa-tags" />,
  },
  // Bổ sung các mục admin khác nếu có
];

export default function AdminLayout({
  children,
  showSidebar = true,
  sidebarMenu = adminMenu,
}) {
  return (
    <>
      <Header />
      <Box sx={{ display: "flex", bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} />}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Toolbar />
          <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
}
