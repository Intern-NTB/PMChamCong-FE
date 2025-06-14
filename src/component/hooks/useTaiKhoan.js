import { useEffect, useState } from "react";
import {
  loginServices,
  getAllTaiKhoanServices,
  createTaiKhoanServices,
  deleteTaiKhoanServices,
  updateTaiKhoanServices,
} from "../../services/taikhoanServices";

export const useTaiKhoan = () => {
  const [danhsachTaiKhoan, setDanhSachTaiKhoan] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loadingDangNhap, setLoadingDangNhap] = useState(false);
  const [loadingTaiKhoan, setLoadingTaiKhoan] = useState(false);
  const [isCreatedTaiKhoan, setIsCreatedTaiKhoan] = useState(false);
  const [isDeletedTaiKhoan, setIsDeletedTaikhoan] = useState(false);
  const [isUpdatedTaiKhoan, setIsUpdatedTaikhoan] = useState(false);

  const getAllTaiKhoan = async () => {
    setLoadingTaiKhoan(true);
    try {
      const res = await getAllTaiKhoanServices();
      setDanhSachTaiKhoan(res.data);
    } catch {
      setDanhSachTaiKhoan([]);
    } finally {
      setLoadingTaiKhoan(false);
    }
  };
  //Thêm
  const createTaiKhoan = async (newUser) => {
    setLoadingTaiKhoan(true);
    try {
      await createTaiKhoanServices(newUser);
      setIsCreatedTaiKhoan(true);
    } catch {
      setIsCreatedTaiKhoan(true);
    } finally {
      setLoadingTaiKhoan(false);
    }
  };
  //Xóa
  const deleteTaikhoan = async (maNhanVien) => {
    setLoadingTaiKhoan(true);
    try {
      await deleteTaiKhoanServices(maNhanVien);
      setIsDeletedTaikhoan(true);
    } catch {
      setIsDeletedTaikhoan(true);
    } finally {
      setLoadingTaiKhoan(false);
    }
  };
  //Sửa
  const updateTaiKhoan = async (dulieuTaiKhoan) => {
    setLoadingTaiKhoan(true);
    try {
      await updateTaiKhoanServices(dulieuTaiKhoan);
      setIsUpdatedTaikhoan(true);
    } catch {
      setIsUpdatedTaikhoan(true);
    } finally {
      setLoadingTaiKhoan(false);
    }
  };
  //Login
  const login = async (tenDangNhap, matKhau) => {
    setLoadingDangNhap(true);
    try {
      const res = await loginServices(tenDangNhap, matKhau);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("taiKhoan", JSON.stringify(res.data.taiKhoan));
      setIsValid(true);
      return { success: true, data: res.data };
    } catch (error) {
      setIsValid(false);
      throw error;
    } finally {
      setLoadingDangNhap(false);
    }
  };

  useEffect(() => {
    if (isCreatedTaiKhoan || isDeletedTaiKhoan || isUpdatedTaiKhoan) {
      getAllTaiKhoan();
    }
    setIsCreatedTaiKhoan(false),
      setIsDeletedTaikhoan(false),
      setIsUpdatedTaikhoan(false);
  }, [isCreatedTaiKhoan, isDeletedTaiKhoan, isUpdatedTaiKhoan]);
  useEffect(() => {
    getAllTaiKhoan();
  }, []);

  return {
    isValid,
    loadingDangNhap,
    loadingTaiKhoan,
    danhsachTaiKhoan,
    isCreatedTaiKhoan,
    isDeletedTaiKhoan,
    isUpdatedTaiKhoan,
    login,
    getAllTaiKhoan,
    createTaiKhoan,
    deleteTaikhoan,
    updateTaiKhoan,
  };
};
