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
  return await axiosInstance.put(`/vaitro/${maVaiTro}`, { tenVaiTro });
};

export const createVaiTroServices = async (tenVaiTro) => {
  return await axiosInstance.post(`/vaitro`, { tenVaiTro });
};

export const deleteVaiTroServices = async (maVaiTro) => {
  return await axiosInstance.delete(`/vaitro/${maVaiTro}`);
};

export const getAllQuyenHanServices = async (maVaiTro) => {
  const response = await axiosInstance.get(`/vaitro/quyenhan/${maVaiTro}`);
  return response.data;
};

export const assignPermissionToRole = async (maVaiTro, maQuyenHan) => {
  return await axiosInstance.post(`/vaitro/quyenhan/${maVaiTro}/${maQuyenHan}`);
};

export const removePermissionFromRole = async (maVaiTro, maQuyenHan) => {
  return await axiosInstance.delete(`/vaitro/quyenhan/${maVaiTro}/${maQuyenHan}`);
};
