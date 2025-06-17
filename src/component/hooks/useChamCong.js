import { useEffect, useState } from 'react'
import { getAllChamCongServices, getAllChamCongDetailServices } from '../../services/chamcongServices'

export const useChamCong = () => {
    const [danhSachChamCong, setDanhSachChamCong] = useState([])
    const [danhSachChamCongChiTiet, setSachChamCongChiTiet] = useState([])
    const [loadingChamCong, setLoadingChamCong] = useState(false)
    const getAllChamCong = async () => {
        setLoadingChamCong(true)
        try {
            const res = await getAllChamCongServices()
            setDanhSachChamCong(Array.isArray(res.data) ? res.data : [])
        } catch  {
            setDanhSachChamCong([])
        } finally {
            setLoadingChamCong(false)
        }
    }

    const getAllChamCongDetail = async () => {
        setLoadingChamCong(true)
        try {
            const res = await getAllChamCongDetailServices()
            setSachChamCongChiTiet(Array.isArray(res.data) ? res.data : [])
        } catch {
            setSachChamCongChiTiet([])
        } finally {
            setLoadingChamCong(false)
        }
    }

    useEffect(() => {
        getAllChamCong()
        getAllChamCongDetail()
    }, []);

    return {
        danhSachChamCong,
        danhSachChamCongChiTiet,
        loadingChamCong,
        getAllChamCong,
        getAllChamCongDetail
    }
}