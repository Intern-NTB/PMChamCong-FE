// src/routes/protectedRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import MyAlert from '../component/ui/alert';
import { getUserPermissions, isAdmin } from '../config/utils/user_permission';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const token = localStorage.getItem('token');
  const [showAlert, setShowAlert] = useState(false);

  // Reset alert mỗi khi route hoặc quyền thay đổi
  useEffect(() => {
    setShowAlert(false);
  }, [requiredPermission, window.location.pathname]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Lấy mảng quyền của user
  const permissions = getUserPermissions();

  // Nếu là admin hoặc có quyền toàn quyền thì luôn cho truy cập
  if (
    isAdmin() ||
    permissions.includes('system:is_admin') ||
    permissions.includes('system:full_access')
  ) {
    return children;
  }

  // Xử lý requiredPermission là string hoặc array
  let hasPermission = false;
  if (!requiredPermission) {
    hasPermission = true; // Nếu không truyền requiredPermission thì luôn cho truy cập
  } else if (Array.isArray(requiredPermission)) {
    hasPermission = requiredPermission.some((perm) => permissions.includes(perm));
  } else {
    hasPermission = permissions.includes(requiredPermission);
  }

  if (!hasPermission) {
    // Hiện alert và tự động tắt sau duration, sau đó không render gì nữa
    if (!showAlert) {
      setTimeout(() => setShowAlert(true), 2000);
    }
    return !showAlert ? (
      <MyAlert
        type="error"
        message="Không có quyền truy cập"
        description="Bạn không có quyền truy cập vào trang này."
        onClose={() => setShowAlert(true)}
        duration={1500}
      />
    ) : null;
  }

  return children;
};

export default ProtectedRoute;