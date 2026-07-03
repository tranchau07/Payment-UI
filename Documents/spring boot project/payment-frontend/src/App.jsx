import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Context & Security
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import useAuth from './hooks/useAuth';
import useI18n from './hooks/useI18n';
import ProtectedRoute from './components/ProtectedRoute';
import LanguageSwitcher from './components/LanguageSwitcher';

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
import ProductDetail from './features/product-detail/ProductDetail';
import ContractDetail from './features/contract-detail/ContractDetail';
import AccountDetail from './features/account-detail/AccountDetail';
import TransactionSearch from './features/transaction-search/TransactionSearch';
import TransactionDetail from './features/transaction-detail/TransactionDetail';
import ContractCashFlow from './features/contract-cash-flow/ContractCashFlow';
import './styles/design-system.css';

// Core Dashboard Component (Protected)
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const [legacyView, setLegacyView] = useState('list');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [backView, setBackView] = useState('list');
  const [selectedContractNumber, setSelectedContractNumber] = useState('');
  const [selectedParentProductCode, setSelectedParentProductCode] = useState('');
  const clientRouteMatch = location.pathname.match(/^\/clients\/(\d+)$/);
  const merchantRouteMatch = location.pathname.match(/^\/merchants\/(\d+)$/);
  const transactionRouteMatch = location.pathname.match(/^\/transactions\/(\d+)$/);
  const productRouteMatch = location.pathname.match(/^\/products\/([^/]+)$/);
  const contractRouteMatch = location.pathname.match(/^\/contracts\/(\d+)$/);
  const accountRouteMatch = location.pathname.match(/^\/accounts\/(\d+)$/);
  const routeView = transactionRouteMatch ? 'transaction-detail'
    : location.pathname === '/transactions' ? 'docs'
      : clientRouteMatch ? 'details'
        : merchantRouteMatch ? 'details'
        : location.pathname === '/clients/new' ? 'register'
        : location.pathname === '/clients' ? 'list'
          : location.pathname === '/merchants/new' ? 'merchant-register'
          : location.pathname === '/merchants' ? 'merchant-list'
          : contractRouteMatch ? 'contract-detail'
            : accountRouteMatch ? 'account-detail'
              : productRouteMatch ? 'product-detail'
            : location.pathname === '/products' ? 'product-tree'
            : location.pathname === '/cash-flow' ? 'cash-flow'
            : null;
  const view = routeView || legacyView;
  const activeClientId = clientRouteMatch
    ? Number(clientRouteMatch[1])
    : merchantRouteMatch
      ? Number(merchantRouteMatch[1])
      : selectedClientId;
  const effectiveBackView = merchantRouteMatch ? 'merchant-list' : backView;
  const setView = (nextView) => {
    const routes = {
      list: '/clients',
      register: '/clients/new',
      'merchant-list': '/merchants',
      'merchant-register': '/merchants/new',
      docs: '/transactions',
      'product-tree': '/products',
      'cash-flow': '/cash-flow'
    };
    if (routes[nextView]) navigate(routes[nextView]);
    else {
      setLegacyView(nextView);
      navigate('/');
    }
  };
  
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
    navigate(defaultBackView === 'merchant-list' ? `/merchants/${clientId}` : `/clients/${clientId}`);
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
          <h3 className="system-name">{t('app.name')}</h3>
          <span className="security-status-pill"><span aria-hidden="true">●</span> {t('app.connectionSecure')}</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('nav.issuing')}</div>
            <button
              className={`sidebar-link ${view === 'list' || (view === 'details' && effectiveBackView === 'list') ? 'active' : ''}`}
              onClick={() => setView('list')}
            >
              {t('nav.customers')}
            </button>
            <button
              className={`sidebar-link ${view === 'register' ? 'active' : ''}`}
              onClick={() => setView('register')}
            >
              {t('nav.newCustomer')}
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('nav.acquiring')}</div>
            <button
              className={`sidebar-link ${view === 'merchant-list' || (view === 'details' && effectiveBackView === 'merchant-list') ? 'active' : ''}`}
              onClick={() => setView('merchant-list')}
            >
              {t('nav.merchants')}
            </button>
            <button
              className={`sidebar-link ${view === 'merchant-register' ? 'active' : ''}`}
              onClick={() => setView('merchant-register')}
            >
              {t('nav.newMerchant')}
            </button>
          </div>

          <div className="sidebar-group">
            <div className="sidebar-group-title">{t('nav.catalog')}</div>
            <button
              className={`sidebar-link ${view === 'product-tree' || view === 'product-detail' ? 'active' : ''}`}
              onClick={() => setView('product-tree')}
            >
              {t('nav.products')}
            </button>
            <button
              className={`sidebar-link ${view === 'docs' || view === 'transaction-detail' ? 'active' : ''}`}
              onClick={() => setView('docs')}
            >
              {t('nav.transactions')}
            </button>
            <button
              className={`sidebar-link ${view === 'cash-flow' ? 'active' : ''}`}
              onClick={() => setView('cash-flow')}
            >
              {t('nav.cashFlow')}
            </button>
          </div>

          {(view === 'contract' || view === 'acquiring-contract' || view === 'details' || view === 'create-device') && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">{t('nav.actions')}</div>
              {view === 'contract' && (
                <button className="sidebar-link active">
                  {t('nav.openContract')}
                </button>
              )}
              {view === 'acquiring-contract' && (
                <button className="sidebar-link active">
                  {t('nav.openAcquiringContract')}
                </button>
              )}
              {view === 'create-device' && (
                <button className="sidebar-link active">
                  {t('nav.registerDevice')}
                </button>
              )}
              {view === 'details' && (
                <button className="sidebar-link active">
                  {t('nav.customerDetail')}
                </button>
              )}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <LanguageSwitcher compact />
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
          <button className="btn-logout-icon" onClick={logout} title={t('app.logout')} aria-label={t('app.logout')}>
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
              clientId={activeClientId} 
              isMerchant={effectiveBackView === 'merchant-list'}
              onBack={() => setView(effectiveBackView)} 
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
          {view === 'product-detail' && (
            <ProductDetail />
          )}
          {view === 'contract-detail' && (
            <ContractDetail />
          )}
          {view === 'account-detail' && (
            <AccountDetail />
          )}
          {view === 'docs' && (
            <TransactionSearch />
          )}
          {view === 'transaction-detail' && (
            <TransactionDetail />
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
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Main App Route */}
          <Route
            path="/*"
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
    </I18nProvider>
  );
}

export default App;
