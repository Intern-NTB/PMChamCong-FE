import { useEffect, useState } from "react";
import {
  getAllTangCaServices,
  updateTangCaServices,
  deleteTangCaServices,
  createTangCaServices,
} from "../../services/tangcaServices";
export const useTangCa = () => {
  const [danhSachTangCa, setDanhSachTangCa] = useState([]);
  const [loadingTangCa, setLoadingTangCa] = useState(false);
  const [isUpdatedTangCa, setIsUpdatedTangCa] = useState(false);
  const [isDeletedTangCa, setIsDeletedTangCa] = useState(false);
  const [isCreatedTangCa, setIsCreatedTangCa] = useState(false);

  const getAllTangCa = async () => {
    setLoadingTangCa(true);
    try {
      const res = await getAllTangCaServices();
      setDanhSachTangCa(res.data);
    } catch (error) {
      setDanhSachTangCa([]);
      throw error;
    } finally {
      setLoadingTangCa(false);
    }
  };

  const updateTangCa = async (duLieuTangCa) => {
    setLoadingTangCa(true);
    try {
      await updateTangCaServices(duLieuTangCa);
      setIsUpdatedTangCa(true);
    } catch (error) {
      setIsUpdatedTangCa(false);
      throw error;
    } finally {
      setLoadingTangCa(false);
    }
  };

  const deleteTangCa = async (ngayChamCong, maPhongBan) => {
    setLoadingTangCa(true);
    try {
      await deleteTangCaServices(ngayChamCong, maPhongBan);
      setIsDeletedTangCa(true);
    } catch (error) {
      setIsDeletedTangCa(false);
      throw error;
    } finally {
      setLoadingTangCa(false);
    }
  };

  const createTangCa = async (duLieuTangCa) => {
    setLoadingTangCa(true);
    try {
      await createTangCaServices(duLieuTangCa);
      setIsCreatedTangCa(true);
    } catch (error) {
      setIsCreatedTangCa(false);
      throw error;
    } finally {
      setLoadingTangCa(false);
    }
  };

  useEffect(() => {
    getAllTangCa();
  }, []);

  useEffect(() => {
    if (isCreatedTangCa || isUpdatedTangCa || isDeletedTangCa) {
      getAllTangCa();
    }

    setIsCreatedTangCa(false);
    setIsUpdatedTangCa(false);
    setIsDeletedTangCa(false);
  }, [isCreatedTangCa, isUpdatedTangCa, isDeletedTangCa]);

  return {
    loadingTangCa,
    danhSachTangCa,
    isCreatedTangCa,
    isUpdatedTangCa,
    isDeletedTangCa,
    getAllTangCa,
    updateTangCa,
    createTangCa,
    deleteTangCa,
  };
};
