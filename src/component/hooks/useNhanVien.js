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
    } catch {
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
    } catch  {
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
    } catch{
      setStatusUpdateNhanVien(false);
    } finally {
      setLoading(false);
    }
  };

  const getAllFingerprintsOfNhanVien = async () => {
    setLoading(true);
    try {
      const res = await getAllFingerprintsOfNhanVienServices();
      setDanhSachVanTayNhanVien(res.data);
      return res.data;
    } catch {
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