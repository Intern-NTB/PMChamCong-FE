import axiosInstance from "../config/axiosInstance";

// Lấy tất cả loại tiền trừ
export const getAllLoaiTienTruServices = async () => {
  try {
    const res = await axiosInstance.get("/loaitientru");
    return res.data;
  } catch (error) {
    console.log("AXIOS Lỗi khi lấy loại tiền trừ:", error);
    return null;
  }
};

// Tạo loại tiền trừ
export const createLoaiTienTruServices = async (duLieuLoaiTienTru) => {
  try {
    const res = await axiosInstance.post("/loaitientru", duLieuLoaiTienTru);
    return res.data;
  } catch (error) {
    console.log("AXIOS Lỗi khi tạo loại tiền trừ:", error);
    throw error;
  }
};

// Cập nhật loại tiền trừ
export const updateLoaiTienTruServices = async (duLieuLoaiTienTru) => {
  try {
    console.log('req',duLieuLoaiTienTru)
    const res = await axiosInstance.put(`/loaitientru/${duLieuLoaiTienTru.maLoaiTienTru}`, duLieuLoaiTienTru);
    return res.data;
  } catch (error) {
    console.log("AXIOS Lỗi khi cập nhật loại tiền trừ:", error);
    throw error;
  }
};

// Xoá loại tiền trừ
export const deleteLoaiTienTruServices = async (maLoaiTienTru) => {
  try {
    const res = await axiosInstance.delete(`/loaitientru/${maLoaiTienTru}`);
    return res.data;
  } catch (error) {
    console.log("AXIOS Lỗi khi xoá loại tiền trừ:", error);
    throw error;
  }
};
