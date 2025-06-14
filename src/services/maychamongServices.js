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
    console.log("AXIOS Lỗi khi kết nỗi đến máy chấm công: ", error);
  }
};

export const getAllNhanVienMayChamCongServices = async () => {
  try {
    const res = await axiosInstance.get("/device/employees");
    return res.data;
  } catch (error) {
    console.log(
      "AXIOS Lỗi khi lấy dữ liệu nhân viên trên máy chấm công: ",
      error
    );
  }
};

export const createNhanVienMayChamCongServices = async (
  dataNhanVienMayChamCong
) => {
  const data = {
    nhanViens: [...dataNhanVienMayChamCong],
  };
  try {
    await axiosInstance.post("/device/upload/employees", data);
  } catch (error) {
    console.log("AXIOS Lỗi khi đăng ký nhân viên trên máy chấm công: ", error);
  }
};

export const deleteNhanVienMayChamCongServices = async (maNhanVien) => {
  try {
    await axiosInstance.delete(`/device/employee/${maNhanVien}`);
  } catch (error) {
    console.log("AXIOS Lỗi xoá nhân viên trên máy chấm công: ", error);
  }
};

export const deleteFingerprintDBAndMayChamCongServices = async (
  maNhanVien,
  viTriNgonTay
) => {
  try {
    await axiosInstance.delete(
      `/device/fingerprint/${maNhanVien}/${viTriNgonTay}`
    );
  } catch (error) {
    console.log("AXIOS Lỗi xoá vân tay: ", error);
  }
};

export const syncFingerprintsToDBServices = async () => {
  try {
    await axiosInstance.get(`/device/employee/fingerprints`);
  } catch (error) {
    console.log("AXIOS Lỗi xoá vân tay: ", error);
  }
};

export const uploadFingerprintsToMayChamCongServices = async (nhanViens) => {
  try {
    const data = {
      nhanVienIds: nhanViens.map(nv => nv.maNhanVien),
    };

    console.log(data);
    await axiosInstance.post(`/device/upload/fingerprints`, data);
  } catch (error) {
    console.log("AXIOS Lỗi xoá vân tay: ", error);
  }
};
