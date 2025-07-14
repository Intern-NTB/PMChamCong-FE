import axiosInstance from "../config/axiosInstance";

/**
 * Lấy tất cả phòng ban
 * @returns {Promise<PhongBan[]>} Danh sách phòng ban
 */
export const getAllPhongBanServices = async () => {
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
export const createPhongBanServices = async (phongBanData) => {
    try {
        const response = await axiosInstance.post('/phongban', phongBanData, {
            showNotification: true // Hiển thị success notification
        });
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
export const updatePhongBanServices = async (phongBanData) => {
    try {
        const response = await axiosInstance.put(`/phongban/${phongBanData.maPhongBan}`, phongBanData, {
            showNotification: true // Hiển thị success notification
        });
        return response.data;
    } catch (error) {
        console.error(`Lỗi khi cập nhật phòng ban với mã ${phongBanData.maPhongBan}:`, error);
        throw error;
    }
};

/**
 * Xóa phòng ban theo mã
 * @param {string} maPhongBan 
 * @returns {Promise<void>}
 */
export const deletePhongBanServices = async (maPhongBan) => {
    try {
        await axiosInstance.delete(`/phongban/${maPhongBan}`, {
            showNotification: true // Hiển thị success notification
        });
    } catch (error) {
        console.error(`Lỗi khi xóa phòng ban với mã ${maPhongBan}:`, error);
        throw error;
    }
};

export const getAllPhongBanDieuChinhServices = async () => {
    try{
        const response = await axiosInstance.get(`/phongban/dieuchinh`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu', error);
        throw error;
    }
}
