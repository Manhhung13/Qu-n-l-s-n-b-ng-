import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import useAuth from "../context/useAuth";
export default function Header() {
  const { logout } = useAuth();
  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        bgcolor: "#fff",
        color: "#222",
        zIndex: 1301,
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ minHeight: 64, display: "flex", gap: 2 }}>
        {/* Logo hoặc chữ */}
        <Box
          sx={{
            mr: 3,
            display: "flex",
            alignItems: "center",
            fontWeight: 900,
            fontSize: 22,
            color: "#127CFF",
          }}
        >
          {/* Bạn nên thay ảnh/logo ở đây nếu có */}
          <span style={{ fontFamily: "monospace", letterSpacing: 2 }}>
            ⚽ Quản lý sân bóng
          </span>
        </Box>
        {/* Giữa: Có thể thêm search hoặc bỏ trống */}
        <Box sx={{ flexGrow: 1 }} />

        <Button
          color="primary"
          onClick={logout}
          LinkComponent={Link}
          to="/login"
        >
          Đăng xuất
        </Button>
      </Toolbar>
    </AppBar>
  );
}
