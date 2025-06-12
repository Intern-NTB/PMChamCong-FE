import { useEffect, useState } from "react";
import {
  getAllVaiTroServices,
  deleteVaiTroServices,
  createVaiTroServices,
  updateVaiTroServices,
} from "../../services/vaitroServices.js";

export const useVaiTro = () => {
  const [danhSachVaiTro, setDanhSachVaiTro] = useState([]);
  const [loadingVaiTro, setLoading] = useState(false);
  const [isDeletedVaiTro, setIsDeletedVaiTro] = useState(false);
  const [isCreatedVaiTro, setIsCreatedVaiTro] = useState(false);
  const [isUpdatedVaiTro, setIsUpdatedVaiTro] = useState(false);

  const getAllVaiTro = async () => {
    setLoading(true);

    try {
      const response = await getAllVaiTroServices();
      setDanhSachVaiTro(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng ban:", error);
      setDanhSachVaiTro([]); // Sửa tên biến
    } finally {
      setLoading(false);
    }
  };

  const createVaiTro = async (tenVaiTro) => {
    setLoading(true);

    try {
      await createVaiTroServices(tenVaiTro);
      setIsCreatedVaiTro(true);
    } catch {
      setIsCreatedVaiTro(false);
    } finally {
      setLoading(false);
    }
  };

  const updateVaiTro = async (maVaiTro, tenVaiTro) => {
    setLoading(true);

    try {
      await updateVaiTroServices(maVaiTro, tenVaiTro);
      setIsUpdatedVaiTro(true);
    } catch {
      setIsUpdatedVaiTro(false);
    } finally {
      setLoading(false);
    }
  };
  const deleteVaiTro = async (maVaiTro) => {
    setLoading(true);

    try {
      await deleteVaiTroServices(maVaiTro);
      setIsDeletedVaiTro(true);
    } catch {
      setIsDeletedVaiTro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllVaiTro();
  }, []);

  useEffect(() => {
    if (isCreatedVaiTro || isDeletedVaiTro || isUpdatedVaiTro) {
      getAllVaiTro();
      setIsCreatedVaiTro(false);
      setIsUpdatedVaiTro(false);
      setIsDeletedVaiTro(false);
    }
  }, [isCreatedVaiTro, isDeletedVaiTro, isUpdatedVaiTro]);

  return {
    danhSachVaiTro,
    loadingVaiTro,
    getAllVaiTro,
    deleteVaiTro,
    createVaiTro,
    updateVaiTro,
  };
};
