import axiosInstance  from "../config/axiosInstance";

export const getAllHeThongServices = async () => {
    try {
        const res = await axiosInstance.get('/hethong');
        return res.data;
    } catch (error) {
        console.log('AXIOS! Lỗi lấy dữ liệu hệ thống');
        throw error;
    }
}

export const updateHeThongServices = async (duLieuHeThong) => {
    try {
        await axiosInstance.put('/hethong', duLieuHeThong, {
            showNotification: true  // Tự động hiện notification success
        });
    } catch (error) {
        console.log('AXIOS! Lỗi cập nhật dữ liệu hệ thống');
        throw error;
    }
}