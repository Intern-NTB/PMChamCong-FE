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
      try {
        await createLichSuUuTienServices(duLieuUuTien);
        getAllLichSuUuTien();
      } catch (error) {
        console.error("Lỗi thêm đối tượng ưu tiên:", error);
      }
    };

  const updateLichSuUuTien = async (maNhanVien, maUuTien,duLieuCapNhat) => {
    setLoadingLichSuUuTien(true);
    try {
      await updateLichSuUuTienServices(maNhanVien, maUuTien,duLieuCapNhat);
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
    createLichSuDoiTuongUuTien
  };
};
