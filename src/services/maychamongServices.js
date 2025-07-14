import axiosInstance from "../config/axiosInstance";

export const checkConnectionMayChamCongServices = async (host, port) => {
  const configMayChamCong = {
    ipAddress: host,
    port: port,
  };
  try {
    const res = await axiosInstance.post("/device/connect", configMayChamCong);
    return res.request?.status;
  } catch (error) {
    // Không notify lỗi ở đây, chỉ propagate
    throw error;
  }
};

export const getAllNhanVienMayChamCongServices = async () => {
  try {
    const res = await axiosInstance.get("/device/employees");
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createNhanVienMayChamCongServices = async (
  dataNhanVienMayChamCong
) => {
  const data = {
    nhanViens: [...dataNhanVienMayChamCong],
  };
  try {
    await axiosInstance.post("/device/upload/employees", data, { showNotification: true });
  } catch (error) {
    throw error;
  }
};

export const deleteNhanVienMayChamCongServices = async (maNhanVien) => {
  try {
    await axiosInstance.delete(`/device/employee/${maNhanVien}`, { showNotification: true });
  } catch (error) {
    throw error;
  }
};

export const deleteFingerprintDBAndMayChamCongServices = async (
  maNhanVien,
  viTriNgonTay
) => {
  try {
    await axiosInstance.delete(
      `/device/fingerprint/${maNhanVien}/${viTriNgonTay}`,
      { showNotification: true }
    );
  } catch (error) {
    throw error;
  }
};

export const syncFingerprintsToDBServices = async () => {
  try {
    await axiosInstance.get(`/device/employee/fingerprints`);
  } catch (error) {
    throw error;
  }
};

export const uploadFingerprintsToMayChamCongServices = async (nhanViens) => {
  try {
    const data = {
      nhanVienIds: nhanViens.map(nv => nv.maNhanVien),
    };
    await axiosInstance.post(`/device/upload/fingerprints`, data, { showNotification: true });
  } catch (error) {
    throw error;
  }
};
