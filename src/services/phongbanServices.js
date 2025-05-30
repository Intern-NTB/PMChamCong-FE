import axiosInstance from "../config/axiosInstance";

/**
 * Lấy tất cả phòng ban
 * @returns {Promise<PhongBan[]>} Danh sách phòng ban
 */
export const getAllPhongBan = async () => {
    try {
        const response = await axiosInstance.get('/phongban');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng ban:', error);
        throw error;
    }
};

/**
 * Lấy phòng ban theo mã
 * @param {string} maPhongBan 
 * @returns {Promise<PhongBan>}
export const getPhongBanById = async (maPhongBan) => {
    try {
        const response = await axiosInstance.get(`/phongban/${maPhongBan}`);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi lấy phòng ban với mã ${maPhongBan}:`, error);
        throw error;
    }
};
 */

/**
 * Tạo mới phòng ban
 * @param {Object} phongBanData dữ liệu phòng ban mới
 * @returns {Promise<PhongBan>}
 */
export const createPhongBan = async (phongBanData) => {
    try {
        const response = await axiosInstance.post('/phongban', phongBanData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo mới phòng ban:', error);
        throw error;
    }
};

/**
 * Cập nhật phòng ban theo mã
 * @param {string} maPhongBan 
 * @param {Object} phongBanData dữ liệu cập nhật
 * @returns {Promise<PhongBan>}
 */
export const updatePhongBan = async (maPhongBan, phongBanData) => {
    try {
        const response = await axiosInstance.put(`/phongban/${maPhongBan}`, phongBanData);
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật phòng ban với mã ${maPhongBan}:`, error);
        throw error;
    }
};

/**
 * Xóa phòng ban theo mã
 * @param {string} maPhongBan 
 * @returns {Promise<void>}
 */
export const deletePhongBan = async (maPhongBan) => {
    try {
        await axiosInstance.delete(`/phongban/${maPhongBan}`);
    } catch (error) {
        console.error(`Lỗi khi xóa phòng ban với mã ${maPhongBan}:`, error);
        throw error;
    }
};
