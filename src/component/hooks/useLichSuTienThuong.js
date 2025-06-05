import { useEffect, useState } from "react";
import {
  getAllLichSuThuongServices,
  createLichSuThuongServices,
  updateLichSuThuongServices,
  deleteLichSuThuongServices,
} from "../../services/lichsutienthuongServices";

export const useLichSuThuong = () => {
  const [danhSachLichSuThuong, setDanhSachLichSuThuong] = useState([]);
  const [loadingLichSuThuong, setLoadingLichSuThuong] = useState(false);
  const [isCreatedLichSuThuong, setIsCreatedLichSuThuong] = useState(false);
  const [isUpdatedLichSuThuong, setIsUpdatedLichSuThuong] = useState(false);
  const [isDeletedLichSuThuong, setIsDeletedLichSuThuong] = useState(false);

  const getAllLichSuThuong = async () => {
    setLoadingLichSuThuong(true);
    try {
      const res = await getAllLichSuThuongServices();
      setDanhSachLichSuThuong(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch sử thưởng:", error);
      setDanhSachLichSuThuong([]);
    } finally {
      setLoadingLichSuThuong(false);
    }
  };

  const createLichSuThuong = async (duLieuLichSuThuong) => {
    setLoadingLichSuThuong(true);
    try {
      await createLichSuThuongServices(duLieuLichSuThuong);
      setIsCreatedLichSuThuong(true);
    } catch (error) {
      console.error("Lỗi khi tạo lịch sử thưởng:", error);
      setIsCreatedLichSuThuong(false);
    } finally {
      setLoadingLichSuThuong(false);
    }
  };

  const updateLichSuThuong = async (duLieuLichSuThuong) => {
    setLoadingLichSuThuong(true);
    try {
      await updateLichSuThuongServices(duLieuLichSuThuong);
      setIsUpdatedLichSuThuong(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật lịch sử thưởng:", error);
      setIsUpdatedLichSuThuong(false);
    } finally {
      setLoadingLichSuThuong(false);
    }
  };

  const deleteLichSuThuong = async (maNhanVien, maLoaiTienThuong) => {
    setLoadingLichSuThuong(true);
    try {
      await deleteLichSuThuongServices(maNhanVien, maLoaiTienThuong);
      setIsDeletedLichSuThuong(true);
    } catch (error) {
      console.error("Lỗi khi xoá lịch sử thưởng:", error);
      setIsDeletedLichSuThuong(false);
    } finally {
      setLoadingLichSuThuong(false);
    }
  };

  useEffect(() => {
    getAllLichSuThuong();
  }, []);

  useEffect(() => {
    if (isCreatedLichSuThuong || isUpdatedLichSuThuong || isDeletedLichSuThuong) {
      getAllLichSuThuong();
      setIsCreatedLichSuThuong(false);
      setIsUpdatedLichSuThuong(false);
      setIsDeletedLichSuThuong(false);
    }
  }, [isCreatedLichSuThuong, isUpdatedLichSuThuong, isDeletedLichSuThuong]);

  return {
    danhSachLichSuThuong,
    loadingLichSuThuong,
    isCreatedLichSuThuong,
    isUpdatedLichSuThuong,
    isDeletedLichSuThuong,
    getAllLichSuThuong,
    createLichSuThuong,
    updateLichSuThuong,
    deleteLichSuThuong,
  };
};
