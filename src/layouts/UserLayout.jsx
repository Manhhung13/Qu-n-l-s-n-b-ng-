import React from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const drawerWidth = 88; // phải trùng với Sidebar

export default function UserLayout({
  children,
  showSidebar = true,
  sidebarMenu,
}) {
  return (
    <>
      {/* Header cố định trên cùng */}
      <Header />

      <Box
        sx={{
          display: "flex",
          bgcolor: "#f6f7f9",
          minHeight: "100vh",
        }}
      >
        {/* Sidebar bên trái với width cố định */}
        {showSidebar && (
          <Box
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              bgcolor: "#ffffff",
              borderRight: "1px solid #e0e0e0",
            }}
          >
            <Sidebar menuItems={sidebarMenu} />
          </Box>
        )}

        {/* Phần nội dung chính */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            bgcolor: "#f6f7f9",
          }}
        >
          {/* chừa khoảng cho Header */}
          <Toolbar sx={{ minHeight: 64 }} />

          {/* Khung nội dung căn giữa, cùng maxWidth với Home */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              pb: 4,
              px: { xs: 1, md: 2 }, // padding ngoài nhẹ, không quá rộng
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 1180, // cùng số với Home, Dashboard
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
