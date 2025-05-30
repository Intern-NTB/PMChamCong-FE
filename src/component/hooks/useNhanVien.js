import { useState, useEffect } from 'react';
import { getAllNhanVienChiTietServices, createNhanVienServices, deleteNhanVienServices, updateNhanVienService } from '../../services/nhanvienServices';

export const useNhanVien = () => {
    const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusCreateNhanVien, setStatusCreateNhanVien] = useState(false);
    const [statusDeleteNhanVien, setStatusDeleteNhanVien] = useState(false);
    const [statusUpdateNhanVien, setStatusUpdateNhanVien] = useState(false);

    const fetchNhanVien = async () => {
        setLoading(true);
        try {
            const response = await getAllNhanVienChiTietServices();
            setDanhSachNhanVien(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhân viên:', error);
            setDanhSachNhanVien([]);
        } finally {
            setLoading(false);
        }
    };

    const addNhanVien = async (nhanVienData) => {
        setLoading(true);
        try {
            const res = await createNhanVienServices(nhanVienData);
            setStatusCreateNhanVien(res.success);
        } catch (error) {
            console.log("API Response Error: ", error);
        } finally {
            setLoading(false);
        }
    }

    const deleteNhanVien = async (maNhanVien) => {
        setLoading(true);
        try {
            await deleteNhanVienServices(maNhanVien);
            setStatusDeleteNhanVien(true)
        } catch (error) {
            console.log("API Response Error: ", error);
            setStatusDeleteNhanVien(false)
        } finally {
            setLoading(false);
        }
    }

    const updateNhanVien = async (maNhanVien, nhanVienData) => {
        setLoading(true);
        try {
            await updateNhanVienService(maNhanVien, nhanVienData)
            setStatusUpdateNhanVien(true)
        } catch (error) {
            console.log(`API Response Error: ${error}`)
            setStatusUpdateNhanVien(false)
        } finally {
            setLoading(true);
        }

    }


    useEffect(() => {
        fetchNhanVien();
    }, []);

    return {
        danhSachNhanVien,
        loading,
        statusCreateNhanVien,
        statusDeleteNhanVien,
        statusUpdateNhanVien,
        fetchNhanVien,
        addNhanVien,
        deleteNhanVien,
        updateNhanVien
    };
};