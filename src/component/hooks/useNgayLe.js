import { useEffect, useState } from "react";
import { createNgayLeServices, deleteNgayLeServices, getAllNgayLeServices, updateNgayLeServices } from "../../services/ngayleServices";

export const useNgayLe = () => {
    const [danhsachNgayLe, setDanhSachNgayLe] = useState([])
    const [loadingNgayLe, setLoadingNgayLe] = useState(false)
    const [isCreatedNgayLe, setIsCreatedNgayLe] = useState(false)
    const [isUpdatedNgayLe, setIsUpdatedNgayLe] = useState(false)
    const [isDeletedNgayLe, setIsDeletedNgayLe] = useState(false)

    const getAllNgayLe = async () => {
        setLoadingNgayLe(true)
        try {
            const res = await getAllNgayLeServices()
            setDanhSachNgayLe(res.data)
        } catch (error) {
            setDanhSachNgayLe([])
        } finally {
            setLoadingNgayLe(false)
        }
    }
    //Thêm
    const createNgayLe = async (duLieuNgayLe) => {
        setLoadingNgayLe(true)
        try {
            await createNgayLeServices(duLieuNgayLe)
            setIsCreatedNgayLe(true)
        } catch (error) {
            setIsCreatedNgayLe(true)
        } finally {
            setLoadingNgayLe(false)
        }
    }
    // Sửa
    const updateNgayLe = async (duLieuNgayLe) => {
        setLoadingNgayLe(true)
        try {
            await updateNgayLeServices(duLieuNgayLe)
            setIsUpdatedNgayLe(true)
        } catch (error) {
            setIsUpdatedNgayLe(true)
        } finally {
            setLoadingNgayLe(false)
        }
    }
    // Xóa
    const deleteNgayLe = async (duLieuNgayLe) => {
        setLoadingNgayLe(true)
        try {
            await deleteNgayLeServices(duLieuNgayLe)
            setIsDeletedNgayLe(true)
        } catch (error) {
            setIsDeletedNgayLe(true)
        } finally {
            setLoadingNgayLe(false)
        }
    }

    useEffect(() => {
        getAllNgayLe()
    }, [isCreatedNgayLe, isUpdatedNgayLe, isDeletedNgayLe])

    return {
        danhsachNgayLe,
        loadingNgayLe,
        isCreatedNgayLe,
        isUpdatedNgayLe,
        isDeletedNgayLe,
        getAllNgayLe,
        createNgayLe,
        updateNgayLe,
        deleteNgayLe
    }
}