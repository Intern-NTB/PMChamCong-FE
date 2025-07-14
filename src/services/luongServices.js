import axiosInstance from "../config/axiosInstance";

export const getAllLuongServices = async () => {
  try {
    const res = await axiosInstance.get("/luong");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu lương:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createLuongServices = async (dataLuong) => {
  try {
    const res = await axiosInstance.post("/luong", dataLuong, {
      showNotification: true, // Hiển thị success notification
    });
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo lương:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createLuongByIdServices = async (dataLuong) => {
  try {
    const res = await axiosInstance.post(
      `/luong/${dataLuong.maNhanVien}`,
      dataLuong,
      {
        showNotification: true, // Hiển thị success notification
      }
    );
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tạo lương theo ID:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const getAllLuongDieuChinhServices = async () => {
  try {
    const response = await axiosInstance.get(`/luong/dieuchinh`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu điều chỉnh lương:", error);
    throw error; // Đã có throw error, giữ nguyên
  }
};
