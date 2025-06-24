import { useEffect, useState } from "react";
import {
  getAllCaLamServices,
  updateCaLamServices,
  deleteCaLamServices,
  createCaLamServices,
} from "../../services/calamServices";

export const useCaLam = () => {
  const [danhSachCaLam, setDanhSachCaLam] = useState([]);
  const [loadingCaLam, setLoadingCaLam] = useState(false);
  const [isUpdatedCaLam, setIsUpdatedCaLam] = useState(false);
  const [isCreatedCaLam, setIsCreatedCaLam] = useState(false);
  const [isDeletedCaLam, setIsDeletedCaLam] = useState(false);

  const getAllCaLam = async () => {
    setLoadingCaLam(true);
    try {
      const res = await getAllCaLamServices();
      setDanhSachCaLam(res.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Ca Lam:", error);
      setDanhSachCaLam([]);
    } finally {
      setLoadingCaLam(false);
    }
  };

  const updateCaLam = async (maCa, duLieuCaLam) => {
    setLoadingCaLam(true);
    try {
      await updateCaLamServices(maCa, duLieuCaLam);
      setIsUpdatedCaLam(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật Ca Lam:", error);
      setIsUpdatedCaLam(false);
      throw error;
    } finally {
      setLoadingCaLam(false);
    }
  };

  const deleteCaLam = async (maCaLam) => {
    setLoadingCaLam(true);
    try {
      await deleteCaLamServices(maCaLam);
      setIsDeletedCaLam(true);
    } catch (error) {
      console.error("Lỗi khi xóa Ca Lam:", error);
      setIsDeletedCaLam(false);
      throw error;
    } finally {
      setLoadingCaLam(false);
    }
  };

  const createCaLam = async (duLieuCaLam) => {
    setLoadingCaLam(true);
    try {
      await createCaLamServices(duLieuCaLam);
      setIsCreatedCaLam(true);
    } catch (error) {
      console.error("Lỗi khi tạo Ca Lam:", error);
      setIsCreatedCaLam(false);
      throw error;
    } finally {
      setLoadingCaLam(false);
    }
  };

  useEffect(() => {
    getAllCaLam();
  }, []);

  useEffect(() => {
    if (isUpdatedCaLam || isCreatedCaLam || isDeletedCaLam) {
      getAllCaLam();
    }
    setIsCreatedCaLam(false);
    setIsUpdatedCaLam(false);
    setIsDeletedCaLam(false);
  }, [isUpdatedCaLam, isCreatedCaLam, isDeletedCaLam]);

  return {
    danhSachCaLam,
    loadingCaLam,
    getAllCaLam,
    updateCaLam,
    deleteCaLam,
    createCaLam,
  };
};
