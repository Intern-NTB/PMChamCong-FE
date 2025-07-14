import axiosInstance from "../config/axiosInstance";

export const getAllDoiTuongUuTienServices = async () => {
  try {
    const res = await axiosInstance.get("/uutien");
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Lấy Đối Tượng Ưu Tiên: ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createDoiTuongUuTienServices = async (duLieuDoiTuongUuTien) => {
  try {
    await axiosInstance.post("/uutien", duLieuDoiTuongUuTien, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Tạo Đối Tượng Ưu Tiên: ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const updateDoiTuongUuTienServices = async (duLieuDoiTuongUuTien) => {
  try {
    await axiosInstance.put(
      `/doituonguutien/${duLieuDoiTuongUuTien.maUuTien}`,
      duLieuDoiTuongUuTien,
      {
        showNotification: true, // Hiển thị success notification
      }
    );
  } catch (error) {
    console.error(`Lỗi Axios Cập Nhật Đối Tượng Ưu Tiên: ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const deleteDoiTuongUuTienServices = async (maUuTien) => {
  try {
    await axiosInstance.delete(`/uutien/${maUuTien}`, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Xóa Đối Tượng Ưu Tiên: ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};
