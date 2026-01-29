import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// Width của Sidebar (phải khớp với file Sidebar.jsx)
const drawerWidth = 260;

export default function UserLayout({
  children,
  showSidebar = true, // Mặc định hiện Sidebar
  sidebarMenu,
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f4f6f8" }}>
      <CssBaseline />

      {/* 1. Header cố định */}
      <Header />

      {/* 2. Sidebar: Chỉ render vùng chứa nếu showSidebar = true */}
      {showSidebar && (
        <Box
          component="nav"
          sx={{
            width: { sm: drawerWidth }, // Trên mobile có thể ẩn (responsive)
            flexShrink: 0,
          }}
        >
          <Sidebar menuItems={sidebarMenu} />
        </Box>
      )}

      {/* 3. Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Tự động chiếm hết khoảng trống còn lại
          p: 3, // Padding nội dung
          mt: "64px", // Đẩy xuống dưới Header

          // === ĐIỂM SỬA QUAN TRỌNG ===
          // Nếu có Sidebar: width = 100% - 260px
          // Nếu KHÔNG có Sidebar: width = 100% (tràn màn hình)
          width: {
            sm: showSidebar ? `calc(100% - ${drawerWidth}px)` : "100%",
          },

          overflowX: "hidden",
          display: "flex", // Thêm flex để kiểm soát con
          flexDirection: "column",
          alignItems: "flex-start", // QUAN TRỌNG: Căn trái toàn bộ nội dung
        }}
      >
        <Box sx={{ width: "100%" }}>{children}</Box>
      </Box>
    </Box>
  );
}
