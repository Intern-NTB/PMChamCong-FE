import axiosInstance from "../config/axiosInstance";

export const getAllCaLamServices = async () => {
  try {
    const res = await axiosInstance.get("/calam");
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Lấy Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const updateCaLamServices = async (maCa, duLieuCaLam) => {
  try {
    await axiosInstance.put(`/calam/${maCa}`, duLieuCaLam, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Cập nhật Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createCaLamServices = async (duLieuCaLam) => {
  try {
    await axiosInstance.post("/calam", duLieuCaLam, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Tạo Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const deleteCaLamServices = async (maCaLam) => {
  try {
    console.log("Debug CaLam: ", maCaLam);
    await axiosInstance.delete(`/calam/${Number(maCaLam)}`, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Xóa Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};
