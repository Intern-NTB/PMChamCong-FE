import { useEffect, useState } from "react";
import {
  getAllLichSuUuTienServices,
  updateLichSuUuTienServices,
  deleteLichSuUuTienServices,
} from "../../services/lichsuuutienServices";

export const useLichSuUuTien = () => {
  const [danhSachLichSuUuTien, setDanhSachLichSuUuTien] = useState([]);
  const [loadingLichSuUuTien, setLoadingLichSuUuTien] = useState(false);
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

  const updateLichSuUuTien = async (maNhanVien, maUuTien) => {
    setLoadingLichSuUuTien(true);
    try {
      await updateLichSuUuTienServices(maNhanVien, maUuTien);
      setIsUpdatedLichSuUuTien(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch sử ưu tiên:", error);
      setIsUpdatedLichSuUuTien(false);
    } finally {
      setLoadingLichSuUuTien(false);
    }
  };

  const deleteLichSuUuTien = async (maNhanVien, maUuTien) => {
    setLoadingLichSuUuTien(true);
    try {
      await deleteLichSuUuTienServices(maNhanVien, maUuTien);
      setIsDeletedLichSuUuTien(true);
    } catch (error) {
      console.error("Lỗi khi xoá lịch sử ưu tiên:", error);
      setIsDeletedLichSuUuTien(false);
    } finally {
      setLoadingLichSuUuTien(false);
    }
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
  };
};
