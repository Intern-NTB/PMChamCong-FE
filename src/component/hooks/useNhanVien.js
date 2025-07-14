import { useState, useEffect } from "react";
import {
  getAllNhanVienChiTietServices,
  createNhanVienServices,
  deleteNhanVienServices,
  updateNhanVienService,
  reloadNhanVienServices,
  getNhanVienByCCCDServices,
  updateEmailNhanVienByMaNhanVienServices,
} from "../../services/nhanvienServices";
import { useCallback } from "react";

export const useNhanVien = (isGetAllNhanvien = true) => {
  const [danhSachNhanVien, setDanhSachNhanVien] = useState([]);
  const [thongTinNhanVien, setThongTinNhanVien] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCreateNhanVien, setStatusCreateNhanVien] = useState(false);
  const [statusDeleteNhanVien, setStatusDeleteNhanVien] = useState(false);
  const [statusUpdateNhanVien, setStatusUpdateNhanVien] = useState(false);
  const [statusUpdateEmailNhanVien, setStatusUpdateEmailNhanVien] =
    useState(false);

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

  const fetchNhanVienByCCCD = useCallback(async (cccd) => {
    setLoading(true);
    try {
      const response = await getNhanVienByCCCDServices(cccd);
      setThongTinNhanVien(response.data);
    } catch (error) {
      setThongTinNhanVien(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmailNhanVien = async (maNhanVien, email) => {
    setLoading(true);
    try {
      await updateEmailNhanVienByMaNhanVienServices(maNhanVien, email);
      setStatusUpdateEmailNhanVien(true);
    } catch (error) {
      setStatusUpdateEmailNhanVien(false);
      throw error;
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
  };

  const deleteNhanVien = async (maNhanVien) => {
    setLoading(true);
    try {
      await deleteNhanVienServices(maNhanVien);
      setStatusDeleteNhanVien(true);
    } catch {
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
    } catch {
      setStatusUpdateNhanVien(false);
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
    if (isGetAllNhanvien) {
      fetchNhanVien();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  return {
    statusUpdateEmailNhanVien,
    thongTinNhanVien,
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
    fetchNhanVienByCCCD,
    updateEmailNhanVien,
  };
};
