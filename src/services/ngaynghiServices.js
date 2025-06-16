import axiosInstance from "../config/axiosInstance";

export const getAllNgayLeServices = async () => {
    try{
        const res = await axiosInstance.get('/ngayle')
        return res.data
    } catch {
        console.log('Lỗi, không lấy được dữ liệu ngày lễ')
    }
}

export const createNgayLeServices = async (duLieuNgayLe) => {
    try{
        await axiosInstance.post('/ngayle', duLieuNgayLe)
    } catch  {
        console.log('Lỗi, không lấy được dữ liệu')
    }
}

export const deleteNgayLeServices = async (maNgayLe) => {
    try{
        await axiosInstance.delete(`/ngayle/${maNgayLe}`)
    } catch  {
        console.log('Lỗi, không lấy được dữ liệu')
    }
}

export const updateNgayLeServices = async (duLieuNgayLe) => {
    try {
        const { maNgayLe, ...resDuLieuNgayLe } = duLieuNgayLe
        await axiosInstance.put(`/ngayle/${maNgayLe}`, resDuLieuNgayLe)

    } catch {
        console.log('Lỗi, không tìm thấy dữ liệu')
    }
}
