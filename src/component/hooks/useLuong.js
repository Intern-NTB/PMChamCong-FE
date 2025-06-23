import { useEffect, useState } from "react";
import {
  getAllLuongServices,
  createLuongServices,
  createLuongByIdServices,
  getAllLuongDieuChinhServices
} from "../../services/luongServices";
export const useLuong = () => {
  const [danhSachLuong, setDanhSachLuong] = useState([]);
  const [loadingLuong, setLoadingLuong] = useState(false);
  const [danhSachLichSuThayDoi, setDanhSachLichSuThayDoi] = useState([])
  const [isCreatedLuong, setIsCreatedLuong] = useState(false);
  const [isCreatedByIdLuong, setIsCreatedByIdLuong] = useState(false);

  const getAllLuong = async () => {
    setLoadingLuong(true);
    try {
      const res = await getAllLuongServices();
      setDanhSachLuong(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      setDanhSachLuong([]);
      throw error;
    } finally {
      setLoadingLuong(false);
    }
  };

  const createLuong = async (dataLuong) => {
    setLoadingLuong(true);
    try {
      await createLuongServices(dataLuong);
      setIsCreatedByIdLuong(true);
    } catch (error) {
      setIsCreatedByIdLuong(false);

      throw error;
    } finally {
      setLoadingLuong(false);
    }
  };

  const createLuongById = async (dataLuong) => {
    setLoadingLuong(true);
    try {
      await createLuongByIdServices(dataLuong);
      setIsCreatedLuong(true);
    } catch (error) {
      setIsCreatedLuong(false);

      throw error;
    } finally {
      setLoadingLuong(false);
    }
  };

  const historyChangeLuong = async () => {
    setLoadingLuong(true)
    try {
      const response = await getAllLuongDieuChinhServices();
      setDanhSachLichSuThayDoi(Array.isArray(response.data) ? response.data : []);
    } catch {
      setDanhSachLichSuThayDoi([]);
    } finally {
      setLoadingLuong(false)
    }
  }
  
  useEffect(() => {
    getAllLuong();
  }, []);

  useEffect(() => {
    if (isCreatedLuong || isCreatedByIdLuong) {
      getAllLuong();

      // Reset lại flag để lần tiếp theo thay đổi vẫn trigger useEffect
      setIsCreatedLuong(false);
      setIsCreatedByIdLuong(false);
    }
  }, [isCreatedLuong, isCreatedByIdLuong]);

  return {
    danhSachLuong,
    danhSachLichSuThayDoi,
    loadingLuong,
    getAllLuong,
    createLuong,
    createLuongById,
    historyChangeLuong,
  };
};
