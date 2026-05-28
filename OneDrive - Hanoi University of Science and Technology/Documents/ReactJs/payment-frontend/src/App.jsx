import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context & Security
import { AuthProvider } from './contexts/AuthContext';
import useAuth from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';

// Pages & Components
import LoginPage from './pages/LoginPage';
import ClientRegistration from './features/client-registration/ClientRegistration';
import ClientList from './features/client-list/ClientList';
import ContractCreation from './features/contract-creation/ContractCreation';

// Core Dashboard Component (Protected)
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'register', 'contract'
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  const handleCreateContract = (clientId) => {
    setSelectedClientId(clientId);
    setView('contract');
  };
  
  return (
    <>
      <header className="secure-dashboard-header">
        <div className="header-brand">
          <span className="brand-icon">🏛️</span>
          <div className="brand-text">
            <h3 className="system-name">WAY4 GATEWAY</h3>
            <span className="security-status-pill">● SECURED BANKING CHANNEL</span>
          </div>
        </div>

        <div className="user-profile-badge">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="user-username">{user?.username}</span>
            <div className="user-roles">
              {user?.roles?.map(role => (
                <span key={role} className={`role-badge role-${role.toLowerCase()}`}>
                  {role}
                </span>
              ))}
            </div>
          </div>
          <button className="btn-logout" onClick={logout} title="Đăng xuất khỏi hệ thống">
            Đăng Xuất
          </button>
        </div>
      </header>

      <nav className="navbar">
        <button
          className={`nav-button ${view === 'list' ? 'active' : ''}`}
          onClick={() => setView('list')}
        >
          Danh sách khách hàng
        </button>
        <button
          className={`nav-button ${view === 'register' ? 'active' : ''}`}
          onClick={() => setView('register')}
        >
          Đăng ký mới
        </button>
        {view === 'contract' && (
          <button className="nav-button active">
            Mở Hợp đồng
          </button>
        )}
      </nav>

      <main>
        {view === 'list' && <ClientList onCreateContract={handleCreateContract} />}
        {view === 'register' && (
          <ClientRegistration onComplete={() => setView('list')} />
        )}
        {view === 'contract' && (
          <ContractCreation 
            clientId={selectedClientId} 
            onComplete={() => setView('list')} 
          />
        )}
      </main>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
};

// Main App Component with Router
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main App Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['TELLER', 'SUPERVISOR', 'ADMIN']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
