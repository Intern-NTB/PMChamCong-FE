import { useEffect, useState } from "react";
import {
  getAllLichSuUuTienServices,
  updateLichSuUuTienServices,
  deleteLichSuUuTienServices,
  createLichSuUuTienServices,
} from "../../services/lichsuuutienServices";

export const useLichSuUuTien = () => {
  const [danhSachLichSuUuTien, setDanhSachLichSuUuTien] = useState([]);
  const [loadingLichSuUuTien, setLoadingLichSuUuTien] = useState(false);
  const [isCreatedLichSuUuTien, setIsCreatedLichSuUuTien] = useState(false);
  const [isUpdatedLichSuUuTien, setIsUpdatedLichSuUuTien] = useState(false);
  const [isDeletedLichSuUuTien, setIsDeletedLichSuUuTien] = useState(false);

  const getAllLichSuUuTien = async () => {
    setLoadingLichSuUuTien(true);
    try {
      const res = await getAllLichSuUuTienServices();
      setDanhSachLichSuUuTien(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch sử ưu tiên:", error);
      setDanhSachLichSuUuTien([]);
    } finally {
      setLoadingLichSuUuTien(false);
    }
  };

  const createLichSuDoiTuongUuTien = async (duLieuUuTien) => {
    const res = await createLichSuUuTienServices(duLieuUuTien);
    await getAllLichSuUuTien();
    return res;
  };

  const updateLichSuUuTien = async (maNhanVien, maUuTien,duLieuCapNhat) => {
    const res = await updateLichSuUuTienServices(maNhanVien, maUuTien,duLieuCapNhat);
    await getAllLichSuUuTien();
    return res;
  };

  const deleteLichSuUuTien = async (maNhanVien, maUuTien) => {
    const res = await deleteLichSuUuTienServices(maNhanVien, maUuTien);
    await getAllLichSuUuTien();
    return res;
  };

  useEffect(() => {
    getAllLichSuUuTien();
  }, []);

  useEffect(() => {
    if (isUpdatedLichSuUuTien || isDeletedLichSuUuTien) {
      getAllLichSuUuTien();
      setIsUpdatedLichSuUuTien(false);
      setIsDeletedLichSuUuTien(false);
    }
  }, [isUpdatedLichSuUuTien, isDeletedLichSuUuTien]);

  return {
    danhSachLichSuUuTien,
    loadingLichSuUuTien,
    isUpdatedLichSuUuTien,
    isDeletedLichSuUuTien,
    getAllLichSuUuTien,
    updateLichSuUuTien,
    deleteLichSuUuTien,
    createLichSuDoiTuongUuTien
  };
};
