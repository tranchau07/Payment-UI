import { useState } from 'react';
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
import ClientDetails from './features/client-details/ClientDetails';
import MerchantList from './features/merchant-list/MerchantList';
import MerchantRegistration from './features/merchant-registration/MerchantRegistration';
import AcquiringContractFlow from './features/acquiring-contract/AcquiringContractFlow';
import CreateDeviceForm from './features/acquiring-contract/CreateDeviceForm';
import ProductTree from './features/product-tree/ProductTree';
import TransactionJournal from './features/transaction-journal/TransactionJournal';
import ContractCashFlow from './features/contract-cash-flow/ContractCashFlow';

// Core Dashboard Component (Protected)
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState('list'); // 'list', 'register', 'contract', 'merchant-list', 'merchant-register', 'details', 'create-device'
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [backView, setBackView] = useState('list');
  const [selectedContractNumber, setSelectedContractNumber] = useState('');
  const [selectedParentProductCode, setSelectedParentProductCode] = useState('');
  
  const handleCreateContract = (clientId) => {
    setSelectedClientId(clientId);
    setView('contract');
  };

  const handleCreateAcquiringContract = (merchantId) => {
    setSelectedClientId(merchantId);
    setBackView('merchant-list');
    setView('acquiring-contract');
  };

  const handleViewDetails = (clientId, defaultBackView) => {
    setSelectedClientId(clientId);
    setBackView(defaultBackView);
    setView('details');
  };

  const handleCreateDevice = (contractNumber, parentProductCode) => {
    setSelectedContractNumber(contractNumber);
    setSelectedParentProductCode(parentProductCode);
    setView('create-device');
  };
  
  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h3 className="system-name">CỔNG THANH TOÁN</h3>
          <span className="security-status-pill">● KẾT NỐI AN TOÀN</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-group">
            <div className="sidebar-group-title">PHÁT HÀNH</div>
            <button
              className={`sidebar-link ${view === 'list' || (view === 'details' && backView === 'list') ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              Danh sách khách hàng
            </button>
            <button
              className={`sidebar-link ${view === 'register' ? 'active' : ''}`}
              onClick={() => setView('register')}
            >
              Đăng ký mới
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">CHẤP NHẬN THANH TOÁN</div>
            <button
              className={`sidebar-link ${view === 'merchant-list' || (view === 'details' && backView === 'merchant-list') ? 'active' : ''}`}
              onClick={() => setView('merchant-list')}
            >
              Danh sách Merchant
            </button>
            <button
              className={`sidebar-link ${view === 'merchant-register' ? 'active' : ''}`}
              onClick={() => setView('merchant-register')}
            >
              Đăng ký Merchant
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">DANH MỤC</div>
            <button
              className={`sidebar-link ${view === 'product-tree' ? 'active' : ''}`}
              onClick={() => setView('product-tree')}
            >
              Cây sản phẩm
            </button>
            <button
              className={`sidebar-link ${view === 'docs' ? 'active' : ''}`}
              onClick={() => setView('docs')}
            >
              Nhật ký giao dịch
            </button>
            <button
              className={`sidebar-link ${view === 'cash-flow' ? 'active' : ''}`}
              onClick={() => setView('cash-flow')}
            >
              Dòng tiền hợp đồng
            </button>
          </div>

          {(view === 'contract' || view === 'acquiring-contract' || view === 'details' || view === 'create-device') && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">THAO TÁC</div>
              {view === 'contract' && (
                <button className="sidebar-link active">
                  Mở Hợp đồng
                </button>
              )}
              {view === 'acquiring-contract' && (
                <button className="sidebar-link active">
                  Mở hợp đồng Acquiring
                </button>
              )}
              {view === 'create-device' && (
                <button className="sidebar-link active">
                  Khai báo Device
                </button>
              )}
              {view === 'details' && (
                <button className="sidebar-link active">
                  Chi tiết khách hàng
                </button>
              )}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar-circle">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="user-meta">
            <span className="user-username" title={user?.username}>{user?.username}</span>
            <div className="user-roles">
              {user?.roles?.map(role => (
                <span key={role} className="user-role-text">
                  {role}
                </span>
              ))}
            </div>
          </div>
          <button className="btn-logout-icon" onClick={logout} title="Đăng xuất khỏi hệ thống">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      <div className="dashboard-content">
        <main style={{ padding: 0, maxWidth: 'none', margin: 0 }}>
          {view === 'list' && (
            <ClientList 
              onCreateContract={handleCreateContract} 
              onViewDetails={(clientId) => handleViewDetails(clientId, 'list')}
              onAddClient={() => setView('register')}
            />
          )}
          {view === 'register' && (
            <ClientRegistration onComplete={(cId) => {
              if (cId) {
                handleViewDetails(cId, 'list');
              } else {
                setView('list');
              }
            }} />
          )}
          {view === 'merchant-list' && (
            <MerchantList 
              onCreateContract={handleCreateAcquiringContract} 
              onViewDetails={(clientId) => handleViewDetails(clientId, 'merchant-list')}
              onAddMerchant={() => setView('merchant-register')}
            />
          )}
          {view === 'merchant-register' && (
            <MerchantRegistration onComplete={(cId) => {
              if (cId) {
                handleViewDetails(cId, 'merchant-list');
              } else {
                setView('merchant-list');
              }
            }} />
          )}
          {view === 'contract' && (
            <ContractCreation 
              clientId={selectedClientId} 
              onComplete={() => handleViewDetails(selectedClientId, 'list')} 
            />
          )}
          {view === 'acquiring-contract' && (
            <AcquiringContractFlow
              key={selectedClientId}
              merchantId={selectedClientId}
              onComplete={(contractNo, prodCode) => {
                if (contractNo && prodCode) {
                  handleCreateDevice(contractNo, prodCode);
                } else {
                  handleViewDetails(selectedClientId, 'merchant-list');
                }
              }}
            />
          )}
          {view === 'details' && (
            <ClientDetails 
              clientId={selectedClientId} 
              isMerchant={backView === 'merchant-list'}
              onBack={() => setView(backView)} 
              onCreateDevice={handleCreateDevice}
              onCreateContract={handleCreateAcquiringContract}
            />
          )}
          {view === 'create-device' && (
            <CreateDeviceForm
              contractNumber={selectedContractNumber}
              parentProductCode={selectedParentProductCode}
              onComplete={() => handleViewDetails(selectedClientId, backView)}
              onBack={() => handleViewDetails(selectedClientId, backView)}
            />
          )}
          {view === 'product-tree' && (
            <ProductTree />
          )}
          {view === 'docs' && (
            <TransactionJournal />
          )}
          {view === 'cash-flow' && (
            <ContractCashFlow />
          )}
        </main>
      </div>
    </div>
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
