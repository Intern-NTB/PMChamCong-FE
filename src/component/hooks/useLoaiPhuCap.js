import { useEffect, useState } from "react";
import {
    getAllLoaiPhuCapServices,
    createLoaiPhuCapServices
} from "../../services/loaiphucapServices";

export const useLoaiPhuCap = () => {
    const [loadingLoaiPhuCap, setLoadingLoaiPhuCap] = useState(false);
    const [danhSachLoaiPhuCap, setDanhSachLoaiPhuCap] = useState([]);
    const [isCreatedLoaiPhuCap, setIsCreatedLoaiPhuCap] = useState(false);

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

    useEffect(() => {
        getAllLoaiPhuCap();
    }, []);

    return{
        danhSachLoaiPhuCap,
        loadingLoaiPhuCap,
        isCreatedLoaiPhuCap,
        getAllLoaiPhuCap,
        createLoaiPhuCap
    }
}