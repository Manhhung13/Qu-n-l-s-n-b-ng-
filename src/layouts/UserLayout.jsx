import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
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
      <Header />
      <Box sx={{ display: "flex", bgcolor: "#f6f7f9", minHeight: "100vh" }}>
        {showSidebar && <Sidebar menuItems={sidebarMenu} />}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            ml: showSidebar ? `${drawerWidth}px` : 0,
            minHeight: "100vh",
            bgcolor: "#f6f7f9",
          }}
        >
          {/* Để header không che phần nội dung */}
          <Toolbar sx={{ minHeight: 64 }} />
          <Container
            maxWidth="lg"
            disableGutters
            sx={{
              px: { xs: 2, md: 5 },
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              minHeight: "80vh",
              margin: "0 auto",
            }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </>
  );
}
