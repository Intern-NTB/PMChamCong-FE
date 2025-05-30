import { useEffect, useState } from "react"
import { getAllPhongBan } from "../../services/phongbanServices"

export const usePhongBan = () => {  // Bỏ async
    const [danhSachPhongBan, setDanhSachPhongBan] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchPhongBan = async () => {
        try {
            setLoading(true)
            const response = await getAllPhongBan()
            setDanhSachPhongBan(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            setDanhSachPhongBan([]); // Sửa tên biến
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPhongBan(); 
    }, []); 

    return {
        danhSachPhongBan,
        loading,
        fetchPhongBan
    }
}