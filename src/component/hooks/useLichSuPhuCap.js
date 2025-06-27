import { useEffect, useState } from "react";
import { getAllLichSuPhuCapServices, createLichSuPhuCapServices, deleteLichSuPhuCapServices, deleteRowLichSuPhuCapServices } from "../../services/lichsuphucapServices";

export const useLichSuPhuCap = () => {
    const [loadingLichSuPhuCap, setLoadingLichSuPhuCap] = useState(false);
    const [danhSachLichSuPhuCap, setDanhSachLichSuPhuCap] = useState([]);
    const [isCreatedLichSuPhuCap, setIsCreatedLichSuPhuCap] = useState(false);
    const [isDeletedLichSuPhuCap, setIsDeletedLichSuPhuCap] = useState(false);
    const [isDeletedRowLichSuPhuCap, setIsDeletedRowLichSuPhuCap] = useState(false);

    const getAllLichSuPhuCap = async () => {
        setLoadingLichSuPhuCap(true);
        try {
            const res = await getAllLichSuPhuCapServices();
            setDanhSachLichSuPhuCap(res.data)
        } catch {
            setDanhSachLichSuPhuCap([]);
        } finally {
            setLoadingLichSuPhuCap(false);
        }
    }

    const createLichSuPhuCap = async (maNhanVien, maPhuCap) => {
        setLoadingLichSuPhuCap(true);
        try {
            await createLichSuPhuCapServices(maNhanVien, maPhuCap);
            setIsCreatedLichSuPhuCap(true);
        } catch {
            setIsCreatedLichSuPhuCap(false);
        } finally {
            setLoadingLichSuPhuCap(false);
        }
    }

    const deleteLichSuPhuCap = async (maNhanVien, maPhuCap) => {
        setLoadingLichSuPhuCap(true);
        try {
            await deleteLichSuPhuCapServices(maNhanVien, maPhuCap);
            setIsDeletedLichSuPhuCap(true);
        } catch {
            setIsDeletedLichSuPhuCap(false);
        } finally {
            setLoadingLichSuPhuCap(false);
        }
    }

    const deleteRowLichSuPhuCap = async (maNhanVien) => {
        setLoadingLichSuPhuCap(true);
        try{
            await deleteRowLichSuPhuCapServices(maNhanVien);
            setIsDeletedRowLichSuPhuCap(true);
        } catch {
            setIsDeletedRowLichSuPhuCap(false);
        } finally {
            setLoadingLichSuPhuCap(false);
        }
    }

    useEffect(() => {
        getAllLichSuPhuCap();
    }, []);

    return{
        danhSachLichSuPhuCap,
        loadingLichSuPhuCap,
        isCreatedLichSuPhuCap,
        isDeletedLichSuPhuCap,
        isDeletedRowLichSuPhuCap,
        getAllLichSuPhuCap,
        createLichSuPhuCap,
        deleteLichSuPhuCap,
        deleteRowLichSuPhuCap
    }
}