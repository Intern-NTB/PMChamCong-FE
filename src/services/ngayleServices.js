import axiosInstance from "../config/axiosInstance";

export const getAllNgayLeServices = async () => {
  try {
    const res = await axiosInstance.get("/ngayle");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu ngày lễ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createNgayLeServices = async (duLieuNgayLe) => {
  try {
    await axiosInstance.post("/ngayle", duLieuNgayLe, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error("Lỗi khi tạo ngày lễ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const updateNgayLeServices = async (duLieuNgayLe) => {
  try {
    await axiosInstance.put(`/ngayle/${duLieuNgayLe.maNgayLe}`, duLieuNgayLe, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật ngày lễ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const deleteNgayLeServices = async (maNgayLe) => {
  try {
    await axiosInstance.delete(`/ngayle/${maNgayLe}`, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error("Lỗi khi xóa ngày lễ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};
