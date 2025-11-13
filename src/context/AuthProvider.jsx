import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);
  // Đọc user & token từ localStorage khi app mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const tokenData = localStorage.getItem("token");
    // console.log("Local user", userData);
    //console.log("Local token", tokenData);
    if (userData) {
      setUser(JSON.parse(userData));
      console.log("Parsed user", user);
    }
    if (tokenData) {
      setToken(tokenData);
    }
    setReady(true);
  }, []);
  if (!ready) return null;
  // Hàm đăng nhập: lưu user & token vào state và localStorage
  // userData là thông tin user, token là chuỗi token backend trả về
  const login = (userData, token) => {
    setUser(userData);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, setUser, setToken, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
