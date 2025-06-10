import { useEffect, useState } from "react";
import {
    getAllLoaiTienThuongServices,
    createLoaiTienThuongServices,
    updateLoaiTienThuongServices,
    deleteLoaiTienThuongServices
} from "../../services/loaitienthuongServices";

export const useLoaiTienThuong = () => {
    const [danhSachLoaiTienThuong, setDanhSachLoaiTienThuong] = useState([]);
    const [loadingLoaiTienThuong, setLoadingLoaiTienThuong] = useState(false);
    const [isCreatedLoaiTienThuong, setIsCreatedLoaiTienThuong] = useState(false);
    const [isUpdatedLoaiTienThuong, setIsUpdatedLoaiTienThuong] = useState(false);
    const [isDeletedLoaiTienThuong, setIsDeletedLoaiTienThuong] = useState(false);

    const getAllLoaiTienThuong = async () => {
        setLoadingLoaiTienThuong(true);
        try {
            const res = await getAllLoaiTienThuongServices();
            setDanhSachLoaiTienThuong(res.data);
        } catch  {
            setDanhSachLoaiTienThuong([]);
        } finally {
            setLoadingLoaiTienThuong(false);
        }
    };

    const createLoaiTienThuong = async (duLieuLoaiTienThuong) => {
        setLoadingLoaiTienThuong(true);
        try {
            await createLoaiTienThuongServices(duLieuLoaiTienThuong);
            setIsCreatedLoaiTienThuong(true);
        } catch  {
            setIsCreatedLoaiTienThuong(false);
        } finally {
            setLoadingLoaiTienThuong(false);
        }
    };

    const updateLoaiTienThuong = async (duLieuLoaiTienThuong) => {
        setLoadingLoaiTienThuong(true);
        try {
            await updateLoaiTienThuongServices(duLieuLoaiTienThuong);
            setIsUpdatedLoaiTienThuong(true);
        } catch  {
            setIsUpdatedLoaiTienThuong(false);
        } finally {
            setLoadingLoaiTienThuong(false);
        }
    };

    const deleteLoaiTienThuong = async (maLoaiTienThuong) => {
        setLoadingLoaiTienThuong(true);
        try {
            await deleteLoaiTienThuongServices(maLoaiTienThuong);
            setIsDeletedLoaiTienThuong(true);
        } catch  {
            setIsDeletedLoaiTienThuong(false);
        } finally {
            setLoadingLoaiTienThuong(false);
        }
    };

    useEffect(() => {
        getAllLoaiTienThuong();

    }, []);
    useEffect(() => {
        if (isCreatedLoaiTienThuong || isUpdatedLoaiTienThuong || isDeletedLoaiTienThuong) {
            getAllLoaiTienThuong();

            // Reset lại flag để lần tiếp theo thay đổi vẫn trigger useEffect
            setIsCreatedLoaiTienThuong(false);
            setIsUpdatedLoaiTienThuong(false);
            setIsDeletedLoaiTienThuong(false);
        }
    }, [isCreatedLoaiTienThuong, isUpdatedLoaiTienThuong, isDeletedLoaiTienThuong]);

    return {
        danhSachLoaiTienThuong,
        loadingLoaiTienThuong,
        isCreatedLoaiTienThuong,
        isUpdatedLoaiTienThuong,
        isDeletedLoaiTienThuong,
        getAllLoaiTienThuong,
        createLoaiTienThuong,
        updateLoaiTienThuong,
        deleteLoaiTienThuong,
    };
};
