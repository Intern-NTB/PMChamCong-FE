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

  // Login - CẬP NHẬT ĐỂ TRẢ VỀ DỮ LIỆU ĐẦY ĐỦ BAO GỒM PERMISSIONS
  const login = async (tenDangNhap, matKhau) => {
    setLoadingDangNhap(true);
    try {
      const res = await loginServices(tenDangNhap, matKhau);

      // Backend của bạn cần trả về cấu trúc như:
      // {
      //   token: "...",
      //   taiKhoan: { maVaiTro: ..., ... },
      //   permissions: ["permission:key:1", "permission:key:2", ...] // Mảng các string quyền
      // }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("taiKhoan", JSON.stringify(res.data.taiKhoan));
      
      // Nếu backend trả về permissions, hãy lưu nó vào localStorage
      if (res.data.permissions && Array.isArray(res.data.permissions)) {
        localStorage.setItem("userPermissions", JSON.stringify(res.data.permissions));
      }

      setIsValid(true);
      // Trả về toàn bộ dữ liệu từ res.data để Login.jsx có thể sử dụng (ví dụ: permissions)
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
  }, []); // Chú ý: useEffect này chỉ chạy 1 lần khi component mount, không có dependency

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