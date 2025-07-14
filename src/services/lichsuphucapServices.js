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
        const res = await axiosInstance.post(`/themphucap/${maNhanVien}/${maPhuCap}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi tạo lịch sử phụ cấp:", error);
        throw error;
    }
};

//  Xoá một bản ghi lịch sử phụ cấp
export const deleteLichSuPhuCapServices = async (maNhanVien, maPhuCap) => {
    try {
        const res = await axiosInstance.delete(`/themphucap/${maNhanVien}/${maPhuCap}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS Lỗi khi xoá lịch sử phụ cấp:", error);
        throw error;
    }
};

//Xóa tất cả ứng với 1 nhân viên
export const deleteRowLichSuPhuCapServices = async (maNhanVien) => {
    try{
        const res = await axiosInstance.delete(`themphucap/all/${maNhanVien}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log("AXIOS có lỗi xảy ra khi xóa hàng này");
        throw error;
    }
}