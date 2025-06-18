import { useEffect, useState } from "react";
import {
  getAllCaLamServices,
  updateCaLamServices,
  deleteCaLamServices,
  createCaLamServices,
} from "../../services/calamServices";

export const useCaLam = () => {
  const [danhSachCaLam, setDanhSachCaLam] = useState([]);
  const [loadingCaLam, setLoadingCaLam] = useState();
  const [isUpdatedCaLam, setIsUpdatedCaLam] = useState(false);
  const [isCreatedCaLam, setIsCreatedCaLam] = useState(false);
  const [isDeletedCaLam, setIsDeletedCaLam] = useState(false);
  const getAllCaLam = async () => {
    setLoadingCaLam(true);
    try {
      const res = await getAllCaLamServices();
      setDanhSachCaLam(res.data);
    } catch {
      setDanhSachCaLam([]);
    } finally {
      setLoadingCaLam(false);
    }
  };

  const updateCaLam = async (maCa, duLieuCaLam) => {
    setLoadingCaLam(true);

    try {
      await updateCaLamServices(maCa, duLieuCaLam);
      await getAllCaLam();
      setIsUpdatedCaLam(true);
    } catch {
      setIsUpdatedCaLam(false);
    } finally {
      setLoadingCaLam(false);
    }
  };

  const deleteCaLam = async (maCaLam) => {
    setLoadingCaLam(true);

    try {
      await deleteCaLamServices(maCaLam);
      await getAllCaLam();
      setIsDeletedCaLam(true);
    } catch {
      setIsDeletedCaLam(false);
    } finally {
      setLoadingCaLam(false);
    }
  };

  const createCaLam = async (duLieuCaLam) => {
    setLoadingCaLam(true);

    try {
      await createCaLamServices(duLieuCaLam);
      await getAllCaLam();
      isCreatedCaLam(true);
    } catch {
      isCreatedCaLam(false);
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
    setIsCreatedCaLam();
    setIsUpdatedCaLam();
    setIsDeletedCaLam();
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
