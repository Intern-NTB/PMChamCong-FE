import { useEffect, useState } from "react";
import {
  getAllNgayPhepServices,
  tinhToanNgayPhepServices,
  tinhToanNgayPhepTatCaServices,
  getTienQuyDoiNgayPhepServices,
} from "../../services/ngayphepServices";

export const useNgayPhep = (isAutoGetAll = true) => {
  const [danhSachNgayPhep, setDanhSachNgayPhep] = useState([]);
  const [thongTinTienQuyDoiPhep, setThongTinTienQuyDoiPhep] = useState(null);
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

  const getTienQuyDoiNgayPhep = async (maNhanVien, body) => {
    try {
      const res = await getTienQuyDoiNgayPhepServices(maNhanVien, body);
      console.log("res:", res);
      setThongTinTienQuyDoiPhep(res.data[0]);
      return res.data[0];
    } catch (error) {
      setThongTinTienQuyDoiPhep(null);
      throw error;
    }
  };

  useEffect(() => {
    if (isUpdatedNgayPhep) {
      getAllNgayPhep();
    }
    setIsUpdatedNgayPhep(false);
  }, [isUpdatedNgayPhep]);

  useEffect(() => {
    if (isAutoGetAll) {
      getAllNgayPhep();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    thongTinTienQuyDoiPhep,
    danhSachNgayPhep,
    loadingNgayPhep,
    isUpdatedNgayPhep,
    getAllNgayPhep,
    tinhToanNgayPhep,
    tinhToanNgayPhepTatCa,
    getTienQuyDoiNgayPhep,
  };
};
