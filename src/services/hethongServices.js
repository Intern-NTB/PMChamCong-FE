import axiosInstance  from "../config/axiosInstance";

export const getAllHeThongServices = async () => {
    try {
        const res = await axiosInstance.get('/hethong');
        return res.data;
    } catch {
        console.log('AXIOS! Lỗi lấy dữ liệu hệ thống');
    }
}

export const updateHeThongServices = async (duLieuHeThong) => {
    try {
        const res = await axiosInstance.put('/hethong', duLieuHeThong);
        return res;
    } catch (error) {
        console.log('AXIOS! Lỗi cập nhật dữ liệu hệ thống');
        throw error;
    }
}