import axiosInstance from "../config/axiosInstance";

export const getAllNgayPhepServices = async () => {
  try {
    const res = await axiosInstance.get("/ngayphep");
    return res.data;
  } catch {
    console.log("AXIOS! Lỗi lấy dữ liệu ngày phép");
  }
};

export const tinhToanNgayPhepServices = async (nam, thang) => {
  try {
    await axiosInstance.put(`/ngayphep//${nam}/${thang}`);
  } catch {
    console.log("AXIOS! Lỗi tạo dữ liệu ngày phép");
  }
};

export const tinhToanNgayPhepTatCaServices = async (nam, thang) => {
  try {
    await axiosInstance.put(`/ngayphep/all/${nam}/${thang}`);
  } catch {
    console.log("AXIOS! Lỗi xoá dữ liệu ngày phép");
  }
};

export const getTienQuyDoiNgayPhepServices = async (maNhanVien, body) => {
  try {
    const response = await axiosInstance.post(`/ngayphep/quydoi/${maNhanVien}`, body);
    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
};
