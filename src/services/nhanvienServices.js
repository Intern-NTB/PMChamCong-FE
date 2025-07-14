import axiosInstance from "../config/axiosInstance";

/**
 * @returns {Promise<NhanVien[]>} 
 */
export const getAllNhanVienChiTietServices = async () => {
  try {
    const response = await axiosInstance.get("/nhanvien/chitiet");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên chi tiết:", error);
    throw error;
  }
};

/**
 * @param {number} maNhanVien 
 * @returns {Promise<NhanVien>}
 */
export const getNhanVienById = async (maNhanVien) => {
  try {
    const response = await axiosInstance.get(`/nhanvien/${maNhanVien}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin nhân viên với ID ${maNhanVien}:`, error);
    throw error;
  }
};

/**
 * @param {Omit<NhanVien, 'MaNhanVien'>} nhanVienData 
 * @returns {Promise<NhanVien>} 
 */
export const createNhanVienServices = async (nhanVienData) => {
  try {
    console.log("Data sending to API for create:", nhanVienData); 
    const response = await axiosInstance.post("/nhanvien", nhanVienData, { showNotification: true });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo nhân viên mới:", error);
    console.error("Error response from server:", error.response?.data); 
    throw error;
  }
};

/**
 * @param {number} maNhanVien 
 * @param {Partial<NhanVien>} updateData 
 * @returns {Promise<NhanVien>}
 */
export const updateNhanVienService = async (maNhanVien, updateData) => {
  try {
    console.log(`Data sending to API for update ${maNhanVien}:`, updateData); 
    const response = await axiosInstance.put(
      `/nhanvien/${maNhanVien}`,
      updateData,
      { showNotification: true }
    );
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật thông tin nhân viên với ID ${maNhanVien}:`, error);
    console.error("Error response from server:", error.response?.data);
    throw error;
  }
};

/**
 * @param {number} maNhanVien 
 * @returns {Promise<boolean>} 
 */
export const deleteNhanVienServices = async (maNhanVien) => {
  try {
    await axiosInstance.delete(`/nhanvien/${maNhanVien}`, { showNotification: true });
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa nhân viên với ID ${maNhanVien}:`, error);
    console.error("Error response from server:", error.response?.data);
    throw error;
  }
};

/**
 * @returns {Promise<void>}
 */
export const reloadNhanVienServices = async () => {
  try {
    await axiosInstance.get(`/nhanvien/reload`);
    console.log("Đã yêu cầu tải lại dữ liệu nhân viên.");
  } catch (error) {
    console.error("Lỗi khi yêu cầu tải lại dữ liệu nhân viên:", error);
    throw error;
  }
};

/**
 * @returns {Promise<any[]>} 
 */
export const getAllFingerprintsOfNhanVienServices = async () => {
  try {
    const res = await axiosInstance.get(`/nhanvien/vantay`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả dấu vân tay của nhân viên:", error);
    throw error;
  }
};

/**
 * @param {any} fingerprintData 
 * @returns {Promise<any>} 
 */
export const uploadFingerPrintsServices = async (fingerprintData) => {
  try {
    const res = await axiosInstance.post(`/device/upload/fingerprints`, fingerprintData);
    console.log("Đã tải dấu vân tay lên thiết bị thành công:", res.data);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi tải dấu vân tay lên thiết bị:", error);
    console.error("Error response from server:", error.response?.data);
    throw error;
  }
};

/**
 * @param {string} cccd 
 * @returns {Promise<NhanVien>} 
 */
export const getNhanVienByCCCDServices = async (cccd) => {
  try {
    const data = {
      cccd: cccd,
    };
    const response = await axiosInstance.post("/nhanvien/chitiet", data);
    console.log("Thông tin nhân viên theo CCCD:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin nhân viên chi tiết bằng CCCD ${cccd}:`, error);
    console.error("Error response from server:", error.response?.data); 
    throw error.response?.data?.message || "Đã xảy ra lỗi khi tìm kiếm nhân viên bằng CCCD.";
  }
};

/**
 * @param {number} maNhanVien 
 * @param {string} email 
 * @returns {Promise<void>}
 */
export const updateEmailNhanVienByMaNhanVienServices = async (maNhanVien, email) => {
  try {
    const data = {
      email: email,
    };
    await axiosInstance.patch(`/nhanvien/${maNhanVien}`, data, { showNotification: true });
    console.log(`Đã cập nhật email cho nhân viên ID ${maNhanVien} thành công.`);
  } catch (error) {
    console.error(`Lỗi khi cập nhật email cho nhân viên ID ${maNhanVien}:`, error);
    console.error("Error response from server:", error.response?.data);
    throw error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật email.";
  }
};