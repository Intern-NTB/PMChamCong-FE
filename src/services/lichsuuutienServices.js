import axiosInstance from "../config/axiosInstance";

export const getAllLichSuUuTienServices = async () => {
    try {
        const res = await axiosInstance.get('/lichsuuutien')
        return res.data
    } catch (error) {
        console.log(error)
    }
};

export const createLichSuUuTienServices = async (duLieuUuTien) => {
    try {
        const res = await axiosInstance.post('/lichsuuutien', duLieuUuTien)
        return res;
    } catch (error) {
        throw error;
    }
};


export const updateLichSuUuTienServices = async (maNhanVien,maUuTien,duLieuCapNhat) => {
    try {
        const res = await axiosInstance.put(`/lichsuuutien/${maNhanVien}/${maUuTien}`,duLieuCapNhat)
        return res;
    } catch (error) {
        throw error;
    }
};


export const deleteLichSuUuTienServices = async (maNhanVien,maUuTien) => {
    try {
        const res = await axiosInstance.delete(`/lichsuuutien/${maNhanVien}/${maUuTien}`)
        return res;
    } catch (error) {
        throw error;
    }
};