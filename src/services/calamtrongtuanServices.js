import axiosInstance from "../config/axiosInstance";

export const getCaLamTrongTuanServices = async () => {
  try {
    const res = await axiosInstance.get(`/calam/trongtuan`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const getCaLamTrongTuanByPhongBanServices = async (maCaLam) => {
  try {
    const res = await axiosInstance.get(`/calam/trongtuan/${maCaLam}`);
    return res.data;
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const createCaLamTrongTuanServices = async (dataCaLam) => {
  try {
    await axiosInstance.post(`/calam/trongtuan/`, dataCaLam, {
      showNotification: true, // Hiển thị success notification
    });
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};

export const updateCaLamTrongTuanServices = async (dataCaLam) => {
  try {
    console.log(
      `DEBUG SERVICES: /calam/trongtuan/${dataCaLam.maCa},${JSON.stringify(
        dataCaLam
      )}`
    );
    await axiosInstance.put(
      `/calam/trongtuan/${dataCaLam.maCa}`,
      dataCaLam,
      {
        showNotification: true, // Hiển thị success notification
      }
    );
  } catch (error) {
    console.error(`Lỗi Axios Ca Làm : ${error}`);
    throw error; // Throw error để axios interceptor bắt được
  }
};
