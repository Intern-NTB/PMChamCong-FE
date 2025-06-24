import { useEffect, useState } from "react";
import {
  getCaLamTrongTuanByPhongBanServices,
  updateCaLamTrongTuanServices,
  getCaLamTrongTuanServices,
  createCaLamTrongTuanServices,
} from "../../services/calamtrongtuanServices";

export const useCaLamTrongTuan = () => {
  // ==== CA LÀM TRONG TUẦN ====
  const [danhSachCaLamTrongTuan, setDanhSachCaLamTrongTuan] = useState([]);
  const [
    danhSachCaLamTrongTuanTheoPhongBan,
    setDanhSachCaLamTrongTuanTheoPhongBan,
  ] = useState([]);
  const [isUpdatedCaLamTrongTuan, setIsUpdatedCaLamTrongTuan] = useState(false);
  const [isCreatedCaLamTrongTuan, setIsCreatedCaLamTrongTuan] = useState(false);
  const [loadingCaLamTrongTuan, setLoadingCaLamTrongTuan] = useState(false);

  const getAllCaLamTrongTuan = async () => {
    setLoadingCaLamTrongTuan(true);
    try {
      const res = await getCaLamTrongTuanServices();
      setDanhSachCaLamTrongTuan(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Ca Lam Trong Tuần:", error);
      setDanhSachCaLamTrongTuan([]);
    } finally {
      setLoadingCaLamTrongTuan(false);
    }
  };

  const getAllCaLamTrongTuanByPhongBan = async (maCa) => {
    setLoadingCaLamTrongTuan(true);
    try {
      const res = await getCaLamTrongTuanByPhongBanServices(maCa);
      setDanhSachCaLamTrongTuanTheoPhongBan(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Ca Lam Theo Phòng Ban:", error);
      setDanhSachCaLamTrongTuanTheoPhongBan([]);
    } finally {
      setLoadingCaLamTrongTuan(false);
    }
  };

  const createCaLamTrongTuan = async (dataCaLamTrongTuan) => {
    setLoadingCaLamTrongTuan(true);
    try {
      await createCaLamTrongTuanServices(dataCaLamTrongTuan);
      setIsCreatedCaLamTrongTuan(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Ca Lam Trong Tuần:", error);
      setIsCreatedCaLamTrongTuan(false);
    } finally {
      setLoadingCaLamTrongTuan(false);
    }
  };

  const updateCaLamTrongTuan = async (duLieuCaLam) => {
    setLoadingCaLamTrongTuan(true);
    try {
      await updateCaLamTrongTuanServices(duLieuCaLam);
      setIsUpdatedCaLamTrongTuan(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật Ca Lam Trong Tuần:", error);
      setIsUpdatedCaLamTrongTuan(false);
      throw error;
    } finally {
      setLoadingCaLamTrongTuan(false);
    }
  };

  useEffect(() => {
    getAllCaLamTrongTuan();
  }, []);

  useEffect(() => {
    if (isUpdatedCaLamTrongTuan || isCreatedCaLamTrongTuan) {
      getAllCaLamTrongTuan();
    }
    setIsUpdatedCaLamTrongTuan(false);
    setIsCreatedCaLamTrongTuan(false);
  }, [isUpdatedCaLamTrongTuan, isCreatedCaLamTrongTuan]);

  return {
    danhSachCaLamTrongTuanTheoPhongBan,
    danhSachCaLamTrongTuan,
    loadingCaLamTrongTuan,
    getAllCaLamTrongTuanByPhongBan,
    getAllCaLamTrongTuan,
    updateCaLamTrongTuan,
    createCaLamTrongTuan,
  };
};
