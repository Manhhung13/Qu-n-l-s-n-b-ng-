import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

/**
 * Layout chuẩn cho các trang user (khách hàng) quản lý sân bóng.
 * - Hiển thị Header ở trên cùng, Sidebar (menu) bên trái, phần nội dung động ở giữa.
 * - Có thể truyền menu sidebar riêng cho từng vai trò, hoặc dùng mặc định user.
 * - Tái sử dụng cho mọi trang user: Home, Booking, Notifications, History...
 */
export default function UserLayout({
  children,
  showSidebar = true,
  sidebarMenu,
}) {
  return (
    <>
      <Header />
      <Box sx={{ display: "flex", bgcolor: "#f6f7f9", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} />}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Đảm bảo Header không che mất khách hàng */}
          <Toolbar />
          <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
}
