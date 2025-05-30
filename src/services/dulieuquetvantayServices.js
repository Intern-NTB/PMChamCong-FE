import axiosInstance from "../config/axiosInstance";

export const createDuLieuQuetVanTayServices = async (duLieuQuetVanTay) => {
    try {
        console.log(duLieuQuetVanTay)
        const response = await axiosInstance.post('/chamcong/vantay', duLieuQuetVanTay);
        return response.data; // Trả về dữ liệu từ API
    } catch (error) {
        console.error('Lỗi khi gửi dữ liệu quét vân tay:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};