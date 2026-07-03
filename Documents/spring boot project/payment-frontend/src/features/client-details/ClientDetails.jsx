import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { clientService } from '../../services/clientApi';
import TransactionHistory from './TransactionHistory';
import DetailTabs from '../../components/common/DetailTabs';
import TechnicalDetailsPanel from '../../components/common/TechnicalDetailsPanel';
import useAuth from '../../hooks/useAuth';
import useI18n from '../../hooks/useI18n';

const formatGender = (gender) => {
  if (gender === 'M') return 'Nam';
  if (gender === 'F') return 'Nữ';
  return 'Khác';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  if (dateString.includes('T')) {
    dateString = dateString.split('T')[0];
  }
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const MiniatureCard = ({ card }) => {
  return (
    <div className={`mini-physical-card product-${card.productCode}`}>
      <div className="card-glass-glow" />
      <div className="card-top">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="card-chip-nano" title="EMV Chip">
            <div className="chip-line v1"></div>
            <div className="chip-line v2"></div>
            <div className="chip-line h1"></div>
            <div className="chip-inner"></div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="card-contactless-svg" style={{ opacity: 0.8 }} title="Contactless">
            <path d="M5 8.5a4 4 0 0 1 0 7M5 5a8 8 0 0 1 0 14M5 1.5a12 12 0 0 1 0 21" />
            <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <span className="card-brand-logo">VISA</span>
      </div>
      <div className="card-number-display">
        {card.contractNumber ? card.contractNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
      </div>
      <div className="card-middle">
        <div className="card-info-item">
          <span className="card-info-label">CHỦ THẺ</span>
          <span className="card-info-value">{card.contractName?.toUpperCase() || 'CHƯA CÓ TÊN'}</span>
        </div>
        <div className="card-info-item">
          <span className="card-info-label">HẾT HẠN</span>
          <span className="card-info-value">{formatDate(card.dateExpire).substring(3, 10) || 'N/A'}</span>
        </div>
      </div>
      <div className="card-bottom">
        {card.productCode && <div className="card-product-tag" title="Mã sản phẩm thẻ">{card.productCode}</div>}
        <div className="card-balance-tag" title="Số dư thẻ">
          {card.totalBalance !== undefined ? card.totalBalance.toLocaleString() : '0'} {card.curr || 'VND'}
        </div>
      </div>
    </div>
  );
};

export default function ClientDetails({ clientId, isMerchant = false, onBack, onCreateDevice, onCreateContract }) {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const canViewTechnical = hasRole('SUPERVISOR') || hasRole('ADMIN');
  const getHierarchyApi = useApi(clientService.getHierarchy);
  
  // State to track collapsed panels
  const [collapsedLiab, setCollapsedLiab] = useState({});
  const [collapsedIssuing, setCollapsedIssuing] = useState({});
  const [collapsedAcq, setCollapsedAcq] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (clientId) {
      getHierarchyApi.execute(clientId);
    }
    // Reload hierarchy whenever the selected client changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  if (getHierarchyApi.loading) {
    return (
      <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner">{t('common.loading')}</div>
      </div>
    );
  }

  if (getHierarchyApi.error) {
    return (
      <section id="api-calls">
        <h2>{t('customer.details')}</h2>
        <div className="error-message">
          {t('customer.loadError')}
        </div>
        <div style={{ marginTop: '20px' }}>
          <button className="back-button" onClick={onBack}>{t('customer.back')}</button>
        </div>
      </section>
    );
  }

  const data = getHierarchyApi.data;
  if (!data) return null;

  const { client, contracts = [] } = data;

  // Group contracts by hierarchy
  const liabilities = contracts.filter(c => c.productType === 'LIABILITY');
  const issuingList = contracts.filter(c => c.productType === 'ISSUING');
  const cardsList = contracts.filter(c => c.productType === 'CARD');
  const acquiringList = contracts.filter(c => c.productType === 'ACQUIRING');
  const devicesList = contracts.filter(c => c.productType === 'DEVICE');
  const unknownList = contracts.filter(c => c.productType === 'UNKNOWN');

  const liabilityIds = new Set(liabilities.map(l => l.id));
  const issuingIds = new Set(issuingList.map(i => i.id));
  const acquiringIds = new Set(acquiringList.map(a => a.id));

  // Children maps
  const liabilityMap = {}; // liabilityId -> issuing list
  const issuingMap = {};   // issuingId -> card list
  const acquiringMap = {}; // acquiringId -> device list
  
  const orphanIssuings = [];
  const orphanCards = [];

  // Group Issuings
  issuingList.forEach(issuing => {
    const parentId = issuing.parentId || issuing.liabContract;
    if (parentId && liabilityIds.has(parentId)) {
      if (!liabilityMap[parentId]) liabilityMap[parentId] = [];
      liabilityMap[parentId].push(issuing);
    } else {
      orphanIssuings.push(issuing);
    }
  });

  // Group Cards
  cardsList.forEach(card => {
    const parentId = card.parentId || card.acntContractOid || card.billingContract;
    if (parentId && issuingIds.has(parentId)) {
      if (!issuingMap[parentId]) issuingMap[parentId] = [];
      issuingMap[parentId].push(card);
    } else {
      orphanCards.push(card);
    }
  });

  // Group Devices
  devicesList.forEach(device => {
    const parentId = device.parentId;
    if (parentId && acquiringIds.has(parentId)) {
      if (!acquiringMap[parentId]) acquiringMap[parentId] = [];
      acquiringMap[parentId].push(device);
    }
  });

  const toggleLiab = (id) => {
    setCollapsedLiab(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleIssuing = (id) => {
    setCollapsedIssuing(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAcq = (id) => {
    setCollapsedAcq(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasContracts = contracts.length > 0;

  return (
    <section id="api-calls">
      <div className="page-header-container" style={{ marginBottom: '24px' }}>
        <h2>{isMerchant ? t('merchant.details') : t('customer.details')}</h2>
        <button className="back-button" style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', margin: 0 }} onClick={onBack}>
          {t('customer.back')}
        </button>
      </div>

      <DetailTabs tabs={[
        { id: 'overview', label: t('common.overview') }, { id: 'contracts', label: t('customer.contracts') },
        { id: 'accounts', label: t('customer.accounts') }, { id: 'products', label: t('customer.products') },
        { id: 'transactions', label: t('customer.transactions') }, ...(canViewTechnical ? [{ id: 'technical', label: t('common.technical') }] : [])
      ]} active={activeTab} onChange={setActiveTab} />

      {/* Customer Profile Card */}
      {activeTab === 'overview' && <div className="form-container card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 1fr', 
          gap: '24px', 
          alignItems: 'center', 
          paddingBottom: '20px', 
          borderBottom: '1px solid var(--border)',
          marginBottom: '20px'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'var(--accent-bg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '36px',
            color: 'var(--accent)',
            border: '2px solid var(--accent-border)'
          }}>
            👤
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '24px', color: 'var(--text-h)' }}>{client.shortName}</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="info-badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)', fontWeight: 600 }}>
                Mã CIF: {client.clientNumber || 'N/A'}
              </span>
              <span className="info-badge">
                Ngày mở CIF: {formatDate(client.dateOpen)}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="profile-info-item">
            <span className="profile-info-label">Họ và tên</span>
            <span className="profile-info-value">{`${client.lastName || ''} ${client.firstName || ''}`.trim() || client.shortName}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Giới tính</span>
            <span className="profile-info-value">{formatGender(client.gender)}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Ngày sinh</span>
            <span className="profile-info-value">{formatDate(client.birthDate)}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Số điện thoại</span>
            <span className="profile-info-value">{client.mobilePhone || 'N/A'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{client.email || 'N/A'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">CMT/CCCD</span>
            <span className="profile-info-value">{client.maskedSocialNumber || 'N/A'}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Mã số thuế</span>
            <span className="profile-info-value">{client.maskedItn || 'N/A'}</span>
          </div>
          <div className="profile-info-item full-width">
            <span className="profile-info-label">Địa chỉ thường trú</span>
            <span className="profile-info-value">
              {`${client.addressLine1 || ''}${client.city ? `, ${client.city}` : ''}${client.country ? `, ${client.country}` : ''}`.trim() || 'N/A'}
            </span>
          </div>
        </div>
      </div>}

      {/* Owned Contracts & Cards Section */}
      {activeTab === 'contracts' && <div className="form-container card" style={{ padding: '32px' }}>
        <h3 style={{ textAlign: 'left', marginTop: 0, marginBottom: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isMerchant ? '🏪 Hợp Đồng Acquiring & Device' : '💳 Danh Sách Hợp Đồng & Thẻ Sở Hữu'}
        </h3>

        {!hasContracts ? (
          isMerchant ? (
            <div className="no-data" style={{ padding: '24px', borderStyle: 'dashed', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Merchant này chưa có Acquiring Contract đang hoạt động. Hãy tạo hợp đồng trước khi thêm Device.
              </span>
              <button
                className="submit-button"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onClick={() => onCreateContract?.(client.id)}
              >
                + Tạo Hợp Đồng Acquiring
              </button>
            </div>
          ) : (
            <div className="no-data" style={{ padding: '30px', borderStyle: 'dashed' }}>
              Khách hàng này chưa có bất kỳ hợp đồng hay thẻ nào được đăng ký trên hệ thống.
            </div>
          )
        ) : (
          <div className="hierarchy-container">
            {isMerchant && acquiringList.length === 0 && (
              <div className="no-data" style={{ padding: '24px', borderStyle: 'dashed', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Merchant này chưa có Acquiring Contract đang hoạt động. Hãy tạo hợp đồng trước khi thêm Device.
                </span>
                <button
                  className="submit-button"
                  style={{
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onClick={() => onCreateContract?.(client.id)}
                >
                  + Tạo Hợp Đồng Acquiring
                </button>
              </div>
            )}
            {/* 1a. ACQUIRING CONTRACTS SECTION */}
            {acquiringList.map(acq => {
              const isCollapsed = collapsedAcq[acq.id];
              const childDevices = acquiringMap[acq.id] || [];
              
              return (
                <div key={acq.id} className="liability-group-card" style={{ borderColor: '#10b981' }}>
                  <div className="liability-header" onClick={() => toggleAcq(acq.id)} style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                    <div className="liability-header-left">
                      <span className="liability-badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>Acquiring</span>
                      <span className="liability-title">HĐ: {acq.contractNumber}</span>
                      <span className={`arrow-toggle ${isCollapsed ? '' : 'open'}`}>▼</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn-add-device"
                        style={{
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          minWidth: '128px',
                          height: '34px',
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        title="Thêm thiết bị (POS/Terminal)"
                        onClick={() => onCreateDevice?.(acq.contractNumber, acq.productCode)}
                      >
                        + Thêm Device
                      </button>
                      {acq.totalBalance !== undefined && (
                        <div className="liability-amount">
                          Số dư: {acq.totalBalance.toLocaleString()} {acq.curr || 'VND'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isCollapsed && (
                    <div className="liability-body">
                      {/* Acquiring metadata */}
                      <div className="metadata-grid">
                        <div className="metadata-item">
                          <span className="metadata-label">Tên hợp đồng</span>
                          <span className="metadata-value">{acq.contractName || 'N/A'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Sản phẩm Acquiring</span>
                          <span className="metadata-value code">{acq.productCode || 'N/A'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Tên sản phẩm</span>
                          <span className="metadata-value">{acq.productName || 'N/A'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Ngày mở</span>
                          <span className="metadata-value">{formatDate(acq.dateOpen)}</span>
                        </div>
                        <div className="metadata-item" style={{ gridColumn: 'span 2' }}>
                          <span className="metadata-label">Địa chỉ hợp đồng</span>
                          <span className="metadata-value">
                            {acq.addressLine1 ? `${acq.addressLine1}${acq.city ? `, ${acq.city}` : ''}${acq.country ? `, ${acq.country}` : ''}` : 'Chưa khai báo địa chỉ'}
                          </span>
                        </div>
                      </div>

                      {/* Child Devices (POS/Terminal) */}
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ color: 'var(--text-h)', margin: '0 0 12px 0', fontSize: '14px', borderLeft: '4px solid var(--accent)', paddingLeft: '8px' }}>
                          Danh sách thiết bị (POS/Terminal) ({childDevices.length})
                        </h4>
                        {childDevices.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '10px 0' }}>
                            Chưa có thiết bị nào được khai báo dưới hợp đồng này.
                          </div>
                        ) : (
                          <div className="metadata-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', background: 'transparent', padding: 0 }}>
                            {childDevices.map(device => (
                              <div key={device.id} style={{ 
                                padding: '16px', 
                                border: '1px solid var(--border)', 
                                borderRadius: '12px', 
                                background: 'var(--card-bg, #fff)', 
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                  <span className="info-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 600, fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                                    POS/Terminal
                                  </span>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                    HĐ: {device.contractNumber}
                                  </span>
                                </div>
                                <div style={{ fontSize: '14px', color: 'var(--text-h)', fontWeight: 600, marginBottom: '8px' }}>
                                  {device.contractName || 'POS Terminal'}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                  <div>
                                    Mã sản phẩm: <span style={{ fontFamily: 'monospace', color: 'var(--text-h)', fontWeight: 500 }}>{device.productCode}</span>
                                  </div>
                                  <div>
                                    Tiền tệ: <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>{device.curr}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* 1b. LIABILITY CONTRACTS SECTION */}
            {liabilities.map(liab => {
              const isCollapsed = collapsedLiab[liab.id];
              const childIssuings = liabilityMap[liab.id] || [];
              
              return (
                <div key={liab.id} className="liability-group-card">
                  <div className="liability-header" onClick={() => toggleLiab(liab.id)}>
                    <div className="liability-header-left">
                      <span className="liability-badge">Bảo lãnh (Liability)</span>
                      <span className="liability-title">HĐ: {liab.contractNumber}</span>
                      <span className={`arrow-toggle ${isCollapsed ? '' : 'open'}`}>▼</span>
                    </div>
                    {liab.amountAvailable !== undefined && (
                      <div className="liability-amount" title="Khả dụng tối đa">
                        {liab.amountAvailable.toLocaleString()} {liab.curr || 'VND'}
                      </div>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="liability-body">
                      {/* Liability metadata */}
                      <div className="metadata-grid">
                        <div className="metadata-item">
                          <span className="metadata-label">Tên hợp đồng</span>
                          <span className="metadata-value">{liab.contractName || 'N/A'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Mã sản phẩm</span>
                          <span className="metadata-value code">{liab.productCode || 'Chưa xác định'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Tài khoản liên kết</span>
                          <span className="metadata-value code">{liab.contractNumber || 'N/A'}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Ngày mở</span>
                          <span className="metadata-value">{formatDate(liab.dateOpen)}</span>
                        </div>
                      </div>

                      {/* Child Issuing Contracts */}
                      {childIssuings.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0', fontStyle: 'italic' }}>
                          Chưa có Hợp đồng phát hành (Issuing Contract) nào liên kết với Hợp đồng bảo lãnh này.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {childIssuings.map(issuing => {
                            const isIssuingCollapsed = collapsedIssuing[issuing.id];
                            const childCards = issuingMap[issuing.id] || [];

                            return (
                              <div key={issuing.id} className="issuing-group-card">
                                <div className="issuing-header" onClick={() => toggleIssuing(issuing.id)}>
                                  <div className="issuing-header-left">
                                    <span className="issuing-badge">Phát hành (Issuing)</span>
                                    <span className="issuing-title">HĐ: {issuing.contractNumber}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({issuing.productName})</span>
                                    <span className={`arrow-toggle ${isIssuingCollapsed ? '' : 'open'}`}>▼</span>
                                  </div>
                                  {issuing.totalBalance !== undefined && (
                                    <div className="issuing-amount">
                                      Số dư: {issuing.totalBalance.toLocaleString()} {issuing.curr || 'VND'}
                                    </div>
                                  )}
                                </div>

                                {!isIssuingCollapsed && (
                                  <div className="issuing-body">
                                    {/* Issuing details */}
                                    <div className="metadata-grid" style={{ marginBottom: '16px', background: 'var(--block)' }}>
                                      <div className="metadata-item">
                                        <span className="metadata-label">Tên hợp đồng</span>
                                        <span className="metadata-value">{issuing.contractName || 'N/A'}</span>
                                      </div>
                                      <div className="metadata-item">
                                        <span className="metadata-label">Sản phẩm phát hành</span>
                                        <span className="metadata-value code">{issuing.productCode || 'Chưa xác định'}</span>
                                      </div>
                                      <div className="metadata-item">
                                        <span className="metadata-label">Hạn mức / Dư nợ</span>
                                        <span className="metadata-value" style={{ color: 'var(--accent)' }}>
                                          {(issuing.amountAvailable || 0).toLocaleString()} {issuing.curr || 'VND'}
                                        </span>
                                      </div>
                                      <div className="metadata-item">
                                        <span className="metadata-label">Hạn hiệu lực</span>
                                        <span className="metadata-value">{formatDate(issuing.dateExpire)}</span>
                                      </div>
                                    </div>

                                    {/* Cards Grid */}
                                    {childCards.length === 0 ? (
                                      <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '10px' }}>
                                        Chưa có thẻ vật lý nào được phát hành dưới Hợp đồng phát hành này.
                                      </div>
                                    ) : (
                                      <div className="cards-grid">
                                        {childCards.map(card => (
                                          <MiniatureCard key={card.id} card={card} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 2. ORPHAN ISSUINGS SECTION (Issuings with no parent liability) */}
            {orphanIssuings.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ color: 'var(--text-h)', borderLeft: '4px solid #8b5cf6', paddingLeft: '8px', marginBottom: '16px' }}>
                  📂 Hợp Đồng Phát Hành Độc Lập
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orphanIssuings.map(issuing => {
                    const isIssuingCollapsed = collapsedIssuing[issuing.id];
                    const childCards = issuingMap[issuing.id] || [];

                    return (
                      <div key={issuing.id} className="issuing-group-card">
                        <div className="issuing-header" onClick={() => toggleIssuing(issuing.id)}>
                          <div className="issuing-header-left">
                            <span className="issuing-badge">Phát hành (Issuing)</span>
                            <span className="issuing-title">HĐ: {issuing.contractNumber}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({issuing.productName})</span>
                            <span className={`arrow-toggle ${isIssuingCollapsed ? '' : 'open'}`}>▼</span>
                          </div>
                          {issuing.totalBalance !== undefined && (
                            <div className="issuing-amount">
                              Số dư: {issuing.totalBalance.toLocaleString()} {issuing.curr || 'VND'}
                            </div>
                          )}
                        </div>

                        {!isIssuingCollapsed && (
                          <div className="issuing-body">
                            <div className="metadata-grid" style={{ marginBottom: '16px', background: 'var(--block)' }}>
                              <div className="metadata-item">
                                <span className="metadata-label">Tên hợp đồng</span>
                                <span className="metadata-value">{issuing.contractName || 'N/A'}</span>
                              </div>
                              <div className="metadata-item">
                                <span className="metadata-label">Sản phẩm phát hành</span>
                                <span className="metadata-value code">{issuing.productCode || 'Chưa xác định'}</span>
                              </div>
                              <div className="metadata-item">
                                <span className="metadata-label">Số dư khả dụng</span>
                                <span className="metadata-value">
                                  {(issuing.amountAvailable || 0).toLocaleString()} {issuing.curr || 'VND'}
                                </span>
                              </div>
                              <div className="metadata-item">
                                <span className="metadata-label">Hạn hiệu lực</span>
                                <span className="metadata-value">{formatDate(issuing.dateExpire)}</span>
                              </div>
                            </div>

                            {childCards.length === 0 ? (
                              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '10px' }}>
                                Chưa có thẻ vật lý nào được phát hành dưới Hợp đồng phát hành này.
                              </div>
                            ) : (
                              <div className="cards-grid">
                                {childCards.map(card => (
                                  <MiniatureCard key={card.id} card={card} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. ORPHAN CARDS SECTION (Cards with no parent issuing) */}
            {orphanCards.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ color: 'var(--text-h)', borderLeft: '4px solid #f59e0b', paddingLeft: '8px', marginBottom: '16px' }}>
                  💳 Thẻ Độc Lập (Không liên kết Hợp đồng)
                </h4>
                <div className="cards-grid">
                  {orphanCards.map(card => (
                    <MiniatureCard key={card.id} card={card} />
                  ))}
                </div>
              </div>
            )}

            {/* 4. OTHER / UNKNOWN CONTRACTS SECTION */}
            {unknownList.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h4 style={{ color: 'var(--text-h)', borderLeft: '4px solid #6b7280', paddingLeft: '8px', marginBottom: '16px' }}>
                  ⚙️ Các Hợp Đồng Khác
                </h4>
                <div className="metadata-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                  {unknownList.map(other => (
                    <div key={other.id} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--block)' }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px', color: 'var(--text-h)' }}>
                        {other.contractName || 'Hợp đồng không xác định'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Mã số: <span style={{ fontFamily: 'monospace' }}>{other.contractNumber}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Mã sản phẩm: <span style={{ fontFamily: 'monospace' }}>{other.productCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>}

      {activeTab === 'accounts' && <div className="form-container card" style={{ padding: '24px' }}>
        <h3>{t('customer.accountsByContract')}</h3>
        <div className="metadata-grid">{contracts.map((contract) => <Link key={contract.id} to={`/contracts/${contract.id}`} className="metadata-item">
          <span className="metadata-label">{contract.contractName || contract.productType}</span><span className="metadata-value">HĐ {contract.contractNumber || contract.id}</span>
        </Link>)}</div>
      </div>}

      {activeTab === 'products' && <div className="form-container card" style={{ padding: '24px' }}>
        <h3>{t('customer.activeProducts')}</h3><div className="metadata-grid">{Array.from(new Map(contracts.filter((item) => item.productCode).map((item) => [item.productCode, item])).values()).map((item) =>
          <Link key={item.productCode} to={`/products/${encodeURIComponent(item.productCode)}`} className="metadata-item"><span className="metadata-label">{item.productCode}</span><span className="metadata-value">{item.productName || t('customer.unnamedProduct')}</span></Link>)}</div>
      </div>}

      {activeTab === 'transactions' && (hasContracts ? <TransactionHistory contracts={contracts} /> : <div className="no-data">{t('customer.noContractsForTransactions')}</div>)}
      {activeTab === 'technical' && <TechnicalDetailsPanel data={{ clientId: client.id, clientNumber: client.clientNumber, contractCount: contracts.length }} />}
    </section>
  );
}
