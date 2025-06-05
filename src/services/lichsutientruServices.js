import axiosInstance from "../config/axiosInstance";

// Lấy tất cả lịch sử trừ
export const getAllLichSuTruServices = async () => {
    try {
        const res = await axiosInstance.get("/lichsutru");
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi lấy lịch sử trừ:", error);
        return null;
    }
};

// Tạo mới một bản ghi lịch sử trừ
export const createLichSuTruServices = async (duLieuLichSuTru) => {
    try {
        const res = await axiosInstance.post("/lichsutru", duLieuLichSuTru);
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi tạo lịch sử trừ:", error);
        throw error;
    }
};

// Cập nhật một bản ghi lịch sử trừ
export const updateLichSuTruServices = async (duLieuLichSuTru) => {
    try {
        const res = await axiosInstance.put(
            `/lichsutru/${duLieuLichSuTru.maNhanVien}/${duLieuLichSuTru.maLoaiTienTru}`,
            duLieuLichSuTru
        );
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi cập nhật lịch sử trừ:", error);
        throw error;
    }
};

// Xoá một bản ghi lịch sử trừ
export const deleteLichSuTruServices = async (maNhanVien, maLoaiTienTru) => {
    try {
        const res = await axiosInstance.delete(`/lichsutru/${maNhanVien}/${maLoaiTienTru}`);
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi xoá lịch sử trừ:", error);
        throw error;
    }
};
