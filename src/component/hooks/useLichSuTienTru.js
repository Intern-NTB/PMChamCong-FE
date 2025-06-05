
import { useEffect, useState } from "react";
import {
    getAllLichSuTruServices,
    createLichSuTruServices,
    updateLichSuTruServices,
    deleteLichSuTruServices,
} from "../../services/lichsutientruServices";

export const useLichSuTru = () => {
    const [danhSachLichSuTru, setDanhSachLichSuTru] = useState([]);
    const [loadingLichSuTru, setLoadingLichSuTru] = useState(false);
    const [isCreatedLichSuTru, setIsCreatedLichSuTru] = useState(false);
    const [isUpdatedLichSuTru, setIsUpdatedLichSuTru] = useState(false);
    const [isDeletedLichSuTru, setIsDeletedLichSuTru] = useState(false);

    const getAllLichSuTru = async () => {
        setLoadingLichSuTru(true);
        try {
            const res = await getAllLichSuTruServices();
            setDanhSachLichSuTru(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch sử trừ:", error);
            setDanhSachLichSuTru([]);
        } finally {
            setLoadingLichSuTru(false);
        }
    };

    const createLichSuTru = async (duLieuLichSuTru) => {
        setLoadingLichSuTru(true);
        try {
            await createLichSuTruServices(duLieuLichSuTru);
            setIsCreatedLichSuTru(true);
        } catch (error) {
            console.error("Lỗi khi tạo lịch sử trừ:", error);
            setIsCreatedLichSuTru(false);
        } finally {
            setLoadingLichSuTru(false);
        }
    };

    const updateLichSuTru = async (duLieuLichSuTru) => {
        setLoadingLichSuTru(true);
        try {
            await updateLichSuTruServices(duLieuLichSuTru);
            setIsUpdatedLichSuTru(true);
        } catch (error) {
            console.error("Lỗi khi cập nhật lịch sử trừ:", error);
            setIsUpdatedLichSuTru(false);
        } finally {
            setLoadingLichSuTru(false);
        }
    };

    const deleteLichSuTru = async (maNhanVien, maLoaiTienTru) => {
        setLoadingLichSuTru(true);
        try {
            await deleteLichSuTruServices(maNhanVien, maLoaiTienTru);
            setIsDeletedLichSuTru(true);
        } catch (error) {
            console.error("Lỗi khi xoá lịch sử trừ:", error);
            setIsDeletedLichSuTru(false);
        } finally {
            setLoadingLichSuTru(false);
        }
    };

    useEffect(() => {
        getAllLichSuTru();
    }, []);

    useEffect(() => {
        if (isCreatedLichSuTru || isUpdatedLichSuTru || isDeletedLichSuTru) {
            getAllLichSuTru();
            setIsCreatedLichSuTru(false);
            setIsUpdatedLichSuTru(false);
            setIsDeletedLichSuTru(false);
        }
    }, [isCreatedLichSuTru, isUpdatedLichSuTru, isDeletedLichSuTru]);

    return {
        danhSachLichSuTru,
        loadingLichSuTru,
        isCreatedLichSuTru,
        isUpdatedLichSuTru,
        isDeletedLichSuTru,
        getAllLichSuTru,
        createLichSuTru,
        updateLichSuTru,
        deleteLichSuTru,
    };
};
