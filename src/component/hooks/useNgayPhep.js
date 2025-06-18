import { useEffect, useState } from "react";
import {
  getAllNgayPhepServices,
  tinhToanNgayPhepServices,
  tinhToanNgayPhepTatCaServices,
} from "../../services/ngayphepServices";

export const useNgayPhep = () => {
  const [danhSachNgayPhep, setDanhSachNgayPhep] = useState([]);
  const [loadingNgayPhep, setLoadingNgayPhep] = useState(false);
  const [isUpdatedNgayPhep, setIsUpdatedNgayPhep] = useState(false);

  const getAllNgayPhep = async () => {
    setLoadingNgayPhep(true);
    try {
      const res = await getAllNgayPhepServices();
      setDanhSachNgayPhep(res.data);
    } catch (error) {
      setDanhSachNgayPhep([]);
      throw error;
    } finally {
      setLoadingNgayPhep(false);
    }
  };

  const tinhToanNgayPhep = async (nam, thang) => {
    setLoadingNgayPhep(true);
    try {
      await tinhToanNgayPhepServices(nam, thang);
      setIsUpdatedNgayPhep(true);
    } catch (error) {
      setIsUpdatedNgayPhep(false);
      throw error;
    } finally {
      setLoadingNgayPhep(false);
    }
  };
  const tinhToanNgayPhepTatCa = async (nam, thang) => {
    setLoadingNgayPhep(true);
    try {
      await tinhToanNgayPhepTatCaServices(nam, thang);
      setIsUpdatedNgayPhep(true);
    } catch (error) {
      setIsUpdatedNgayPhep(false);
      throw error;
    } finally {
      setLoadingNgayPhep(false);
    }
  };

  useEffect(() => {
    if (isUpdatedNgayPhep) {
      getAllNgayPhep();
    }
    setIsUpdatedNgayPhep(false);
  }, [isUpdatedNgayPhep]);

  useEffect(() => {
    getAllNgayPhep();
  }, []);

  return {
    danhSachNgayPhep,
    loadingNgayPhep,
    isUpdatedNgayPhep,
    getAllNgayPhep,
    tinhToanNgayPhep,
    tinhToanNgayPhepTatCa,
  };
};
