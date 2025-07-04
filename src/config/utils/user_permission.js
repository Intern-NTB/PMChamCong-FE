// src/config/utils/user_permission.js

// ===== USER ROLE DEFINITIONS =====
// Định nghĩa các vai trò trong hệ thống (các giá trị này PHẢI khớp với mã vai trò từ backend của bạn)
export const USER_ROLES = {
  QUAN_LY_NHAN_SU: 1, // HR Manager
  QUAN_LY_NHAN_SU_PHU: 2, // HR Assistant
  ADMIN: 6, // Administrator (Đảm bảo giá trị này khớp với maVaiTro của tài khoản Admin trong DB của bạn)
};

// ===== USER DATA MANAGEMENT (Assumes 'taiKhoan' stores user object in localStorage) =====

// Lấy đối tượng người dùng hiện tại từ localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("taiKhoan"); // Key for stored user data
    return userStr ? JSON.parse(userStr) : {};
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return {};
  }
};

// Lấy mã vai trò của người dùng hiện tại
export const getCurrentUserRole = () => {
  const user = getCurrentUser();
  return user.maVaiTro || null; // 'maVaiTro' is the key holding the user's role code
};

// Lưu dữ liệu người dùng vào localStorage (useful after login)
export const setCurrentUser = (userData) => {
  try {
    localStorage.setItem("taiKhoan", JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data to localStorage:", error);
  }
};

// Xóa dữ liệu người dùng và token khỏi localStorage (useful on logout)
export const clearCurrentUser = () => {
  localStorage.removeItem("taiKhoan");
  localStorage.removeItem("token"); // Clear the token
  localStorage.removeItem("userPermissions"); // Clear user permissions as well
};

// ===== ROLE-SPECIFIC CHECKERS =====
// Functions to check if the current user has a specific role
export const isAdmin = () => {
  const role = getCurrentUserRole();
  // console.log('isAdmin check - Current User Role:', role, 'Is Admin?', role === USER_ROLES.ADMIN); // Thêm dòng này để debug
  return role === USER_ROLES.ADMIN;
};
export const isHRManager = () =>
  getCurrentUserRole() === USER_ROLES.QUAN_LY_NHAN_SU;
export const isHRAssistant = () =>
  getCurrentUserRole() === USER_ROLES.QUAN_LY_NHAN_SU_PHU;

// Helper to get role name from code (for display purposes)
export const getRoleName = (roleCode) => {
  const roleNames = {
    [USER_ROLES.ADMIN]: "Quản trị viên",
    [USER_ROLES.QUAN_LY_NHAN_SU]: "Quản lý nhân sự",
    [USER_ROLES.QUAN_LY_NHAN_SU_PHU]: "Quản lý nhân sự phụ",
  };
  return roleNames[roleCode] || "Không xác định";
};

// ===== NEW: MANAGE PERMISSIONS FROM BACKEND ARRAY =====

// Retrieves the array of specific permissions from localStorage
export const getUserPermissions = () => {
  try {
    const permissionsStr = localStorage.getItem("userPermissions");
    return permissionsStr ? JSON.parse(permissionsStr) : [];
  } catch (error) {
    console.error("Error parsing user permissions from localStorage:", error);
    return [];
  }
};

/**
 * Checks if the user has a specific permission key from the backend's permission array.
 * @param {string} permissionKey - The exact permission string to check (e.g., 'system:manage_users', 'department:create').
 * @returns {boolean} - True if the user's permissions array includes the key, false otherwise.
 */
export const checkPermissionByKey = (permissionKey) => {
  const permissions = getUserPermissions();
  return permissions.includes(permissionKey);
};

// ===== UPDATED: PERMISSIONS DEFINITION BY MODULE =====
// Cập nhật: Tất cả các hàm kiểm tra quyền sẽ check `isAdmin()` đầu tiên.
// Nếu là Admin, sẽ trả về true ngay lập tức, không cần kiểm tra quyền chi tiết.

// Example: Leave Request Permissions
export const NghiPhepPermissions = {
  canAdd: () => isAdmin() || checkPermissionByKey("nghiphep:create"),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("nghiphep:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("nghiphep:delete") || isHRManager(),
  canApprove: () =>
    isAdmin() || checkPermissionByKey("nghiphep:approve") || isHRManager(),
  // canView: () => isAdmin() || checkPermissionByKey('nghiphep:view') || isHRManager() || isHRAssistant(),
};

// Example: Permission Management Module
export const PhanQuyenPermissions = {
  // Only Admin can view this module, or a user explicitly granted 'phanquyen:view' permission
  canView: () => isAdmin() || checkPermissionByKey("phanquyen:view"),
  canAdd: () => isAdmin() || checkPermissionByKey("phanquyen:create"),
  canEdit: () => isAdmin() || checkPermissionByKey("phanquyen:edit"),
  canDelete: () => isAdmin() || checkPermissionByKey("phanquyen:delete"),
  canManageRoles: () =>
    isAdmin() || checkPermissionByKey("phanquyen:manage_roles"),
};

// Example: System Settings
export const HeThongPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("hethong:view") || isHRManager(),
  canEdit: () => isAdmin() || checkPermissionByKey("hethong:edit"),
};

// Example: Department Management
export const PhongBanPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("phongban:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("phongban:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("phongban:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("phongban:delete") || isHRManager(),
};

// Example: Account Management
export const TaiKhoanPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("taikhoan:view") || isHRManager(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("taikhoan:create") || isHRManager(),
  canEdit: () => isAdmin() || checkPermissionByKey("taikhoan:edit"),
  canDelete: () => isAdmin() || checkPermissionByKey("taikhoan:delete"),
  canResetPassword: () =>
    isAdmin() || checkPermissionByKey("taikhoan:reset_password"),
};

// Example: Shift Management
export const CaLamPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("calam:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("calam:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("calam:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("calam:delete") || isHRManager(),
};

// Example: Priority Object Management
export const DoiTuongUuTienPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("doituonguutien:view") || isHRManager(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("doituonguutien:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("doituonguutien:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("doituonguutien:delete") || isHRManager(),
};

// Example: Role Management
export const VaiTroPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("vaitro:view") || isHRManager(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("vaitro:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("vaitro:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("vaitro:delete") || isHRManager(),
};

// Example: Holiday Management
export const NgayLePermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("ngayle:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("ngayle:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("ngayle:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("ngayle:delete") || isHRManager(),
};

// Example: Bonus Management
export const ThuongPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("thuong:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("thuong:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("thuong:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("thuong:delete") || isHRManager(),
};

// Example: Penalty Management
export const PhatPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("phat:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("phat:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("phat:edit") || isHRManager(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("phat:delete") || isHRManager(),
};

// Example: Department History
export const LichSuPhongBanPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("lichsuphongban:view") || isHRManager(),
};

// Example: Salary History
export const LichSuLuongPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("lichsuluong:view") || isHRManager(),
};

// Example: Employee Management
export const NhanVienPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("nhanvien:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("nhanvien:create") || isHRManager(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("nhanvien:edit") || isHRManager(),
  canDelete: () => isAdmin() || checkPermissionByKey("nhanvien:delete"),
};

// Example: Timekeeping Management
export const ChamCongPermissions = {
  canView: () =>
    isAdmin() ||
    checkPermissionByKey("chamcong:view") ||
    isHRManager() ||
    isHRAssistant(),
  canAdd: () =>
    isAdmin() || checkPermissionByKey("chamcong:create") || isHRAssistant(),
  canEdit: () =>
    isAdmin() || checkPermissionByKey("chamcong:edit") || isHRAssistant(),
  canDelete: () =>
    isAdmin() || checkPermissionByKey("chamcong:delete") || isHRAssistant(),
};

// Example: Report Management
export const BaoCaoPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("baocao:view") || isHRManager(),
  canGenerate: () =>
    isAdmin() || checkPermissionByKey("baocao:generate") || isHRManager(),
};

// Example: Time Clock Device Management
export const MayChamCongPermissions = {
  canView: () =>
    isAdmin() || checkPermissionByKey("maychamcong:view") || isHRManager(),
  canAdd: () => isAdmin() || checkPermissionByKey("maychamcong:create"),
  canEdit: () => isAdmin() || checkPermissionByKey("maychamcong:edit"),
  canDelete: () => isAdmin() || checkPermissionByKey("maychamcong:delete"),
};

// ===== GENERIC PERMISSION CHECKER =====
/**
 * Checks user permission for a specific action within a module.
 * This function acts as an abstraction layer, calling the specific permission functions
 * defined for each module.
 * @param {string} moduleName - The module name (e.g., 'nghiPhep', 'phanQuyen').
 * This must match a key in `allModulePermissions`.
 * @param {string} action - The action (e.g., 'add', 'edit', 'delete', 'view').
 * This will be converted to 'canAction' (e.g., 'add' -> 'canAdd').
 * @returns {boolean} - True if the user has permission, false otherwise.
 */
export const hasPermission = (moduleName, action) => {
  // Luôn ưu tiên quyền Admin ở cấp cao nhất của `hasPermission`
  if (isAdmin()) {
    return true;
  }

  const allModulePermissions = {
    nghiPhep: NghiPhepPermissions,
    phanQuyen: PhanQuyenPermissions,
    heThong: HeThongPermissions,
    phongBan: PhongBanPermissions,
    taiKhoan: TaiKhoanPermissions,
    caLam: CaLamPermissions,
    doiTuongUuTien: DoiTuongUuTienPermissions,
    vaiTro: VaiTroPermissions,
    ngayLe: NgayLePermissions,
    thuong: ThuongPermissions,
    phat: PhatPermissions,
    lichSuPhongBan: LichSuPhongBanPermissions,
    lichSuLuong: LichSuLuongPermissions,
    nhanVien: NhanVienPermissions,
    chamCong: ChamCongPermissions,
    baoCao: BaoCaoPermissions,
    mayChamCong: MayChamCongPermissions,
    // ... Add other modules here
  };

  const modulePermissions = allModulePermissions[moduleName];

  if (!modulePermissions) {
    console.warn(
      `Permissions for module "${moduleName}" are not defined in user_permission.js.`
    );
    return false;
  }

  const actionMethodName = `can${
    action.charAt(0).toUpperCase() + action.slice(1)
  }`;

  if (typeof modulePermissions[actionMethodName] === "function") {
    return modulePermissions[actionMethodName]();
  } else {
    console.warn(
      `Action "${action}" not defined for module "${moduleName}" in user_permission.js.`
    );
    return false;
  }
};

// ===== PERMISSION MESSAGES =====
// Standardized messages for permission denied scenarios
export const PERMISSION_MESSAGES = {
  NO_ADD_PERMISSION: "Bạn không có quyền thêm mới.",
  NO_EDIT_PERMISSION: "Bạn không có quyền chỉnh sửa.",
  NO_DELETE_PERMISSION: "Bạn không có quyền xóa.",
  NO_APPROVE_PERMISSION: "Bạn không có quyền phê duyệt.",
  NO_VIEW_PERMISSION: "Bạn không có quyền xem dữ liệu này.",
  NO_GENERAL_PERMISSION: "Bạn không có quyền thực hiện hành động này.",
};

/**
 * Retrieves a specific permission denied message.
 * @param {string} action - The action (e.g., 'add', 'edit', 'delete', 'view', 'approve').
 * @returns {string} - The corresponding error message or a general message.
 */
export const getPermissionMessage = (action) => {
  const messages = {
    add: PERMISSION_MESSAGES.NO_ADD_PERMISSION,
    edit: PERMISSION_MESSAGES.NO_EDIT_PERMISSION,
    delete: PERMISSION_MESSAGES.NO_DELETE_PERMISSION,
    approve: PERMISSION_MESSAGES.NO_APPROVE_PERMISSION,
    view: PERMISSION_MESSAGES.NO_VIEW_PERMISSION,
  };
  return messages[action] || PERMISSION_MESSAGES.NO_GENERAL_PERMISSION;
};

// Export all relevant functions and constants
export default {
  USER_ROLES,
  getCurrentUser,
  getCurrentUserRole,
  setCurrentUser,
  clearCurrentUser,
  isAdmin,
  isHRManager,
  isHRAssistant,
  getRoleName,
  getUserPermissions,
  checkPermissionByKey,

  NghiPhepPermissions,
  PhanQuyenPermissions,
  HeThongPermissions,
  PhongBanPermissions,
  TaiKhoanPermissions,
  CaLamPermissions,
  DoiTuongUuTienPermissions,
  VaiTroPermissions,
  NgayLePermissions,
  ThuongPermissions,
  PhatPermissions,
  LichSuPhongBanPermissions,
  LichSuLuongPermissions,
  NhanVienPermissions,
  ChamCongPermissions,
  BaoCaoPermissions,
  MayChamCongPermissions,
  hasPermission,
  PERMISSION_MESSAGES,
  getPermissionMessage,
};
