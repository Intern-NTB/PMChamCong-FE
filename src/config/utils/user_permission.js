// ===== USER PERMISSION UTILITIES =====
// File: src/utils/userPermissions.js

// Danh sách các vai trò trong hệ thống
export const USER_ROLES = {
  QUAN_LY_NHAN_SU: 1,          // Quản lý nhân sự
  QUAN_LY_NHAN_SU_PHU: 2,      // Quản lý nhân sự phụ  
  ADMIN: 6                     // Admin
};

// Lấy thông tin user hiện tại từ localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('taiKhoan');
    return userStr ? JSON.parse(userStr) : {};
  } catch (error) {
    console.error('Error parsing user data:', error);
    return {};
  }
};





// Lấy vai trò của user hiện tại
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user.maVaiTro || null;
};

// Lưu thông tin user vào localStorage
export const setCurrentUser = (userData) => {
  try {
    localStorage.setItem('currentUser', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// Xóa thông tin user khỏi localStorage
export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

// Kiểm tra user có phải là admin không
export const isAdmin = () => getCurrentUserRole() === USER_ROLES.ADMIN;

// Kiểm tra user có phải là quản lý nhân sự không
export const isHRManager = () => getCurrentUserRole() === USER_ROLES.QUAN_LY_NHAN_SU;

// Kiểm tra user có phải là quản lý nhân sự phụ không
export const isHRAssistant = () => getCurrentUserRole() === USER_ROLES.QUAN_LY_NHAN_SU_PHU;

// Lấy tên vai trò từ mã vai trò
export const getRoleName = (roleCode) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: 'Quản trị viên',
    [USER_ROLES.QUAN_LY_NHAN_SU]: 'Quản lý nhân sự',
    [USER_ROLES.QUAN_LY_NHAN_SU_PHU]: 'Quản lý nhân sự phụ',
  };
  return roleNames[roleCode] || 'Không xác định';
};

// ===== PERMISSIONS FOR NGHI PHEP MODULE =====

export const NghiPhepPermissions = {
  canOnlyApprove: () => isHRManager(), // Chỉ Quản lý nhân sự mới có quyền phê duyệt
  canOnlyAdd: () => isHRAssistant(),   // Quản lý nhân sự phụ mới có quyền thêm mới
  canEditStatus: () => isAdmin() || isHRManager(), // Admin hoặc Quản lý nhân sự mới có quyền chỉnh sửa
  canApprove: () => isHRManager() || isAdmin(),   // Admin hoặc Quản lý nhân sự mới có quyền phê duyệt
  canDelete: () => isAdmin() || isHRManager(),    // Admin hoặc Quản lý nhân sự mới có quyền xóa
  canView: () => true, // Tất cả đều có quyền xem
};

// ===== GENERIC PERMISSION CHECKER =====

export const hasPermission = (module, action) => {
  const permissions = {
    nghiPhep: NghiPhepPermissions,
    // Các module khác có thể được thêm vào đây
  };

  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  const actionMethod = `can${action.charAt(0).toUpperCase() + action.slice(1)}`;
  return modulePermissions[actionMethod] ? modulePermissions[actionMethod]() : false;
};

// ===== PERMISSION MESSAGES =====

export const PERMISSION_MESSAGES = {
  NO_ADD_PERMISSION: 'Bạn không có quyền thêm mới',
  NO_EDIT_PERMISSION: 'Bạn không có quyền chỉnh sửa',
  NO_DELETE_PERMISSION: 'Bạn không có quyền xóa',
  NO_APPROVE_PERMISSION: 'Bạn không có quyền phê duyệt',
};

// Lấy thông báo lỗi phân quyền
export const getPermissionMessage = (action) => {
  const messages = {
    add: PERMISSION_MESSAGES.NO_ADD_PERMISSION,
    edit: PERMISSION_MESSAGES.NO_EDIT_PERMISSION,
    delete: PERMISSION_MESSAGES.NO_DELETE_PERMISSION,
    approve: PERMISSION_MESSAGES.NO_APPROVE_PERMISSION,
  };
  return messages[action] || 'Bạn không có quyền thực hiện hành động này';
};

export default {
  getCurrentUser,
  getCurrentUserRole,
  setCurrentUser,
  clearCurrentUser,
  isAdmin,
  isHRManager,
  isHRAssistant,
  getRoleName,
  NghiPhepPermissions,
  hasPermission,
  getPermissionMessage,
  USER_ROLES,
  PERMISSION_MESSAGES,
};
