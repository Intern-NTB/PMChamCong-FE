import axiosInstance from "../config/axiosInstance";

export const getAllNghiPhepServices = async () => {
  try {
    const res = await axiosInstance.get("/ngaynghi");
    return res.data;
  } catch {
    console.log("AXIOS! Lỗi lấy dữ liệu nghỉ phép");
  }
};

export const createNghiPhepServices = async (duLieuNghiPhep) => {
  try {
    const res = await axiosInstance.post("/ngaynghi", duLieuNghiPhep);
    return res;
  } catch (error) {
    console.log("AXIOS! Lỗi tạo dữ liệu nghỉ phép");
    throw error;
  }
};

export const deleteNghiPhepServices = async (maNghiPhep) => {
  try {
    const res = await axiosInstance.delete(`/ngaynghi/${maNghiPhep}`);
    return res;
  } catch (error) {
    console.log("AXIOS! Lỗi xoá dữ liệu nghỉ phép");
    throw error;
  }
};

export const updateNghiPhepServices = async (maNghiPhep, duLieuNghiPhep) => {
  try {
    const res = await axiosInstance.put(`/ngaynghi/${maNghiPhep}`, duLieuNghiPhep);
    return res;
  } catch (error) {
    console.log("AXIOS! Lỗi cập nhật dữ liệu nghỉ phép");
    throw error;
  }
};
