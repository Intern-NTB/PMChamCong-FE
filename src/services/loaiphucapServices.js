import axiosInstance from "../config/axiosInstance";

// Lấy toàn bộ loại phụ cấp
export const getAllLoaiPhuCapServices = async () => {
    try {
        const res = await axiosInstance.get('/phucap');
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi lấy loại phụ cấp`, error);
    }
};

//Tạo loại phụ cấp mới
export const createLoaiPhuCapServices = async (duLieuLoaiPhuCap) => {
    try{
        const res = await axiosInstance.post('/phucap', duLieuLoaiPhuCap);
        return res.data
    } catch (error){
        console.log(`AXIOS lỗi khi tạo loại phụ cấp`, error);
    }
}