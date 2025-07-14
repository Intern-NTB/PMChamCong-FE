import { useEffect, useState } from "react";
import {
  loginServices,
  getAllTaiKhoanServices,
  createTaiKhoanServices,
  deleteTaiKhoanServices,
  updateTaiKhoanServices,
} from "../../services/taikhoanServices"; 

export const useTaiKhoan = (shouldFetchAccounts = false) => {
  const [danhsachTaiKhoan, setDanhSachTaiKhoan] = useState([]);
  const [loadingDangNhap, setLoadingDangNhap] = useState(false);
  const [loadingTaiKhoan, setLoadingTaiKhoan] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false); 
  const [actionError, setActionError] = useState(null); 

  const getAllTaiKhoan = async () => {
    setLoadingTaiKhoan(true);
    setActionError(null); 
    try {
      const res = await getAllTaiKhoanServices();
      setDanhSachTaiKhoan(res.data);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setDanhSachTaiKhoan([]); 
      setActionError(error.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoadingTaiKhoan(false);
    }
  };

  const createTaiKhoan = async (newUser) => {
    setLoadingTaiKhoan(true);
    setActionSuccess(false); 
    setActionError(null);
    try {
      await createTaiKhoanServices(newUser);
      setActionSuccess(true); 
      await getAllTaiKhoan(); 
      return { success: true, message: 'Tạo tài khoản thành công.' };
    } catch (error) {
      console.error("Error creating account:", error);
      const errorMessage = error.response?.data?.message || 'Không thể tạo tài khoản mới.';
      setActionError(errorMessage);
      return { success: false, message: errorMessage, error: error };
    } finally {
      setLoadingTaiKhoan(false);
    }
  };

  const deleteTaikhoan = async (maNhanVien) => {
    setLoadingTaiKhoan(true);
    setActionSuccess(false);
    setActionError(null);
    try {
      await deleteTaiKhoanServices(maNhanVien);
      setActionSuccess(true); 
      await getAllTaiKhoan(); 
      return { success: true, message: 'Xóa tài khoản thành công.' };
    } catch (error) {
      console.error("Error deleting account:", error);
      const errorMessage = error.response?.data?.message || 'Không thể xóa tài khoản.';
      setActionError(errorMessage);
      return { success: false, message: errorMessage, error: error };
    } finally {
      setLoadingTaiKhoan(false);
    }
  };

  const updateTaiKhoan = async (dulieuTaiKhoan) => {
    setLoadingTaiKhoan(true);
    setActionSuccess(false);
    setActionError(null);
    try {
      await updateTaiKhoanServices(dulieuTaiKhoan);
      setActionSuccess(true); 
      await getAllTaiKhoan(); 
      return { success: true, message: 'Cập nhật tài khoản thành công.' };
    } catch (error) {
      console.error("Error updating account:", error);
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật tài khoản.';
      setActionError(errorMessage);
      return { success: false, message: errorMessage, error: error };
    } finally {
      setLoadingTaiKhoan(false);
    }
  };

  const login = async (tenDangNhap, matKhau) => {
    setLoadingDangNhap(true);
    try {
      const res = await loginServices(tenDangNhap, matKhau);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("taiKhoan", JSON.stringify(res.data.taiKhoan));

      if (res.data.permissions && Array.isArray(res.data.permissions)) {
        localStorage.setItem("userPermissions", JSON.stringify(res.data.permissions));
      } else {
        localStorage.setItem("userPermissions", JSON.stringify([]));
      }

      return { success: true, ...res.data };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Đã xảy ra lỗi không xác định khi đăng nhập.', 
        error: error
      };
    } finally {
      setLoadingDangNhap(false);
    }
  };

  useEffect(() => {
    if (shouldFetchAccounts) {
      getAllTaiKhoan();
    }
  }, [shouldFetchAccounts]);

  return {
    loadingDangNhap,
    loadingTaiKhoan,
    danhsachTaiKhoan,
    actionSuccess, 
    actionError, 
    login,
    getAllTaiKhoan,
    createTaiKhoan,
    deleteTaikhoan,
    updateTaiKhoan,
  };
};