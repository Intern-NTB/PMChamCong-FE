import { useEffect, useState, useCallback } from "react"; 
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

  const getAllVaiTro = useCallback(async (maPhongBan = null) => {
    setLoading(true);

    try {

      const response = await getAllVaiTroServices(maPhongBan);
      setDanhSachVaiTro(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vai trò:", error); 
      setDanhSachVaiTro([]);
    } finally {
      setLoading(false);
    }
  }, []); 

  const createVaiTro = useCallback(async (tenVaiTro) => {
    setLoading(true);

    try {
      await createVaiTroServices(tenVaiTro);
      setIsCreatedVaiTro(true);
      await getAllVaiTro();
    } catch (error) { 
      console.error("Lỗi khi tạo vai trò:", error);
      setIsCreatedVaiTro(false);
    } finally {
      setLoading(false);
    }
  }, [getAllVaiTro]); 

  const updateVaiTro = useCallback(async (maVaiTro, tenVaiTro) => {
    setLoading(true);

    try {
      await updateVaiTroServices(maVaiTro, tenVaiTro);
      setIsUpdatedVaiTro(true);
      await getAllVaiTro(); 
    } catch (error) { 
      console.error("Lỗi khi cập nhật vai trò:", error);
      setIsUpdatedVaiTro(false);
    } finally {
      setLoading(false);
    }
  }, [getAllVaiTro]); 


  const deleteVaiTro = useCallback(async (maVaiTro) => {
    setLoading(true);

    try {
      await deleteVaiTroServices(maVaiTro);
      setIsDeletedVaiTro(true);
      await getAllVaiTro(); 
    } catch (error) { 
      console.error("Lỗi khi xóa vai trò:", error);
      setIsDeletedVaiTro(false);
    } finally {
      setLoading(false);
    }
  }, [getAllVaiTro]); 

  useEffect(() => {
    getAllVaiTro();
  }, [getAllVaiTro]); 

  useEffect(() => {
    if (isCreatedVaiTro) {
      setIsCreatedVaiTro(false);
    }
    if (isUpdatedVaiTro) {
      setIsUpdatedVaiTro(false);
    }
    if (isDeletedVaiTro) {
      setIsDeletedVaiTro(false);
    }
  }, [isCreatedVaiTro, isDeletedVaiTro, isUpdatedVaiTro]);


  return {
    danhSachVaiTro,
    loadingVaiTro,
    isCreatedVaiTro, 
    isUpdatedVaiTro,
    isDeletedVaiTro,
    getAllVaiTro,
    deleteVaiTro,
    createVaiTro,
    updateVaiTro,
  };
};