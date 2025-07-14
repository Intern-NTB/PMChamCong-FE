import axiosInstance from "../config/axiosInstance";

export const getAllNghiPhepServices = async () => {
  try {
    const res = await axiosInstance.get("/ngaynghi");
    return res.data;
  } catch (error) {
    console.log("AXIOS! Lỗi lấy dữ liệu nghỉ phép");
    throw error;
  }
};

export const createNghiPhepServices = async (duLieuNghiPhep) => {
  try {
    console.log("duLieuNghiPhep", duLieuNghiPhep);
    await axiosInstance.post("/ngaynghi", duLieuNghiPhep, { showNotification: true });
  } catch (error) {
    console.log("AXIOS! Lỗi lấy dữ liệu nghỉ phép");
    throw error;
  }
};

export const deleteNghiPhepServices = async (maNghiPhep) => {
  try {
    await axiosInstance.delete(`/ngaynghi/${maNghiPhep}`, { showNotification: true });
  } catch (error) {
    console.log("AXIOS! Lỗi xoá dữ liệu nghỉ phép");
    throw error;
  }
};

export const updateNghiPhepServices = async (maNghiPhep, duLieuNghiPhep) => {
  try {
    await axiosInstance.put(`/ngaynghi/${maNghiPhep}`, duLieuNghiPhep, { showNotification: true });
  } catch (error) {
    console.log("AXIOS! Lỗi cập nhật dữ liệu nghỉ phép");
    throw error;
  }
};
