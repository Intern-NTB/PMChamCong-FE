import axiosInstance from "../config/axiosInstance";

export const getAllQuyenHanServices = async () => {
  const response = await axiosInstance.get(`/quyenhan`);
  return response.data;
};