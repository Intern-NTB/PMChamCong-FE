import { useEffect, useState } from "react";
import {
    getAllLoaiPhuCapServices,
    createLoaiPhuCapServices,
    updateLoaiPhuCapServices,
    deleteLoaiPhuCapServices
} from "../../services/loaiphucapServices";

export const useLoaiPhuCap = () => {
    const [loadingLoaiPhuCap, setLoadingLoaiPhuCap] = useState(false);
    const [danhSachLoaiPhuCap, setDanhSachLoaiPhuCap] = useState([]);
    const [isCreatedLoaiPhuCap, setIsCreatedLoaiPhuCap] = useState(false);
    const [isUpdatedLoaiPhuCap, setIsUpdatedLoaiPhuCap] = useState(false);
    const [isDeletedLoaiPhucap, setIsDeletedLoaiPhuCap] = useState(false);
    
    const getAllLoaiPhuCap = async () => {
        setLoadingLoaiPhuCap(true);
        try {
            const res = await getAllLoaiPhuCapServices();
            setDanhSachLoaiPhuCap(res.data)
        } catch {
            setDanhSachLoaiPhuCap([]);
        } finally {
            setLoadingLoaiPhuCap(false);
        }
    }

    const createLoaiPhuCap = async (duLieuLoaiPhuCap) => {
        setLoadingLoaiPhuCap(true);
        try {
            await createLoaiPhuCapServices(duLieuLoaiPhuCap);
            setIsCreatedLoaiPhuCap(true);
        } catch {
            setIsCreatedLoaiPhuCap(false);
        } finally {
            setLoadingLoaiPhuCap(false);
        }
    }

    const updateLoaiPhuCap = async (duLieuLoaiPhuCap) => {
        setLoadingLoaiPhuCap(true);
        try {
            await updateLoaiPhuCapServices(duLieuLoaiPhuCap);
            setIsUpdatedLoaiPhuCap(true);
        } catch {
            setIsUpdatedLoaiPhuCap(false);
        } finally {
            setLoadingLoaiPhuCap(false);
        }
    };

    const deleteLoaiPhuCap = async (maPhuCap, maVaiTro) => {
        setLoadingLoaiPhuCap(true);
        try {
            await deleteLoaiPhuCapServices(maPhuCap, maVaiTro);
            setIsDeletedLoaiPhuCap(true);
        } catch {
            setIsDeletedLoaiPhuCap(false);
        } finally {
            setLoadingLoaiPhuCap(false);
        }
    };

    useEffect(() => {
        getAllLoaiPhuCap();
    }, []);

    return{
        danhSachLoaiPhuCap,
        loadingLoaiPhuCap,
        isCreatedLoaiPhuCap,
        isUpdatedLoaiPhuCap,
        isDeletedLoaiPhucap,
        getAllLoaiPhuCap,
        createLoaiPhuCap,
        updateLoaiPhuCap,
        deleteLoaiPhuCap
    }
}