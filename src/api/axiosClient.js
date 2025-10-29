import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Interceptor: tự động thêm token vào header nếu có
axiosClient.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user")); // hoặc lấy từ context/state
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default axiosClient;
