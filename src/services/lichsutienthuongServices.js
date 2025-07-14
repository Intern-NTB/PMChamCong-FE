import axiosInstance from "../config/axiosInstance";

// Lấy tất cả lịch sử thưởng
export const getAllLichSuThuongServices = async () => {
    try {
        const res = await axiosInstance.get("/lichsuthuong");
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi lấy lịch sử thưởng:", error);
        return null;
    }
};

// Tạo mới một bản ghi lịch sử thưởng
export const createLichSuThuongServices = async (duLieuLichSuThuong) => {
    try {
        const res = await axiosInstance.post("/lichsuthuong", duLieuLichSuThuong, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi tạo lịch sử thưởng:", error);
        throw error;
    }
};

//  Cập nhật một bản ghi lịch sử thưởng
export const updateLichSuThuongServices = async (duLieuLichSuThuong) => {
    try {
        const res = await axiosInstance.put(`/lichsuthuong/${duLieuLichSuThuong.maNhanVien}/${duLieuLichSuThuong.maLoaiTienThuong}`, duLieuLichSuThuong, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi cập nhật lịch sử thưởng:", error);
        throw error;
    }
};

//  Xoá một bản ghi lịch sử thưởng
export const deleteLichSuThuongServices = async (maNhanVien, maLoaiTienThuong) => {
    try {
        const res = await axiosInstance.delete(`/lichsuthuong/${maNhanVien}/${maLoaiTienThuong}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi xoá lịch sử thưởng:", error);
        throw error;
    }
};
