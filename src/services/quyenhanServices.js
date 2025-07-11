import axiosInstance from "../config/axiosInstance";

export const getAllQuyenHanServices = async () => {
  try {
    const response = await axiosInstance.get(`/quyenhan`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu quyền hạn:", error);
    throw error;
  }
};