import { useState, useEffect } from "react";
import {
  getAllFingerprintsOfNhanVienServices,
  getAllNhanVienChiTietServices,
  createNhanVienServices,
  deleteNhanVienServices,
  updateNhanVienService,
  reloadNhanVienServices,
} from "../../services/nhanvienServices";
import { useCallback } from "react";

export const useNhanVien = () => {
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [danhSachVanTayNhanVien, setDanhSachVanTayNhanVien] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusCreateNhanVien, setStatusCreateNhanVien] = useState(false);
  const [statusDeleteNhanVien, setStatusDeleteNhanVien] = useState(false);
  const [statusUpdateNhanVien, setStatusUpdateNhanVien] = useState(false);

  const fetchNhanVien = useCallback(async () => {
    setLoading(true);
    try {
      await reloadData();
      const response = await getAllNhanVienChiTietServices();
      setDanhSachNhanVien(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhân viên:", error);
      setDanhSachNhanVien([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  };

  const deleteNhanVien = async (maNhanVien) => {
    setLoading(true);
    try {
      await deleteNhanVienServices(maNhanVien);
      setStatusDeleteNhanVien(true);
    } catch (error) {
      console.log("API Response Error: ", error);
      setStatusDeleteNhanVien(false);
    } finally {
      setLoading(false);
    }
  };

  const updateNhanVien = async (maNhanVien, nhanVienData) => {
    setLoading(true);
    try {
      await updateNhanVienService(maNhanVien, nhanVienData);
      setStatusUpdateNhanVien(true);
    } catch (error) {
      console.log(`API Response Error: ${error}`);
      setStatusUpdateNhanVien(false);
    } finally {
      setLoading(false);
    }
  };

  // SỬA: Bỏ useCallback để tránh vấn đề dependency
  const getAllFingerprintsOfNhanVien = async () => {
    setLoading(true);
    try {
      const res = await getAllFingerprintsOfNhanVienServices();
      setDanhSachVanTayNhanVien(res.data);
      return res.data; // SỬA: Return data để có thể sử dụng kết quả
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vân tay:", error);
      setDanhSachVanTayNhanVien([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      await reloadNhanVienServices();
    } catch (error) {
      console.log(`API Response Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // SỬA: Tách riêng useEffect và chỉ chạy 1 lần khi component mount
  useEffect(() => {
    const initData = async () => {
      await fetchNhanVien();
      await getAllFingerprintsOfNhanVien();
    };
    initData();
  }, []); 

  return {
    danhSachVanTayNhanVien,
    danhSachNhanVien,
    loading,
    statusCreateNhanVien,
    statusDeleteNhanVien,
    statusUpdateNhanVien,
    fetchNhanVien,
    addNhanVien,
    deleteNhanVien,
    updateNhanVien,
    reloadData,
    getAllFingerprintsOfNhanVien,
  };
};