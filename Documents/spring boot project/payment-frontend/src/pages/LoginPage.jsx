import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Icon = ({ name }) => {
  const paths = {
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" /></>,
    lock: <><rect width="14" height="10" x="5" y="11" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    mail: <><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-10 6L2 7" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff: <><path d="m3 3 18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.24A9.15 9.15 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-2 3.12M6.6 6.6C3.7 8.55 2 12 2 12s3.5 8 10 8a9.5 9.5 0 0 0 4.1-.9" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
    alert: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
    check: <><circle cx="12" cy="12" r="10" /><path d="m8 12 2.5 2.5L16 9" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  };

  return (
    <svg className={`login-icon login-icon-${name}`} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

export const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRoles, setRegRoles] = useState(['TELLER']);
  const from = location.state?.from?.pathname || '/';

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setLocalError('');
    setSuccessMessage('');
    setShowPassword(false);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
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
    } catch (error) {
      setLocalError(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    if (!regUsername.trim() || !regPassword.trim()) {
      setLocalError('Vui lòng nhập tên đăng nhập và mật khẩu đăng ký.');
      return;
    }

    setLoading(true);
    setLocalError('');
    setSuccessMessage('');
    try {
      await register(regUsername, regPassword, regEmail, regPhone, regRoles);
      setSuccessMessage('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.');
      setMode('login');
      setUsername(regUsername);
      setPassword('');
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
      setRegPhone('');
      setRegRoles(['TELLER']);
    } catch (error) {
      setLocalError(error.message || 'Đăng ký tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleName) => {
    if (regRoles.includes(roleName)) {
      if (regRoles.length > 1) setRegRoles(regRoles.filter((role) => role !== roleName));
    } else {
      setRegRoles([...regRoles, roleName]);
    }
  };

  const passwordField = (id, value, onChange, autoComplete) => (
    <div className="input-sec-wrapper">
      <span className="input-icon"><Icon name="lock" /></span>
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder="Nhập mật khẩu"
        value={value}
        onChange={onChange}
        disabled={loading}
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((visible) => !visible)}
        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        disabled={loading}
      >
        <Icon name={showPassword ? 'eyeOff' : 'eye'} />
      </button>
    </div>
  );

  return (
    <main className="login-page-container">
      <section className={`login-card ${mode === 'register' ? 'login-card-register' : ''}`}>
        <div className="login-form-panel">
          <div className="login-simple-brand">
            <span className="login-brand-mark"><Icon name="shield" /></span>
            <span>SecurePay</span>
          </div>

          <header className="login-heading">
            <h2>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>
          </header>

          {localError && (
            <div className="login-alert login-alert-error" role="alert">
              <Icon name="alert" /><span>{localError}</span>
            </div>
          )}
          {successMessage && (
            <div className="login-alert login-alert-success" role="status">
              <Icon name="check" /><span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group-sec">
                <label htmlFor="username">Tên đăng nhập</label>
                <div className="input-sec-wrapper">
                  <span className="input-icon"><Icon name="user" /></span>
                  <input id="username" type="text" placeholder="Nhập tên đăng nhập" value={username} onChange={(event) => setUsername(event.target.value)} disabled={loading} autoComplete="username" autoFocus required />
                </div>
              </div>
              <div className="form-group-sec">
                <label htmlFor="password">Mật khẩu</label>
                {passwordField('password', password, (event) => setPassword(event.target.value), 'current-password')}
              </div>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : <><span>Đăng nhập</span><Icon name="arrow" /></>}
              </button>
              <p className="login-switch">Chưa có tài khoản? <button type="button" onClick={() => switchMode('register')} disabled={loading}>Đăng ký</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="login-form login-register-form">
              <div className="register-fields">
                <div className="form-group-sec">
                  <label htmlFor="regUsername">Tên đăng nhập <span>*</span></label>
                  <div className="input-sec-wrapper"><span className="input-icon"><Icon name="user" /></span><input id="regUsername" type="text" placeholder="Tên đăng nhập" value={regUsername} onChange={(event) => setRegUsername(event.target.value)} disabled={loading} autoComplete="username" required /></div>
                </div>
                <div className="form-group-sec">
                  <label htmlFor="regPassword">Mật khẩu <span>*</span></label>
                  {passwordField('regPassword', regPassword, (event) => setRegPassword(event.target.value), 'new-password')}
                </div>
                <div className="form-group-sec">
                  <label htmlFor="regEmail">Email</label>
                  <div className="input-sec-wrapper"><span className="input-icon"><Icon name="mail" /></span><input id="regEmail" type="email" placeholder="name@company.com" value={regEmail} onChange={(event) => setRegEmail(event.target.value)} disabled={loading} autoComplete="email" /></div>
                </div>
                <div className="form-group-sec">
                  <label htmlFor="regPhone">Số điện thoại</label>
                  <div className="input-sec-wrapper"><span className="input-icon"><Icon name="phone" /></span><input id="regPhone" type="tel" placeholder="Số điện thoại" value={regPhone} onChange={(event) => setRegPhone(event.target.value)} disabled={loading} autoComplete="tel" /></div>
                </div>
              </div>
              <fieldset className="role-selector">
                <legend>Vai trò hệ thống</legend>
                <div>
                  {['TELLER', 'SUPERVISOR', 'ADMIN'].map((role) => (
                    <label key={role} className={regRoles.includes(role) ? 'selected' : ''}>
                      <input type="checkbox" checked={regRoles.includes(role)} onChange={() => handleRoleChange(role)} disabled={loading} />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="btn-spinner" /> : <><span>Tạo tài khoản</span><Icon name="arrow" /></>}
              </button>
              <p className="login-switch">Đã có tài khoản? <button type="button" onClick={() => switchMode('login')} disabled={loading}>Quay lại đăng nhập</button></p>
            </form>
          )}

          <p className="login-compliance"><Icon name="lock" /> Bảo mật theo tiêu chuẩn PCI DSS</p>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
