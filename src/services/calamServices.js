import axiosInstance from "../config/axiosInstance";

export const getAllCaLamServices = async () => {
    try {
        const res = await axiosInstance.get('/calam');
        return res.data;
    } catch (error) {
        console.error(`Lỗi Axios Lấy Ca Làm:`, error);
        throw error;
    }
};

export const updateCaLamServices = async (maCa, duLieuCaLam) => {
    try {
        const res = await axiosInstance.put(`/calam/${maCa}`, duLieuCaLam);
        return res.data;
    } catch (error) {
        console.error(`Lỗi Axios Cập nhật Ca Làm:`, error);
        throw error;
    }
};

export const createCaLamServices = async (duLieuCaLam) => {
    try {
        const res = await axiosInstance.post('/calam', duLieuCaLam);
        return res.data;
    } catch (error) {
        console.error(`Lỗi Axios Tạo Ca Làm:`, error);
        throw error;
    }
};

export const deleteCaLamServices = async (maCaLam) => {
    try {
        const res = await axiosInstance.delete(`/calam/${maCaLam}`);
        return res.data;
    } catch (error) {
        console.error(`Lỗi Axios Xóa Ca Làm:`, error);
        throw error;
    }
};

export const getCaLamDetailsByMaCaService = async (maCa) => {
    try {
        const res = await axiosInstance.get(`/calam/${maCa}/details`);

        let details = res.data;
        if (!details || !Array.isArray(details) || details.length === 0) {
            details = Array.from({ length: 7 }, (_, i) => ({
                NgayTrongTuan: i + 1, 
                CoLamViec: 0, 
                GioBatDau: null,
                GioKetThuc: null,
                GioNghiTruaBatDau: null,
                GioNghiTruaKetThuc: null,
                SoGioLamViec: null,
            }));
        } else {
            const existingDays = new Set(details.map(d => d.NgayTrongTuan));
            for (let i = 1; i <= 7; i++) {
                if (!existingDays.has(i)) {
                    details.push({
                        NgayTrongTuan: i,
                        CoLamViec: 0,
                        GioBatDau: null,
                        GioKetThuc: null,
                        GioNghiTruaBatDau: null,
                        GioNghiTruaKetThuc: null,
                        SoGioLamViec: null,
                    });
                }
            }
            details.sort((a, b) => a.NgayTrongTuan - b.NgayTrongTuan);
        }
        return details;
    } catch (error) {
        console.error(`Lỗi Axios khi lấy chi tiết ca ${maCa}:`, error);
        return Array.from({ length: 7 }, (_, i) => ({
            NgayTrongTuan: i + 1,
            CoLamViec: 0,
            GioBatDau: null,
            GioKetThuc: null,
            GioNghiTruaBatDau: null,
            GioNghiTruaKetThuc: null,
            SoGioLamViec: null,
        }));
    }
};

export const updateCaLamDetailsServices = async (maCa, duLieuChiTietCaLam) => {
    try {
        const res = await axiosInstance.put(`/calam/${maCa}/details`, duLieuChiTietCaLam);
        return res.data;
    } catch (error) {
        console.error(`Lỗi Axios khi cập nhật chi tiết ca ${maCa}:`, error);
        throw error;
    }
};