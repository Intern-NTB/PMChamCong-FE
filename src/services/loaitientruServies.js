import axiosInstance from "../config/axiosInstance";

// Lấy tất cả loại tiền trừ
export const getAllLoaiTienTruServices = async () => {
  try {
    const res = await axiosInstance.get("/loaitientru");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại tiền trừ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

// Tạo loại tiền trừ
export const createLoaiTienTruServices = async (duLieuLoaiTienTru) => {
  try {
    await axiosInstance.post("/loaitientru", duLieuLoaiTienTru, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error("Lỗi khi tạo loại tiền trừ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

// Cập nhật loại tiền trừ
export const updateLoaiTienTruServices = async (duLieuLoaiTienTru) => {
  try {
    await axiosInstance.put(
      `/loaitientru/${duLieuLoaiTienTru.maLoaiTienTru}`,
      duLieuLoaiTienTru,
      {
        showNotification: true, // Hiển thị success notification
      }
    );
  } catch (error) {
    console.error("Lỗi khi cập nhật loại tiền trừ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};

// Xoá loại tiền trừ
export const deleteLoaiTienTruServices = async (maLoaiTienTru) => {
  try {
    await axiosInstance.delete(`/loaitientru/${maLoaiTienTru}`, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error("Lỗi khi xóa loại tiền trừ:", error);
    throw error; // Throw error để axios interceptor bắt được
  }
};
