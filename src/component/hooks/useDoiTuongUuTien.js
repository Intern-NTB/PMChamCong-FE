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
    try {
      await createDoiTuongUuTienServices(duLieuUuTien);
      fetchAllDoiTuongUuTien();
    } catch (error) {
      console.error("Lỗi thêm đối tượng ưu tiên:", error);
    }
  };

  const updateDoiTuongUuTien = async (duLieuUuTien) => {
    try {
      await updateDoiTuongUuTienServices(duLieuUuTien);
      fetchAllDoiTuongUuTien();
    } catch (error) {
      console.error("Lỗi cập nhật đối tượng ưu tiên:", error);
    }
  };

  const deleteDoiTuongUuTien = async (maUuTien) => {
    try {
      await deleteDoiTuongUuTienServices(maUuTien);
      fetchAllDoiTuongUuTien();
    } catch (error) {
      console.error("Lỗi xóa đối tượng ưu tiên:", error);
      throw error;
    }
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
