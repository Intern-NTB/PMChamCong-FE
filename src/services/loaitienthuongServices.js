import axiosInstance from "../config/axiosInstance";

// Lấy toàn bộ loại tiền thưởng
export const getAllLoaiTienThuongServices = async () => {
    try {
        const res = await axiosInstance.get('/loaitienthuong');
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi lấy loại tiền thưởng`, error);
    }
};

// Tạo mới loại tiền thưởng
export const createLoaiTienThuongServices = async (duLieuLoaiTienThuong) => {
    try {
        const res = await axiosInstance.post('/loaitienthuong', duLieuLoaiTienThuong, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi tạo loại tiền thưởng`, error);
    }
};

// Cập nhật loại tiền thưởng (giả định dữ liệu có khóa chính là maLoaiTienThuong)
export const updateLoaiTienThuongServices = async (duLieuLoaiTienThuong) => {
    try {
        const res = await axiosInstance.put(`/loaitienthuong/${duLieuLoaiTienThuong.maLoaiTienThuong}`, duLieuLoaiTienThuong, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi cập nhật loại tiền thưởng`, error);
    }
};

// Xóa loại tiền thưởng
export const deleteLoaiTienThuongServices = async (maLoaiTienThuong) => {
    try {
        const res = await axiosInstance.delete(`/loaitienthuong/${maLoaiTienThuong}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi xóa loại tiền thưởng`, error);
    }
};
