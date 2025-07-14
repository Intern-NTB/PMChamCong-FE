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
  await axiosInstance.put(`/vaitro/${maVaiTro}`, { tenVaiTro }, { showNotification: true });
};

export const createVaiTroServices = async (tenVaiTro) => {
  await axiosInstance.post(`/vaitro`, { tenVaiTro }, { showNotification: true });
};

export const deleteVaiTroServices = async (maVaiTro) => {
  await axiosInstance.delete(`/vaitro/${maVaiTro}`, { showNotification: true });
};

export const getAllQuyenHanServices = async (maVaiTro) => {
  const response = await axiosInstance.get(`/vaitro/quyenhan/${maVaiTro}`);
  return response.data;
};

export const assignPermissionToRole = async (maVaiTro, maQuyenHan) => {
  await axiosInstance.post(`/vaitro/quyenhan/${maVaiTro}/${maQuyenHan}`, { showNotification: true });
};

export const removePermissionFromRole = async (maVaiTro, maQuyenHan) => {
  await axiosInstance.delete(`/vaitro/quyenhan/${maVaiTro}/${maQuyenHan}`, { showNotification: true });
};
