import { useEffect, useState, useCallback } from "react";
import { message } from 'antd';
import {
    getAllCaLamServices,
    updateCaLamServices,
    deleteCaLamServices,
    createCaLamServices,
} from "../../services/calamServices";

export const useCaLam = () => {
    const [danhSachCaLam, setDanhSachCaLam] = useState([]);
    const [loadingCaLam, setLoadingCaLam] = useState(false);

    const getAllCaLam = useCallback(async () => {
        setLoadingCaLam(true);
        try {
            const res = await getAllCaLamServices();
            setDanhSachCaLam(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu Ca Lam:", error);
            message.error("Không thể tải danh sách ca làm. Vui lòng thử lại.");
            setDanhSachCaLam([]);
        } finally {
            setLoadingCaLam(false);
        }
    }, []);

    const createCaLam = async (duLieuCaLam) => {
        setLoadingCaLam(true);
        try {
            await createCaLamServices(duLieuCaLam);
            message.success("Tạo ca làm mới thành công!");
            await getAllCaLam(); 
        } catch (error) {
            console.error("Lỗi khi tạo Ca Lam:", error);
            message.error("Tạo ca làm thất bại: " + (error.response?.data?.message || error.message));
            throw error;
        } finally {
            setLoadingCaLam(false);
        }
    };

    const updateCaLam = async (maCa, duLieuCaLam) => {
        setLoadingCaLam(true);
        try {
            await updateCaLamServices(maCa, duLieuCaLam);
            message.success(`Cập nhật ca ${maCa} thành công!`);
            await getAllCaLam(); 
        } catch (error) {
            console.error("Lỗi khi cập nhật Ca Lam:", error);
            message.error(`Cập nhật ca ${maCa} thất bại: ` + (error.response?.data?.message || error.message));
            throw error;
        } finally {
            setLoadingCaLam(false);
        }
    };

    const deleteCaLam = async (maCaLam) => {
        setLoadingCaLam(true);
        try {
            await deleteCaLamServices(maCaLam);
            message.success(`Xóa ca ${maCaLam} thành công!`);
            await getAllCaLam(); 
        } catch (error) {
            console.error("Lỗi khi xóa Ca Lam:", error);
            message.error(`Xóa ca ${maCaLam} thất bại: ` + (error.response?.data?.message || error.message));
            throw error;
        } finally {
            setLoadingCaLam(false);
        }
    };

    useEffect(() => {
        getAllCaLam();
    }, [getAllCaLam]);

    return {
        danhSachCaLam,
        loadingCaLam,
        getAllCaLam,
        updateCaLam,
        deleteCaLam,
        createCaLam,
    };
};