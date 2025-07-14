import axiosInstance from "../config/axiosInstance";

export const getAllLichSuUuTienServices = async () => {
    try {
        const res = await axiosInstance.get('/lichsuuutien')
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
};

export const createLichSuUuTienServices = async (duLieuUuTien) => {
    try {
        const res = await axiosInstance.post('/lichsuuutien', duLieuUuTien, {
            showNotification: true // Hiển thị success notification
        })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
};


export const updateLichSuUuTienServices = async (maNhanVien,maUuTien,duLieuCapNhat) => {
    try {
        const res = await axiosInstance.put(`/lichsuuutien/${maNhanVien}/${maUuTien}`,duLieuCapNhat, {
            showNotification: true // Hiển thị success notification
        })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
};


export const deleteLichSuUuTienServices = async (maNhanVien,maUuTien) => {
    try {
        const res = await axiosInstance.delete(`/lichsuuutien/${maNhanVien}/${maUuTien}`, {
            showNotification: true // Hiển thị success notification
        })
        return res.data
    } catch (error) {
        console.log(error)
        throw error
    }
};