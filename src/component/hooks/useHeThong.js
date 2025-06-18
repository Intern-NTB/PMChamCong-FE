import { useEffect, useState } from "react";
import {
  getAllHeThongServices,
  updateHeThongServices,
} from "../../services/hethongServices";

export const useHeThong = () => {
  const [danhSachHeThong, setDanhSachHeThong] = useState([]);
  const [loadingHeThong, setLoadingHeThong] = useState(false);
  const [isUpdatedHeThong, setIsUpdatedHeThong] = useState(false);

  const getAllHeThong = async () => {
    setLoadingHeThong(true);
    try {
      const res = await getAllHeThongServices();
      setDanhSachHeThong(res.data);
    } catch (error) {
      setDanhSachHeThong([]);
      throw error;
    } finally {
      setLoadingHeThong(false);
    }
  };

  const updateHeThong = async (duLieuHeThong) => {
    setLoadingHeThong(true);
    try {
      await updateHeThongServices(duLieuHeThong);
      setIsUpdatedHeThong(true);
    } catch (error) {
      setIsUpdatedHeThong(false);
      throw error;
    } finally {
      setLoadingHeThong(false);
    }
  };

  useEffect(() => {
    if (isUpdatedHeThong) {
      getAllHeThong();
    }
    setIsUpdatedHeThong(false);
  }, [isUpdatedHeThong]);

  useEffect(() => {
    getAllHeThong();
  },[]);

  return {
    danhSachHeThong,
    loadingHeThong,
    isUpdatedHeThong,
    getAllHeThong,
    updateHeThong,
  };
};
