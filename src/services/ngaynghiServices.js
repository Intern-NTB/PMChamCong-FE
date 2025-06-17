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
    await axiosInstance.post("/ngaynghi", duLieuNghiPhep);
  } catch {
    console.log("AXIOS! Lỗi lấy dữ liệu nghỉ phép");
  }
};

export const deleteNghiPhepServices = async (maNghiPhep) => {
  try {
    await axiosInstance.delete(`/ngaynghi/${maNghiPhep}`);
  } catch {
    console.log("AXIOS! Lỗi xoá dữ liệu nghỉ phép");
  }
};

export const updateNghiPhepServices = async (maNghiPhep, duLieuNghiPhep) => {
  try {
    await axiosInstance.put(`/ngaynghi/${maNghiPhep}`, duLieuNghiPhep);
  } catch {
    console.log("AXIOS! Lỗi cập nhật dữ liệu nghỉ phép");
  }
};
