import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

// Hàm logout khi token hết hạn
const handleTokenExpired = () => {
  console.log("Token expired, logging out...");
  localStorage.removeItem("token");
  localStorage.removeItem("taiKhoan");
  window.location.href = "/login";
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Kiểm tra token hết hạn trước khi gửi request
      if (isTokenExpired(token)) {
        console.log("Token expired before request");
        handleTokenExpired();
        return Promise.reject(new Error("Token expired"));
      }

      config.headers["Authorization"] = `Bearer ${token}`;
      console.log("Token added to request");
    } else {
      console.log("No token available");
    }
    return config;
  },
  (error) => {
    console.log("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.NODE_ENV === "development") {
      console.log(" API Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Nếu 401 và có token, có thể token đã hết hạn
    if (error.response?.status === 401) {
      console.log(" Received 401, checking token...");
      const token = localStorage.getItem("token");

      if (token && isTokenExpired(token)) {
        console.log("Token is expired, handling logout...");
        handleTokenExpired();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
