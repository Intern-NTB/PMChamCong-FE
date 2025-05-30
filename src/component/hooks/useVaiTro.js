import { useState } from "react"
import { getAllVaiTroByIdPhongBan} from '../../services/vaitroServices.js'

export const useVaiTro = () => {
    const [danhSachVaiTroTheoIdPhongBan, setDanhSachVaiTro] = useState([])
    const [loadingVaiTro, setLoading] = useState(false)

    const fetchAllVaiTroById = async (maPhongBan) => {
        try {
            setLoading(true)
            const response = await getAllVaiTroByIdPhongBan(maPhongBan)
            setDanhSachVaiTro(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            setDanhSachVaiTro([]); // Sửa tên biến
        } finally {
            setLoading(false)
        }
    }

    return {
        danhSachVaiTroTheoIdPhongBan,
        loadingVaiTro,
        fetchAllVaiTroById
    }
}