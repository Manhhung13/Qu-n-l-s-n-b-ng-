import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Đặt Sân Online
        </Typography>
        <Button color="inherit" component={Link} to="/">
          Trang chủ
        </Button>
        <Button color="inherit" component={Link} to="/booking">
          Đặt sân
        </Button>
        <Button color="inherit" component={Link} to="/login">
          Đăng nhập
        </Button>
      </Toolbar>
    </AppBar>
  );
}
