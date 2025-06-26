import axiosInstance from "../config/axiosInstance";

// Lấy tất cả lịch sử phụ cấp
export const getAllLichSuPhuCapServices = async () => {
    try {
        const res = await axiosInstance.get("/themphucap");
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi lấy lịch sử phụ cấp:", error);
        return null;
    }
};

// Tạo mới một bản ghi lịch sử phụ cấp
export const createLichSuPhuCapServices = async (maNhanVien, maPhuCap) => {
    try {
        const res = await axiosInstance.post(`/themphucap/${maNhanVien}/${maPhuCap}`);
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi tạo lịch sử phụ cấp:", error);
        throw error;
    }
};

//  Xoá một bản ghi lịch sử phụ cấp
export const deleteLichSuPhuCapServices = async (maNhanVien, maPhuCap) => {
    try {
        const res = await axiosInstance.delete(`/themphucap/${maNhanVien}/${maPhuCap}`);
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi xoá lịch sử phụ cấp:", error);
        throw error;
    }
};