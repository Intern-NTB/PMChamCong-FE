import { useEffect, useState } from "react"
import { getAllVaiTroServices} from '../../services/vaitroServices.js'

export const useVaiTro = () => {
    const [danhSachVaiTro, setDanhSachVaiTro] = useState([])
    const [loadingVaiTro, setLoading] = useState(false)

    const getAllVaiTro= async () => {
        try {
            setLoading(true)
            const response = await getAllVaiTroServices()
            setDanhSachVaiTro(Array.isArray(response.data) ? response.data : [])
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            setDanhSachVaiTro([]); // Sửa tên biến
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        getAllVaiTro()
    },[])

    return {
        danhSachVaiTro,
        loadingVaiTro,
        getAllVaiTro
    }
}