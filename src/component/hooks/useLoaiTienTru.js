import { useEffect, useState } from "react";
import {
  getAllLoaiTienTruServices,
  createLoaiTienTruServices,
  updateLoaiTienTruServices,
  deleteLoaiTienTruServices
} from "../../services/loaitientruServies";

export const useLoaiTienTru = () => {
  const [danhSachLoaiTienTru, setDanhSachLoaiTienTru] = useState([]);
  const [loadingLoaiTienTru, setLoadingLoaiTienTru] = useState(false);
  const [isCreatedLoaiTienTru, setIsCreatedLoaiTienTru] = useState(false);
  const [isUpdatedLoaiTienTru, setIsUpdatedLoaiTienTru] = useState(false);
  const [isDeletedLoaiTienTru, setIsDeletedLoaiTienTru] = useState(false);

  const getAllLoaiTienTru = async () => {
    setLoadingLoaiTienTru(true);
    try {
      const res = await getAllLoaiTienTruServices();
      setDanhSachLoaiTienTru(res.data);
    } catch  {
      setDanhSachLoaiTienTru([]);
    } finally {
      setLoadingLoaiTienTru(false);
    }
  };

  const createLoaiTienTru = async (duLieuLoaiTienTru) => {
    setLoadingLoaiTienTru(true);
    try {
      await createLoaiTienTruServices(duLieuLoaiTienTru);
      setIsCreatedLoaiTienTru(true);
    } catch  {
      setIsCreatedLoaiTienTru(false);
    } finally {
      setLoadingLoaiTienTru(false);
    }
  };

  const updateLoaiTienTru = async (duLieuLoaiTienTru) => {
    setLoadingLoaiTienTru(true);
    try {
      await updateLoaiTienTruServices(duLieuLoaiTienTru);
      setIsUpdatedLoaiTienTru(true);
    } catch  {
      setIsUpdatedLoaiTienTru(false);
    } finally {
      setLoadingLoaiTienTru(false);
    }
  };

  const deleteLoaiTienTru = async (maLoaiTienTru) => {
    setLoadingLoaiTienTru(true);
    try {
      await deleteLoaiTienTruServices(maLoaiTienTru);
      setIsDeletedLoaiTienTru(true);
    } catch  {
      setIsDeletedLoaiTienTru(false);
    } finally {
      setLoadingLoaiTienTru(false);
    }
  };

  useEffect(() => {
    getAllLoaiTienTru();
  }, []);

   useEffect(() => {
        if (isCreatedLoaiTienTru || isUpdatedLoaiTienTru || isDeletedLoaiTienTru) {
            getAllLoaiTienTru();

            // Reset lại flag để lần tiếp theo thay đổi vẫn trigger useEffect
            setIsCreatedLoaiTienTru(false);
            setIsUpdatedLoaiTienTru(false);
            setIsDeletedLoaiTienTru(false);
        }
    }, [isCreatedLoaiTienTru, isUpdatedLoaiTienTru, isDeletedLoaiTienTru]);

  return {
    danhSachLoaiTienTru,
    loadingLoaiTienTru,
    isCreatedLoaiTienTru,
    isUpdatedLoaiTienTru,
    isDeletedLoaiTienTru,
    getAllLoaiTienTru,
    createLoaiTienTru,
    updateLoaiTienTru,
    deleteLoaiTienTru
  };
};
