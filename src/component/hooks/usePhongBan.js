import { useEffect, useState, useCallback } from "react" 
import { getAllPhongBanServices, updatePhongBanServices, createPhongBanServices, deletePhongBanServices } from "../../services/phongbanServices"

export const usePhongBan = () => {
    const [danhSachPhongBan, setDanhSachPhongBan] = useState([])
    const [loading, setLoading] = useState(false)
    const [statusPhongBan, setStatus] = useState(false)

    const fetchPhongBan = useCallback(async () => {
        setLoading(true)
        try {
            const response = await getAllPhongBanServices()
            setDanhSachPhongBan(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            setDanhSachPhongBan([]);
        } finally {
            setLoading(false)
        }
    }, []); 

    const updatePhongBan = useCallback(async (duLieuPhongBan) => {
        setLoading(true)
        try {
            await updatePhongBanServices(duLieuPhongBan)
            await fetchPhongBan()
            setStatus(true)
        } catch (error) { 
            console.error('Lỗi khi cập nhật phòng ban:', error);
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }, [fetchPhongBan]); 

    const createPhongBan = useCallback(async (duLieuPhongBan) => {
        setLoading(true)
        try {
            await createPhongBanServices(duLieuPhongBan)
            await fetchPhongBan()
            setStatus(true)
        } catch (error) { 
            console.error('Lỗi khi tạo phòng ban:', error);
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }, [fetchPhongBan]); 

    const deletePhongBan = useCallback(async (maPhongBan) => {
        setLoading(true)
        try {
            await deletePhongBanServices(maPhongBan)
            await fetchPhongBan()
            setStatus(true)
        } catch (error) { 
            console.error('Lỗi khi xóa phòng ban:', error);
            setStatus(false)
        } finally {
            setLoading(false)
        }
    }, [fetchPhongBan]); 

    useEffect(() => {
        fetchPhongBan();
    }, [fetchPhongBan]);

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