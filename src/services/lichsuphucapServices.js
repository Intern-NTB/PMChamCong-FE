import axiosInstance from "../config/axiosInstance";

// Lấy tất cả lịch sử thưởng
export const getAllLichSuPhuCapServices = async () => {
    try {
        const res = await axiosInstance.get("/themphucap");
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi lấy lịch sử thưởng:", error);
        return null;
    }
};

// Tạo mới một bản ghi lịch sử thưởng
export const createLichSuPhuCapServices = async (duLieuLichSuPhuCap) => {
    try {
        const res = await axiosInstance.post("/themphucap", duLieuLichSuPhuCap);
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi tạo lịch sử thưởng:", error);
        throw error;
    }
};