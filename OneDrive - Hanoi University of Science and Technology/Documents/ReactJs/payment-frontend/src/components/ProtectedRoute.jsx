import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="security-loading-screen">
        <div className="security-loading-spinner"></div>
        <p className="security-loading-text">Đang xác thực bảo mật hệ thống...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = user.roles && user.roles.some(role => allowedRoles.includes(role));
    if (!hasRequiredRole) {
      return (
        <div className="access-denied-container">
          <div className="access-denied-card">
            <div className="access-denied-icon">⚠️</div>
            <h2>Truy Cập Bị Từ Chối</h2>
            <p>Tài khoản của bạn ({user.username}) không có quyền truy cập chức năng này.</p>
            <p className="sub-text">Cần một trong các quyền: {allowedRoles.join(', ')}</p>
            <button className="btn-primary" onClick={() => window.location.href = '/'}>
              Quay lại Trang Chủ
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
