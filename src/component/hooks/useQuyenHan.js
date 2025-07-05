import { useEffect, useState, useCallback } from "react";
import { getAllQuyenHanServices } from "../../services/quyenhanServices.js";

export const useQuyenHan = () => {
  const [danhSachQuyenHan, setDanhSachQuyenHan] = useState([]);
  const [loadingQuyenHan, setLoadingQuyenHan] = useState(false);

  const getAllQuyenHan = useCallback(async () => {
    setLoadingQuyenHan(true);
    try {
      const response = await getAllQuyenHanServices();
      setDanhSachQuyenHan(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vai trò:", error);
      setDanhSachQuyenHan([]);
    } finally {
      setLoadingQuyenHan(false);
    }
  }, []);

  useEffect(() => {
    getAllQuyenHan();
  }, [getAllQuyenHan]);

  return {
    loadingQuyenHan,
    danhSachQuyenHan,
    getAllQuyenHan,
  };
};
