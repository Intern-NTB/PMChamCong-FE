import axiosInstance from "../config/axiosInstance";

export const getAllLuongServices = async () => {
  try {
    const res = await axiosInstance.get("/luong");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createLuongServices = async (dataLuong) => {
  try {
    const res = await axiosInstance.post("/luong", dataLuong);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createLuongByIdServices = async (dataLuong) => {
  try {
    const res = await axiosInstance.post(
      `/luong/${dataLuong.maNhanVien}`,
      dataLuong
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};



export const getAllLuongDieuChinhServices = async () => {
  try {
    const response = await axiosInstance.get(`/luong/dieuchinh`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu", error);
    throw error;
  }
};
