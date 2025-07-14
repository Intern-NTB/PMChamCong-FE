import { useState, useEffect } from "react";
import { getAllFingerprintsOfNhanVienServices } from "../../services/nhanvienServices";

export const useVanTay = () => {
  const [danhSachVanTayNhanVien, setDanhSachVanTayNhanVien] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAllFingerprintsOfNhanVien = async () => {
    setLoading(true);
    try {
      const res = await getAllFingerprintsOfNhanVienServices();
      setDanhSachVanTayNhanVien(res.data);
      return res.data;
    } catch {
      setDanhSachVanTayNhanVien([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllFingerprintsOfNhanVien();
  }, []);

  return {
    danhSachVanTayNhanVien,
    loading,
    getAllFingerprintsOfNhanVien,
  };
}; 