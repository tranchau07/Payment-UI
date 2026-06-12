import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Registration States
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRoles, setRegRoles] = useState(['TELLER']); // Default role

  // Redirect path after success
  const from = location.state?.from?.pathname || '/';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setLocalError('');
    setSuccessMessage('');
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword.trim()) {
      setLocalError('Vui lòng nhập tên đăng nhập và mật khẩu đăng ký.');
      return;
    }

    setLoading(true);
    setLocalError('');
    setSuccessMessage('');
    try {
      await register(regUsername, regPassword, regEmail, regPhone, regRoles);
      setSuccessMessage('Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.');
      setMode('login');
      setUsername(regUsername); // Auto fill username in login form
      setPassword('');
      // Reset registration form
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
      setRegPhone('');
      setRegRoles(['TELLER']);
    } catch (err) {
      setLocalError(err.message || 'Đăng ký tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleName) => {
    if (regRoles.includes(roleName)) {
      // Keep at least one role
      if (regRoles.length > 1) {
        setRegRoles(regRoles.filter(r => r !== roleName));
      }
    } else {
      setRegRoles([...regRoles, roleName]);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-glass-card">
        {/* Header decoration */}
        <div className="card-top-glow"></div>

        {/* Branding Logo */}
        <div className="login-logo-container">
          <div className="login-shield-icon">🛡️</div>
          <h1 className="login-title">SECURE GATEWAY</h1>
          <p className="login-subtitle">Hệ Thống Quản Lý Thanh Toán & Xác Thực MySQL</p>
        </div>

        {localError && (
          <div className="login-error-alert">
            <span className="error-icon">❌</span>
            <span className="error-message">{localError}</span>
          </div>
        )}

        {successMessage && (
          <div className="login-error-alert" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <span className="error-icon">✅</span>
            <span className="error-message" style={{ color: '#10B981' }}>{successMessage}</span>
          </div>
        )}

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group-sec">
              <label htmlFor="username">Tên Đăng Nhập</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  placeholder="Nhập username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="form-group-sec">
              <label htmlFor="password">Mật Khẩu</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn btn-primary" disabled={loading}>
              {loading ? <div className="btn-spinner"></div> : 'Đăng Nhập'}
            </button>

            <div className="login-footer-links">
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  setMode('register');
                  setLocalError('');
                  setSuccessMessage('');
                }}
                disabled={loading}
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </form>
        )}

        {/* Mode: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="login-form">
            <div className="form-group-sec">
              <label htmlFor="regUsername">Tên Đăng Nhập *</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">👤</span>
                <input
                  id="regUsername"
                  type="text"
                  placeholder="Username đăng ký..."
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group-sec">
              <label htmlFor="regPassword">Mật Khẩu *</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="regPassword"
                  type="password"
                  placeholder="Mật khẩu đăng ký..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group-sec">
              <label htmlFor="regEmail">Email</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="regEmail"
                  type="email"
                  placeholder="Email liên hệ..."
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-sec">
              <label htmlFor="regPhone">Số Điện Thoại</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">📞</span>
                <input
                  id="regPhone"
                  type="text"
                  placeholder="Số điện thoại..."
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group-sec">
              <label>Vai Trò Hệ Thống (Roles)</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '5px', padding: '5px 0' }}>
                {['TELLER', 'SUPERVISOR', 'ADMIN'].map(role => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem', color: '#ccc' }}>
                    <input
                      type="checkbox"
                      checked={regRoles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                      disabled={loading}
                      style={{ cursor: 'pointer' }}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="login-btn btn-success" disabled={loading}>
              {loading ? <div className="btn-spinner"></div> : 'Tạo Tài Khoản'}
            </button>

            <div className="login-footer-links">
              <button
                type="button"
                className="btn-link secondary"
                onClick={() => {
                  setMode('login');
                  setLocalError('');
                  setSuccessMessage('');
                }}
                disabled={loading}
              >
                Đã có tài khoản? Quay lại đăng nhập
              </button>
            </div>
          </form>
        )}

        <div className="compliance-banner">
          🔒 Kết nối được mã hóa đạt chuẩn PCI-DSS & OWASP Banking Grade
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
