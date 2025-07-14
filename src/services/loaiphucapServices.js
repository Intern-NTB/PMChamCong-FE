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
        const res = await axiosInstance.post('/phucap', duLieuLoaiPhuCap, {
            showNotification: true
        });
        return res.data
    } catch (error){
        console.log(`AXIOS lỗi khi tạo loại phụ cấp`, error);
    }
}

export const updateLoaiPhuCapServices = async (duLieuLoaiPhuCap) => {
    try{
        const res = await axiosInstance.put(`/phucap/${duLieuLoaiPhuCap.maPhuCap}`, duLieuLoaiPhuCap, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi cập nhật loại tiền thưởng`, error);
    }
}

export const deleteLoaiPhuCapServices = async (maPhuCap, maVaiTro) => {
    try{
        const res = await axiosInstance.delete(`/phucap/${maPhuCap}/${maVaiTro}`, {
            showNotification: true
        });
        return res.data;
    } catch (error) {
        console.log(`AXIOS Lỗi khi xóa loại tiền thưởng`, error);
    }
}