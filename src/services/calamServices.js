import axiosInstance from "../config/axiosInstance"
export const getAllCaLamServices = async () => {
    try {
        const res = await axiosInstance.get('/calam')
        return res.data
    } catch (error) {
        console.error(`Lỗi Axios Lấy Ca Làm : ${error}`,)
    }
}

export const updateCaLamServices = async (maCa,duLieuCaLam) => {
    try {
        await axiosInstance.put(`/calam/${maCa}`, duLieuCaLam)
    } catch (error) {
        console.error(`Lỗi Axios Cập nhật Ca Làm : ${error}`)
    }
}

export const createCaLamServices = async (duLieuCaLam) => {
    try {
        await axiosInstance.post('/calam', duLieuCaLam)
    } catch (error) {
        console.error(`Lỗi Axios Xoá Ca Làm : ${error}`)
    }
}

export const deleteCaLamServices = async (maCaLam) => {
    try {
        await axiosInstance.delete(`/calam/:${maCaLam}`)
    } catch (error) {
        console.error(`Lỗi Axios Ca Làm : ${error}`)
    }
} 