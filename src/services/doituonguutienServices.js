import axiosInstance from "../config/axiosInstance";

export const getAllDoiTuongUuTien = async () => {
    const response = await axiosInstance.get('/uutien')
    return response.data
}