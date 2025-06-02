import { useState } from "react"
import { loginServices } from "../../services/taikhoanServices"

export const useTaiKhoan = () => {
    const [isValid, setIsValid] = useState(false)
    const [loadingDangNhap, setLoadingDangNhap] = useState(false)

    const login = async (tenDangNhap, matKhau) => {
        setLoadingDangNhap(true)
        try {
            const res = await loginServices(tenDangNhap, matKhau)
            localStorage.setItem('token', res.data.token)
            localStorage.setItem('taiKhoan', JSON.stringify(res.data.taiKhoan))
            setIsValid(true)
            return { success: true, data: res.data }
        } catch (error) {
            setIsValid(false)
            throw error
        } finally {
            setLoadingDangNhap(false)
        }
    }

    return {
        isValid,
        loadingDangNhap,
        login
    }
}