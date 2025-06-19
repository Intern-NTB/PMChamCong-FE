import { useEffect, useState } from "react";
import {
  createNgayLeServices,
  deleteNgayLeServices,
  getAllNgayLeServices,
  updateNgayLeServices,
} from "../../services/ngayleServices";

export const useNgayLe = () => {
  const [danhSachNgayLe, setDanhSachNgayLe] = useState([]);
  const [loadingNgayLe, setLoadingNgayLe] = useState(false);
  const [isCreatedNgayLe, setIsCreatedNgayLe] = useState(false);
  const [isUpdatedNgayLe, setIsUpdatedNgayLe] = useState(false);
  const [isDeletedNgayLe, setIsDeletedNgayLe] = useState(false);

  const getAllNgayLe = async () => {
    setLoadingNgayLe(true);
    try {
      const res = await getAllNgayLeServices();
      setDanhSachNgayLe(res.data);
    } catch {
      setDanhSachNgayLe([]);
    } finally {
      setLoadingNgayLe(false);
    }
  };
  //Thêm
  const createNgayLe = async (duLieuNgayLe) => {
    setLoadingNgayLe(true);
    try {
      await createNgayLeServices(duLieuNgayLe);
      setIsCreatedNgayLe(true);
    } catch {
      setIsCreatedNgayLe(true);
    } finally {
      setLoadingNgayLe(false);
    }
  };
  // Sửa
  const updateNgayLe = async (duLieuNgayLe) => {
    setLoadingNgayLe(true);
    try {
      await updateNgayLeServices(duLieuNgayLe);
      setIsUpdatedNgayLe(true);
    } catch {
      setIsUpdatedNgayLe(true);
    } finally {
      setLoadingNgayLe(false);
    }
  };
  // Xóa
  const deleteNgayLe = async (duLieuNgayLe) => {
    setLoadingNgayLe(true);
    try {
      await deleteNgayLeServices(duLieuNgayLe);
      setIsDeletedNgayLe(true);
    } catch {
      setIsDeletedNgayLe(true);
    } finally {
      setLoadingNgayLe(false);
    }
  };
  useEffect(() => {
    getAllNgayLe();
  }, []);
  useEffect(() => {
    if (isCreatedNgayLe || isUpdatedNgayLe || isDeletedNgayLe) {
      getAllNgayLe();
    }

    setIsCreatedNgayLe(false);
    setIsUpdatedNgayLe(false);
    setIsDeletedNgayLe(false);
  }, [isCreatedNgayLe, isUpdatedNgayLe, isDeletedNgayLe]);

  return {
    danhSachNgayLe,
    loadingNgayLe,
    isCreatedNgayLe,
    isUpdatedNgayLe,
    isDeletedNgayLe,
    getAllNgayLe,
    createNgayLe,
    updateNgayLe,
    deleteNgayLe,
  };
};
