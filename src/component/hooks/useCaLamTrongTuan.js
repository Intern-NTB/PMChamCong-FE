import { useEffect, useState } from "react";
import {
  getCaLamTrongTuanByPhongBanServices,
  updateCaLamTrongTuanServices,
  getCaLamTrongTuanServices,
} from "../../services/calamtrongtuanServices";

export const useCaLamTrongTuan = () => {
  // ==== CA LÀM TRONG TUẦN ====
  const [danhSachCaLamTrongTuan, setDanhSachCaLamTrongTuan] = useState([]);
  const [
    danhSachCaLamTrongTuanTheoPhongBan,
    setDanhSachCaLamTrongTuanTheoPhongBan,
  ] = useState([]);
  const [isUpdatedCaLamTrongTuan, setIsUpdatedCaLamTrongTuan] = useState(false);
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

  const updateCaLamTrongTuan = async (maCa, duLieuCaLam) => {
    setLoadingCaLamTrongTuan(true);
    try {
      await updateCaLamTrongTuanServices(maCa, duLieuCaLam);
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
    if (isUpdatedCaLamTrongTuan) {
      getAllCaLamTrongTuan();
    }
    setIsUpdatedCaLamTrongTuan(false);
  }, [isUpdatedCaLamTrongTuan]);

  return {
    danhSachCaLamTrongTuanTheoPhongBan,
    danhSachCaLamTrongTuan,
    loadingCaLamTrongTuan,
    getAllCaLamTrongTuanByPhongBan,
    getAllCaLamTrongTuan,
    updateCaLamTrongTuan,
  };
};
