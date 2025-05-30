import axiosInstance from "./axiosInstance";

export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data; // chỉ trả về mảng user
};

export const addUser = async (user) => {
  const response = await axiosInstance.post('/users', user);
  return response.data; // trả về user mới được thêm
}