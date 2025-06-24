import axiosInstance from "../config/axiosInstance";

export const getCaLamTrongTuanServices = async () => {
  try {
    const res = await axiosInstance.get(`/calam/trongtuan`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
  }
};

export const getCaLamTrongTuanByPhongBanServices = async (maCaLam) => {
  try {
    const res = await axiosInstance.get(`/calam/trongtuan/${maCaLam}`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
  }
};

export const updateCaLamTrongTuanServices = async (maCa, dataMaCa) => {
  try {
    await axiosInstance.put(`/calam/trongtuan/${maCa}`, dataMaCa);
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
  }
};
