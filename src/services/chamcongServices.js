import axiosInstance from "../config/axiosInstance";

/**
 * Lấy tất cả dữ liệu chấm công
 * @returns {Promise<ChamCong[]>} Danh sách chấm công
 */

export const getAllChamCongServices = async () => {
    try {
        const response = await axiosInstance.get('/chamcong');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chấm công:', error);
        throw error;
    }
};

/**
 * Lấy tất cả dữ liệu chấm công
 * @returns {Promise<ChamCong[]>} Danh sách chấm công
 */
export const getAllChamCongDetailServices = async () => {
    try {
        const response = await axiosInstance.get('/chamcong/chitiet');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu chấm công:', error);
        throw error;
    }
};