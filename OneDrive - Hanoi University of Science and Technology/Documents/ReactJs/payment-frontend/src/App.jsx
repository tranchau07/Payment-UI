import { useState } from 'react'
import './App.css'
import ClientRegistration from './features/client-registration/ClientRegistration'
import ClientList from './features/client-list/ClientList'
import ContractCreation from './features/contract-creation/ContractCreation'

function App() {
  const [view, setView] = useState('list'); // 'list', 'register', 'contract'
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  const handleCreateContract = (clientId) => {
    setSelectedClientId(clientId);
    setView('contract');
  };
  
  return (
    <>
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
  )
}

export default App

