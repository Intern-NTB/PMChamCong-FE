import axiosInstance from "../config/axiosInstance";

export const getAllTangCaServices = async () => {
  try {
    const res = await axiosInstance.get("/tangca");
    return res.data;
  } catch (error) {
    console.error("AXIOS Lỗi lấy danh sách tăng ca:", error);
    throw error;
  }
};

export const updateTangCaServices = async (duLieuTangCa) => {
  try {
    const res = await axiosInstance.put(
      `/tangca/${duLieuTangCa.ngayChamCong}`,
      duLieuTangCa
    );
    return res.data;
  } catch (error) {
    console.error("AXIOS Lỗi lấy danh sách tăng ca:", error);
    throw error;
  }
};

export const deleteTangCaServices = async (ngayChamCong, maPhongBan) => {
  try {
    console.log(ngayChamCong, maPhongBan);
    const res = await axiosInstance.delete(
      `/tangca/${maPhongBan}/${ngayChamCong}`
    );
    return res.data;
  } catch (error) {
    console.error("AXIOS Lỗi lấy danh sách tăng ca:", error);
    throw error;
  }
};

export const createTangCaServices = async (duLieuTangCa) => {
  try {
    const res = await axiosInstance.post("/tangca", duLieuTangCa);
    return res.data;
  } catch (error) {
    console.error("AXIOS Lỗi lấy danh sách tăng ca:", error);
    throw error;
  }
};
