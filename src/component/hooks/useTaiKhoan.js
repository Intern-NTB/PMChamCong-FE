// src/component/hooks/useTaiKhoan.js
import { useEffect, useState } from "react";
import {
  loginServices,
  getAllTaiKhoanServices,
  createTaiKhoanServices,
  deleteTaiKhoanServices,
  updateTaiKhoanServices,
} from "../../services/taikhoanServices"; // Đảm bảo đường dẫn này chính xác

export const useTaiKhoan = () => {
  const [danhsachTaiKhoan, setDanhSachTaiKhoan] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [loadingDangNhap, setLoadingDangNhap] = useState(false);
  const [isCreatedTaiKhoan, setIsCreatedTaiKhoan] = useState(false);
  const [isDeletedTaiKhoan, setIsDeletedTaikhoan] = useState(false);
  const [isUpdatedTaiKhoan, setIsUpdatedTaikhoan] = useState(false);
  const [loadingTaiKhoan, setLoadingTaiKhoan] = useState(false); // Đã thêm

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

  // Login - CẬP NHẬT: Đảm bảo lưu 'permissions'
  const login = async (tenDangNhap, matKhau) => {
    setLoadingDangNhap(true);
    try {
      const res = await loginServices(tenDangNhap, matKhau);

      // Backend của bạn cần trả về cấu trúc như:
      // {
      //   token: "...",
      //   taiKhoan: { id: ..., tenDangNhap: ..., maVaiTro: ..., ... },
      //   permissions: ["permission:key:1", "permission:key:2", ...] // Mảng các string quyền
      // }
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("taiKhoan", JSON.stringify(res.data.taiKhoan));
      
      // Lưu userPermissions vào localStorage
      if (res.data.permissions && Array.isArray(res.data.permissions)) {
        localStorage.setItem("userPermissions", JSON.stringify(res.data.permissions));
      } else {
        // Nếu backend không trả về permissions hoặc không phải mảng, đặt mặc định là mảng rỗng
        localStorage.setItem("userPermissions", JSON.stringify([]));
      }

      setIsValid(true);
      return { success: true, ...res.data }; // Trả về tất cả thuộc tính của res.data
    } catch (error) {
      setIsValid(false);
      // Quan trọng: Trả về thông tin lỗi rõ ràng hơn
      return { 
        success: false, 
        message: error.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.',
        error: error 
      };
    } finally {
      setLoadingDangNhap(false);
    }
  };

  useEffect(() => {
    if (isCreatedTaiKhoan || isDeletedTaiKhoan || isUpdatedTaiKhoan) {
      getAllTaiKhoan();
    }
    // Đảm bảo reset trạng thái sau khi gọi getAllTaiKhoan
    setIsCreatedTaiKhoan(false);
    setIsDeletedTaikhoan(false);
    setIsUpdatedTaikhoan(false);
  }, [isCreatedTaiKhoan, isDeletedTaiKhoan, isUpdatedTaiKhoan]);
  
  useEffect(() => {
    getAllTaiKhoan();
  }, []); // Chỉ chạy 1 lần khi component mount

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