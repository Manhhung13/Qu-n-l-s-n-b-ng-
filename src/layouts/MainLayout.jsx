// src/layouts/MainLayout.jsx
import React from "react";
import { Box, Toolbar } from "@mui/material";
import Header from "../components/Header";
import Sidebar, { drawerWidth } from "../components/Sidebar";

export default function MainLayout({ children }) {
    return (
        <>
            <Header />
            <Box
                sx={{
                    display: "flex",
                    minHeight: "100vh",
                    bgcolor: "#f7f7fa",
                }}
            >
                {/* Sidebar cố định bên trái (Drawer width = drawerWidth) */}
                <Sidebar />

                {/* Khối nội dung, chiếm toàn bộ phần còn lại */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        // KHÔNG cần ml nữa vì Drawer đã là phần tử flex riêng
                        // ml: `${drawerWidth}px`,
                        bgcolor: "#f7f7fa",
                    }}
                >
                    {/* chừa khoảng trống cho AppBar fixed */}
                    <Toolbar sx={{ minHeight: 64 }} />

                    <Box
                        sx={{
                            flex: 1,
                            width: "100%",
                            px: 3,
                            py: 3,
                            overflow: "auto",
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </>
    );
}
