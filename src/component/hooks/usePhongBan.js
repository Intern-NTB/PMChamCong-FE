import { useEffect, useState } from "react"
import { getAllPhongBanServices, updatePhongBanServices, createPhongBanServices, deletePhongBanServices } from "../../services/phongbanServices"

export const usePhongBan = () => {  // Bỏ async
    const [danhSachPhongBan, setDanhSachPhongBan] = useState([])
    const [loading, setLoading] = useState(false)
    const [statusPhongBan, setStatus] = useState(false)

    const fetchPhongBan = async () => {
        setLoading(true)

        try {
            const response = await getAllPhongBanServices()
            setDanhSachPhongBan(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            setDanhSachPhongBan([]); // Sửa tên biến
        } finally {
            setLoading(false)
        }
    }
    const updatePhongBan = async (duLieuPhongBan) => {
        setLoading(true)
        try {
            await updatePhongBanServices(duLieuPhongBan)
            // Lấy lại dữ liệu mới
            await fetchPhongBan()
            setStatus(true)
        } catch  {
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }

        const createPhongBan = async (duLieuPhongBan) => {
        setLoading(true)
        try {
            await createPhongBanServices(duLieuPhongBan)
            // Lấy lại dữ liệu mới
            await fetchPhongBan()
            setStatus(true)
        } catch  {
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }

    const deletePhongBan = async (maPhongBan) => {
        setLoading(true)
        try {
            await deletePhongBanServices(maPhongBan)
            // Lấy lại dữ liệu mới
            await fetchPhongBan()
            setStatus(true)
        } catch  {
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }



    useEffect(() => {
        fetchPhongBan();
    }, []);

    return {
        danhSachPhongBan,
        statusPhongBan,
        loading,
        fetchPhongBan,
        updatePhongBan,
        createPhongBan,
        deletePhongBan
    }
}