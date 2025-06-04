import { useEffect, useState } from "react";
import { getAllNghiPhepServices, updateNghiPhepServices, deleteNghiPhepServices, createNghiPhepServices } from "../../services/nghiphepServices";

export const useNghiPhep = () => {
    const [danhSachNghiPhep, setDanhSachNghiPhep] = useState([])
    const [loadingNghiPhep, setLoadingNghiPhep] = useState(false)
    const [isUpdatedNghiPhep, setIsUpdatedNghiPhep] = useState(false)
    const [isCreatedNghiPhep, setIsCreatedNghiPhep] = useState(false)
    const [isDeletedNghiPhep, setIsDeletedNghiPhep] = useState(false)


    const getAllNghiPhep = async () => {
        setLoadingNghiPhep(true)
        try {
            const res = await getAllNghiPhepServices()
            setDanhSachNghiPhep(res.data)
        } catch (error) {
            setDanhSachNghiPhep([])
        } finally {
            setLoadingNghiPhep(false)
        }
    }

    const updateNghiPhep = async (duLieuNghiPhep) => {
        setLoadingNghiPhep(true)
        try {
            await updateNghiPhepServices(duLieuNghiPhep)
            setIsUpdatedNghiPhep(true)
        } catch (error) {
            setIsUpdatedNghiPhep(false)
        } finally {
            setLoadingNghiPhep(false)

        }
    }

        const createNghiPhep = async (duLieuNghiPhep) => {
        setLoadingNghiPhep(true)
        try {
            await createNghiPhepServices(duLieuNghiPhep)
            setIsCreatedNghiPhep(true)
        } catch (error) {
            setIsCreatedNghiPhep(true)
        } finally {
            setLoadingNghiPhep(false)

        }
    }

        const deleteNghiPhep = async (maNghiPhep) => {
        setLoadingNghiPhep(true)
        try {
            await deleteNghiPhepServices(maNghiPhep)
            setIsDeletedNghiPhep(true)
        } catch (error) {
            setIsDeletedNghiPhep(false)
        } finally {
            setLoadingNghiPhep(false)
        }
    }

    useEffect(() => {
        getAllNghiPhep()
    }, [isUpdatedNghiPhep, isDeletedNghiPhep, isCreatedNghiPhep])

    return {
        danhSachNghiPhep,
        loadingNghiPhep,
        isCreatedNghiPhep,
        isUpdatedNghiPhep,
        isDeletedNghiPhep,
        getAllNghiPhep,
        updateNghiPhep,
        createNghiPhep,
        deleteNghiPhep

    }
}