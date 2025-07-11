import axiosInstance from "../config/axiosInstance";

export const getAllDoiTuongUuTienServices = async () => {
  try {
    const response = await axiosInstance.get("/uutien");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const createDoiTuongUuTienServices = async (duLieuUuTien) => {
  try {
    const response = await axiosInstance.post("/uutien", duLieuUuTien);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateDoiTuongUuTienServices = async (duLieuUuTien) => {
  try {
    const response = await axiosInstance.put(
      `/uutien/${duLieuUuTien.maUuTien}`,
      duLieuUuTien
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteDoiTuongUuTienServices = async (maUuTien) => {
  try {
    const response = await axiosInstance.delete(`/uutien/${maUuTien}`);
    return response;
  } catch (error) {
    throw error;
  }
};
