import axiosInstance from "../config/axiosInstance";

/**
 * Lấy tất cả nhân viên
 * @returns {Promise<NhanVien[]>} Danh sách nhân viên
 */
export const getAllNhanVienChiTietServices = async () => {
    try {
        const response = await axiosInstance.get('/nhanvien/chitiet');
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhân viên:', error);
        throw error;
    }
};

/**
 * Lấy nhân viên theo ID
 * @param {number} maNhanVien - Mã nhân viên
 * @returns {Promise<NhanVien>} Thông tin nhân viên
 */
export const getNhanVienById = async (maNhanVien) => {
    try {
        const response = await axiosInstance.get(`/nhanvien/${maNhanVien}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
        throw error;
    }
};

/**
 * Tạo nhân viên mới
 * @param {Omit<NhanVien, 'MaNhanVien'>} nhanVienData - Dữ liệu nhân viên
 * @returns {Promise<NhanVien>} Nhân viên vừa tạo
 */
export const createNhanVienServices = async (nhanVienData) => {
    try {
        console.log('Data sending to API:', nhanVienData); // Debug log

        // Gửi trực tiếp object, không wrap trong {nhanVienData}
        const response = await axiosInstance.post('/nhanvien', nhanVienData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi tạo nhân viên:', error);
        console.error('Error response:', error.response?.data); // Log chi tiết lỗi từ server
        throw error;
    }
};

/**
 * Cập nhật thông tin nhân viên
 * @param {number} maNhanVien - Mã nhân viên
 * @param {Partial<NhanVien>} updateData - Dữ liệu cần cập nhật
 * @returns {Promise<NhanVien>} Nhân viên sau khi cập nhật
 */
export const updateNhanVienService = async (maNhanVien, updateData) => {
    try {
        const response = await axiosInstance.put(`/nhanvien/${maNhanVien}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật nhân viên:', error);
        console.error('Lỗi khi cập nhật nhân viên:', error.response?.data);
        throw error;
    }
};

/**
 * Xóa nhân viên
 * @param {number} maNhanVien - Mã nhân viên
 * @returns {Promise<boolean>} Kết quả xóa
 */
export const deleteNhanVienServices = async (maNhanVien) => {
    try {
        await axiosInstance.delete(`/nhanvien/${maNhanVien}`);
        return true;
    } catch (error) {
        console.error('Lỗi khi xóa nhân viên:', error);
        throw error;
    }
};