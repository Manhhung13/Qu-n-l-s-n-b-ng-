import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000", // chỉnh theo backend bạn
  withCredentials: false,
});

// Interceptor: trước mỗi request, gắn token mới nhất từ localStorage
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosClient;
