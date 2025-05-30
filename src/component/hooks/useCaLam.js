import { useEffect, useState } from "react"
import { getAllCaLamServices, updateCaLamServices, deleteCaLamServices, createCaLamServices } from "../../services/calamServices"

export const useCaLam = () => {
    const [danhSachCaLam, setDanhSachCaLam] = useState([])
    const [loadingCaLam, setLoadingCaLam] = useState()

    const getAllCaLam = async () => {
        setLoadingCaLam(true)
        try {
            const res = await getAllCaLamServices()
            setDanhSachCaLam(res.data)
        } catch (error) {
            setDanhSachCaLam([])
        } finally {
            setLoadingCaLam(false)
        }
    }

    const updateCaLam = async (maCa,duLieuCaLam) => {
        setLoadingCaLam(true)

        try {
            await updateCaLamServices(maCa,duLieuCaLam)
            await getAllCaLam()
        } catch (error) {
            throw error
        } finally {
            setLoadingCaLam(false)

        }
    }

    const deleteCaLam = async (maCaLam) => {
        setLoadingCaLam(true)

        try {
            await deleteCaLamServices(maCaLam)
            await getAllCaLam()
        } catch (error) {
            throw error
        } finally {
            setLoadingCaLam(false)

        }
    }

    const createCaLam = async (duLieuCaLam) => {
        setLoadingCaLam(true)

        try {
            await createCaLamServices(duLieuCaLam)
            await getAllCaLam()
        } catch (error) {
            throw error
        } finally {
            setLoadingCaLam(false)

        }
    }

    useEffect(() => {
        getAllCaLam()
    }, [])

    return {
        danhSachCaLam,
        loadingCaLam,
        getAllCaLam,
        updateCaLam,
        deleteCaLam,
        createCaLam

    }
}