import { useEffect, useState } from "react";
import { getAllLichSuPhuCapServices, createLichSuPhuCapServices } from "../../services/lichsuphucapServices";

export const useLichSuPhuCap = () => {
    const [loadingLichSuPhuCap, setLoadingLichSuPhuCap] = useState(false);
    const [danhSachLichSuPhuCap, setDanhSachLichSuPhuCap] = useState([]);
    const [isCreatedLichSuPhuCap, setIsCreatedLichSuPhuCap] = useState(false);

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

    const createLichSuPhuCap = async (duLieuLichSuPhuCap) => {
        setLoadingLichSuPhuCap(true);
        try {
            await createLichSuPhuCapServices(duLieuLichSuPhuCap);
            setIsCreatedLichSuPhuCap(true);
        } catch {
            setIsCreatedLichSuPhuCap(false);
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
        getAllLichSuPhuCap,
        createLichSuPhuCap
    }
}