import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const LoginPage = () => {
  const { login, getTotpSetup, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Local states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials', 'totp', 'setup'
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  // Setup TOTP info
  const [totpSetupInfo, setTotpSetupInfo] = useState(null);

  // Redirect path after success
  const from = location.state?.from?.pathname || '/';

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLocalError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      const result = await login(username, password);
      if (result.totpRequired) {
        setStep('totp');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleTotpSubmit = async (e) => {
    e.preventDefault();
    if (!totpCode.trim()) {
      setLocalError('Vui lòng nhập mã xác thực Google Authenticator.');
      return;
    }

    setLoading(true);
    setLocalError('');
    try {
      await login(username, password, totpCode);
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Mã xác thực không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSetup = async () => {
    setLoading(true);
    setLocalError('');
    try {
      const info = await getTotpSetup(username || 'teller01');
      setTotpSetupInfo(info);
      setStep('setup');
    } catch (err) {
      setLocalError(err.message || 'Không thể thiết lập TOTP lúc này');
    } finally {
      setLoading(false);
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
          <p className="login-subtitle">Hệ Thống Quản Lý Thanh Toán Nội Bộ Ngân Hàng</p>
        </div>

        {localError && (
          <div className="login-error-alert">
            <span className="error-icon">❌</span>
            <span className="error-message">{localError}</span>
          </div>
        )}

        {/* Step 1: Credentials */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="login-form">
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
              <label htmlFor="password">Mật Khẩu Hệ Thống</label>
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
              {loading ? (
                <div className="btn-spinner"></div>
              ) : (
                'Tiếp Tục Đăng Nhập'
              )}
            </button>

            <div className="login-footer-links">
              <span className="info-badge">Dev accounts: teller01 / teller123</span>
            </div>
          </form>
        )}

        {/* Step 2: TOTP Verification */}
        {step === 'totp' && (
          <form onSubmit={handleTotpSubmit} className="login-form">
            <div className="totp-badge">
              <span className="totp-icon">📱</span>
              <p>MFA: Yêu Cầu Xác Thực 2 Lớp</p>
            </div>
            
            <p className="totp-instruction">
              Vui lòng nhập mã gồm 6 chữ số từ ứng dụng <strong>Google Authenticator</strong> hoặc Microsoft Authenticator của bạn.
            </p>

            <div className="form-group-sec">
              <label htmlFor="totpCode">Mã Xác Thực (OTP)</label>
              <div className="input-sec-wrapper">
                <span className="input-icon">🔢</span>
                <input
                  id="totpCode"
                  type="text"
                  maxLength="6"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="VD: 123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  disabled={loading}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="login-btn btn-success" disabled={loading}>
              {loading ? <div className="btn-spinner"></div> : 'Xác Minh & Kết Nối'}
            </button>

            <div className="totp-options">
              <button 
                type="button" 
                className="btn-link" 
                onClick={handleRequestSetup}
                disabled={loading}
              >
                Chưa thiết lập Authenticator?
              </button>
              <button 
                type="button" 
                className="btn-link secondary" 
                onClick={() => setStep('credentials')}
                disabled={loading}
              >
                Quay lại
              </button>
            </div>
          </form>
        )}

        {/* Step 3: TOTP Setup / QR Code */}
        {step === 'setup' && totpSetupInfo && (
          <div className="totp-setup-container">
            <h2 className="setup-title">Thiết Lập Google Authenticator</h2>
            <p className="setup-instruction">
              1. Mở ứng dụng Google Authenticator trên điện thoại.<br />
              2. Chọn quét mã QR hoặc nhập khóa thủ công.<br />
              3. Quét mã QR dưới đây hoặc nhập khóa bí mật:
            </p>

            <div className="qr-code-wrapper">
              <img 
                src={`data:image/png;base64,${totpSetupInfo.qrCodeBase64}`} 
                alt="TOTP QR Code"
                className="qr-code-image"
              />
            </div>

            <div className="secret-key-box">
              <p className="secret-label">Khóa Bí Mật:</p>
              <code className="secret-value">{totpSetupInfo.secret}</code>
            </div>

            <p className="setup-note">
              Sau khi quét thành công, ứng dụng sẽ tạo mã 6 chữ số liên tục thay đổi. Hãy chọn tiếp tục để điền mã kiểm tra.
            </p>

            <button 
              type="button" 
              className="login-btn btn-primary"
              onClick={() => setStep('totp')}
            >
              Tôi Đã Quét Xong, Tiếp Tục
            </button>
          </div>
        )}
        
        <div className="compliance-banner">
          🔒 Kết nối được mã hóa đạt chuẩn PCI-DSS & OWASP Banking Grade
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
