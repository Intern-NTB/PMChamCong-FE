import { useEffect, useState } from "react";
import {
  getAllNghiPhepServices,
  updateNghiPhepServices,
  deleteNghiPhepServices,
  createNghiPhepServices,
} from "../../services/ngaynghiServices";

export const useNghiPhep = (isGetAllNgaynghiPhep = true) => {
  const [danhSachNghiPhep, setDanhSachNghiPhep] = useState([]);
  const [loadingNghiPhep, setLoadingNghiPhep] = useState(false);
  const [isUpdatedNghiPhep, setIsUpdatedNghiPhep] = useState(false);
  const [isCreatedNghiPhep, setIsCreatedNghiPhep] = useState(false);
  const [isDeletedNghiPhep, setIsDeletedNghiPhep] = useState(false);

  const getAllNghiPhep = async () => {
    setLoadingNghiPhep(true);
    try {
      const res = await getAllNghiPhepServices();
      setDanhSachNghiPhep(res.data);
    } catch {
      setDanhSachNghiPhep([]);
    } finally {
      setLoadingNghiPhep(false);
    }
  };

  const updateNghiPhep = async (maNghiPhep, duLieuNghiPhep) => {
    setLoadingNghiPhep(true);
    try {
      const res = await updateNghiPhepServices(maNghiPhep, duLieuNghiPhep);
      setIsUpdatedNghiPhep(true);
      return res;
    } catch (error) {
      setIsUpdatedNghiPhep(false);
      throw error;
    } finally {
      setLoadingNghiPhep(false);
    }
  };

  const createNghiPhep = async (duLieuNghiPhep) => {
    setLoadingNghiPhep(true);
    try {
      const res = await createNghiPhepServices(duLieuNghiPhep);
      setIsCreatedNghiPhep(true);
      return res;
    } catch (error) {
      setIsCreatedNghiPhep(false);
      throw error;
    } finally {
      setLoadingNghiPhep(false);
    }
  };

  const deleteNghiPhep = async (maNghiPhep) => {
    setLoadingNghiPhep(true);
    try {
      const res = await deleteNghiPhepServices(maNghiPhep);
      setIsDeletedNghiPhep(true);
      return res;
    } catch (error) {
      setIsDeletedNghiPhep(false);
      throw error;
    } finally {
      setLoadingNghiPhep(false);
    }
  };

  useEffect(() => {
    if (isUpdatedNghiPhep || isCreatedNghiPhep || isDeletedNghiPhep) {
      getAllNghiPhep();
    }
    setIsUpdatedNghiPhep(false);
    setIsCreatedNghiPhep(false);
    setIsDeletedNghiPhep(false);
  }, [isUpdatedNghiPhep, isCreatedNghiPhep, isDeletedNghiPhep]);

  useEffect(() => {
    if (isGetAllNgaynghiPhep) {
      getAllNghiPhep();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    danhSachNghiPhep,
    loadingNghiPhep,
    isCreatedNghiPhep,
    isUpdatedNghiPhep,
    isDeletedNghiPhep,
    getAllNghiPhep,
    updateNghiPhep,
    createNghiPhep,
    deleteNghiPhep,
  };
};
