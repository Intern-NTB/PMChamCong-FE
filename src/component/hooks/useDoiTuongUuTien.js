import { useEffect, useState } from "react";
import { getAllDoiTuongUuTien } from "../../services/doituonguutienServices";
export const useDoiTuongUuTien = () => {
    const [danhSachDoiTuongUuTien, setDanhSachDoiTuongUuTien] = useState([]);
    const [loadingDoiTuongUuTien, setLoadingDoiTuongUuTien] = useState(false);

    const fetchAllDoiTuongUuTien = async () => {
        setLoadingDoiTuongUuTien(true)
        try {
            const res = await getAllDoiTuongUuTien()
            setDanhSachDoiTuongUuTien(Array.isArray(res.data) ? res.data : [])

        } catch (error) {
            console.error(`Lỗi khi fetchAllDoiTuongUuTien: ${error}`)
            setDanhSachDoiTuongUuTien([])

        } finally {
            setLoadingDoiTuongUuTien(false)
        }
    }
    useEffect(() => {
        fetchAllDoiTuongUuTien();
    }, []);


    return {
        danhSachDoiTuongUuTien,
        loadingDoiTuongUuTien,
        fetchAllDoiTuongUuTien
    }
}