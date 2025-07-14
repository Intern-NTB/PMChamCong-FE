import axiosInstance from "../config/axiosInstance";

export const getAllTaiKhoanServices = async () => {
  const response = await axiosInstance.get('/taikhoan');
  return response.data;
};

export const createTaiKhoanServices = async (newUser) => {
  try {
    const response = await axiosInstance.post('/taikhoan', newUser, {
      showNotification: true
    });
    return response.data;
  } catch (error) {
    return error;
  }
}

export const deleteTaiKhoanServices = async (maNhanVien) => {
  try {
    await axiosInstance.delete(`/taikhoan/${maNhanVien}`, {
      showNotification: true
    })
  } catch (error) {
    console.error(`Lỗi Axios Tài Khoản : ${error}`)
  }
}

export const updateTaiKhoanServices = async (dulieuTaiKhoan) => {
    try {
        const { maNhanVien, ...resDuLieuTaiKhoan } = dulieuTaiKhoan
        await axiosInstance.put(`/taikhoan/${maNhanVien}`, resDuLieuTaiKhoan, {
            showNotification: true
        })
    } catch (error) {
        console.log(`Lỗi, không tìm thấy dữ liệu: ${error}`)
    }
}

export const loginServices = async (tenDangNhap, matKhau) => {
  try {
    const res = await axiosInstance.post('/taikhoan/login', { tenDangNhap: tenDangNhap, matKhau: matKhau })
    return res.data
  } catch (error) {
    console.log('AXIOS Lỗi khi đăng nhập: ', error)
    throw error;

  }
}