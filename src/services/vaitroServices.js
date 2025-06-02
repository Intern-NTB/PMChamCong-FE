import axiosInstance from "../config/axiosInstance";

// export const getAllVaiTroByIdPhongBan = async (maPhongBan) => {
//     const response = await axiosInstance.get(`/vaitro/${maPhongBan}`);
//     return response.data;
// };


export const getAllVaiTroServices = async () => {
    const response = await axiosInstance.get(`/vaitro`);
    return response.data;
};