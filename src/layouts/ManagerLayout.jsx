import React from "react";
import { Box, Container, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

// Menu sidebar dành riêng cho chức năng manager
const managerMenu = [
  {
    label: "Dashboard",
    path: "/manager/dashboard",
    icon: <i className="fa-solid fa-chart-line" />,
  },
  {
    label: "Sân bóng",
    path: "/manager/fields",
    icon: <i className="fa-solid fa-futbol" />,
  },
  {
    label: "Khách hàng",
    path: "/manager/customers",
    icon: <i className="fa-solid fa-users" />,
  },
  {
    label: "Check-in/Check-out",
    path: "/manager/checkin-checkout",
    icon: <i className="fa-solid fa-ticket-alt" />,
  },
  // Có thể mở rộng thêm mục nếu cần
];

/**
 * Layout chuẩn cho các trang manager (quản lý):
 * - Hiển thị Header trên cùng, Sidebar bên trái, nội dung động ở giữa
 * - Truyền prop children để dùng lại cho mọi page manager
 * - Dễ dàng mở rộng/thay đổi menu thích hợp từng vai trò (nếu cần)
 */
export default function ManagerLayout({
  children,
  showSidebar = true,
  sidebarMenu = managerMenu,
}) {
  return (
    <>
      <Header />
      <Box sx={{ display: "flex", bgcolor: "#f7f7fa", minHeight: "100vh" }}>
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
