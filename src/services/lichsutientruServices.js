import axiosInstance from "../config/axiosInstance";

// Lấy tất cả lịch sử trừ
export const getAllLichSuTruServices = async () => {
    try {
        const res = await axiosInstance.get("/lichsutru");
        return res.data;
    } catch (error) {
        console.error("Lỗi khi lấy lịch sử tiền trừ:", error);
        throw error;
    }
};

// Tạo mới một bản ghi lịch sử trừ
export const createLichSuTruServices = async (duLieuLichSuTru) => {
    try {
        await axiosInstance.post("/lichsutru", duLieuLichSuTru, {
            showNotification: true,
        });
    } catch (error) {
        console.error("Lỗi khi tạo lịch sử tiền trừ:", error);
        throw error;
    }
};

// Cập nhật một bản ghi lịch sử trừ
export const updateLichSuTruServices = async (duLieuLichSuTru) => {
    try {
        await axiosInstance.put(
            `/lichsutru/${duLieuLichSuTru.maNhanVien}/${duLieuLichSuTru.maLoaiTienTru}`,
            duLieuLichSuTru,
            {
                showNotification: true,
            }
        );
    } catch (error) {
        console.error("Lỗi khi cập nhật lịch sử tiền trừ:", error);
        throw error;
    }
};

// Xoá một bản ghi lịch sử trừ
export const deleteLichSuTruServices = async (maNhanVien, maLoaiTienTru) => {
    try {
        await axiosInstance.delete(
            `/lichsutru/${maNhanVien}/${maLoaiTienTru}`,
            {
                showNotification: true,
            }
        );
    } catch (error) {
        console.error("Lỗi khi xóa lịch sử tiền trừ:", error);
        throw error;
    }
};
