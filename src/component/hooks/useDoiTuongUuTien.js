import { useEffect, useState } from "react";
import {
  getAllDoiTuongUuTienServices,
  createDoiTuongUuTienServices,
  updateDoiTuongUuTienServices,
  deleteDoiTuongUuTienServices,
} from "../../services/doituonguutienServices";

export const useDoiTuongUuTien = () => {
  const [danhSachDoiTuongUuTien, setDanhSachDoiTuongUuTien] = useState([]);
  const [loadingDoiTuongUuTien, setLoadingDoiTuongUuTien] = useState(false);

  const fetchAllDoiTuongUuTien = async () => {
    setLoadingDoiTuongUuTien(true);
    try {
      const res = await getAllDoiTuongUuTienServices();
      setDanhSachDoiTuongUuTien(Array.isArray(res.data) ? res.data : []);
    } catch {
      setDanhSachDoiTuongUuTien([]);
    } finally {
      setLoadingDoiTuongUuTien(false);
    }
  };

  const createDoiTuongUuTien = async (duLieuUuTien) => {
    const res = await createDoiTuongUuTienServices(duLieuUuTien);
    await fetchAllDoiTuongUuTien();
    return res;
  };

  const updateDoiTuongUuTien = async (duLieuUuTien) => {
    const res = await updateDoiTuongUuTienServices(duLieuUuTien);
    await fetchAllDoiTuongUuTien();
    return res;
  };

  const deleteDoiTuongUuTien = async (maUuTien) => {
    const res = await deleteDoiTuongUuTienServices(maUuTien);
    await fetchAllDoiTuongUuTien();
    return res;
  };

  useEffect(() => {
    fetchAllDoiTuongUuTien();
  }, []);

  return {
    danhSachDoiTuongUuTien,
    loadingDoiTuongUuTien,
    fetchAllDoiTuongUuTien,
    createDoiTuongUuTien,
    updateDoiTuongUuTien,
    deleteDoiTuongUuTien,
  };
};
