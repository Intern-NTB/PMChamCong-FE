import axiosInstance from "../config/axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data; // chỉ trả về mảng user
};

export const addUser = async (user) => {
  const response = await axiosInstance.post('/users', user);
  return response.data; // trả về user mới được thêm
}


export const loginServices = async (tenDangNhap,matKhau) =>{
  try {
      const res = await axiosInstance.post('/taikhoan/login',{tenDangNhap: tenDangNhap,matKhau: matKhau})
      return res.data
  } catch (error) {
      console.log('AXIOS Lỗi khi đăng nhập: ',error)
      throw error;
    
  }
}