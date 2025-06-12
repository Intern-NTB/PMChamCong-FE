import axiosInstance from "../config/axiosInstance";

// export const getAllVaiTroByIdPhongBan = async (maPhongBan) => {
//     const response = await axiosInstance.get(`/vaitro/${maPhongBan}`);
//     return response.data;
// };

export const getAllVaiTroServices = async () => {
  const response = await axiosInstance.get(`/vaitro`);
  return response.data;
};

export const updateVaiTroServices = async (maVaiTro, tenVaiTro) => {
  await axiosInstance.put(`/vaitro/${maVaiTro}`, tenVaiTro);
};

export const createVaiTroServices = async (tenVaiTro) => {
  await axiosInstance.post(`/vaitro`, tenVaiTro);
};

export const deleteVaiTroServices = async (maVaiTro) => {
  await axiosInstance.delete(`/vaitro/${maVaiTro}`);
};
