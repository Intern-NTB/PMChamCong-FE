import axios from "axios";
import { getNotificationApi } from "../config/utils/notification_instance";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

// Hàm hiển thị notification theo status code
const showNotificationByStatus = (status, message, description) => {
  const notificationApi = getNotificationApi();

  if (!notificationApi) {
    console.warn('Notification API chưa được khởi tạo');
    return;
  }

  try {
    const config = {
      placement: 'topRight',
      duration: 4,
    };

    if (status >= 200 && status < 300) {
      // Success - sử dụng message từ BE hoặc mặc định
      notificationApi.success({
        ...config,
        message: 'Thành công',
        description: 'Thao tác đã được thực hiện thành công',
      });
    } else if (status === 400) {
      notificationApi.error({
        ...config,
        message: 'Dữ liệu không hợp lệ',
        description: 'Vui lòng kiểm tra lại thông tin đã nhập',
      });
    } else if (status === 401) {
      notificationApi.error({
        ...config,
        message: 'Bạn không có quyền thực hiện',
        description: 'Vui lòng đăng nhập lại hoặc liên hệ quản trị viên',
      });
    } else if (status === 403) {
      notificationApi.warning({
        ...config,
        message: 'Truy cập bị từ chối',
        description: 'Bạn không có quyền truy cập chức năng này',
      });
    } else if (status === 404) {
      notificationApi.warning({
        ...config,
        message: 'Không tìm thấy dữ liệu',
        description: 'Dữ liệu không tồn tại hoặc đã bị xóa',
      });
    } else if (status === 422) {
      notificationApi.error({
        ...config,
        message: 'Dữ liệu không đúng định dạng',
        description: 'Vui lòng kiểm tra lại các trường thông tin',
      });
    } else if (status >= 500) {
      notificationApi.error({
        ...config,
        message: 'Lỗi hệ thống',
        description: 'Có lỗi xảy ra từ phía máy chủ, vui lòng thử lại sau',
      });
    } else {
      notificationApi.info({
        ...config,
        message: 'Thông báo',
        description: description || 'Có thông báo mới',
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

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

    // Chỉ hiện notification nếu KHÔNG phải GET và được yêu cầu
    if (
      response.config.showNotification &&
      response.config.method &&
      response.config.method.toLowerCase() !== 'get'
    ) {
      const message = response.data?.message || 'Thành công';
      showNotificationByStatus(response.status, message);
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
        return Promise.reject(error);
      }
    }

    // Chỉ hiện notification cho lỗi nếu KHÔNG phải GET và không bị tắt
    if (
      error.response &&
      !error.config?.hideNotification &&
      error.config?.method &&
      error.config.method.toLowerCase() !== 'get'
    ) {
      const message = error.response.data?.message || error.response.data?.error;
      const description = error.response.data?.description || error.response.data?.details;
      showNotificationByStatus(error.response.status, message, description);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
