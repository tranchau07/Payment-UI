import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { docService } from '../../services/docApi';
import { getDocFieldLabel, getPostingStatusMeta, parseAddInfo } from '../transaction-journal/docPresentation';
import './TransactionHistory.css';

export default function TransactionHistory({ contracts = [] }) {
  const [selectedContractId, setSelectedContractId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const docsApi = useApi(docService.search);
  const activeContractId = selectedContractId || contracts[0]?.id?.toString() || '';

  // Fetch transactions when contract, page, or search term changes
  useEffect(() => {
    if (activeContractId) {
      const params = {
        contractId: activeContractId,
        page: currentPage,
        size: pageSize,
        sort: 'transDate,desc'
      };

      if (searchTerm.trim()) {
        params.number = searchTerm.trim();
      }

      docsApi.execute(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeContractId, currentPage, pageSize, searchTerm]);

  const handleContractChange = (e) => {
    setSelectedContractId(e.target.value);
    setCurrentPage(0);
    setExpandedRowId(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0);
    setExpandedRowId(null);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setExpandedRowId(null);
    // Smooth scroll to the history section
    const element = document.getElementById('transaction-history-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAmount = (amount, currency) => {
    if (amount === undefined || amount === null) return '0';
    return `${amount.toLocaleString('vi-VN')}${currency ? ' ' + currency : ''}`;
  };

  const getStatusBadge = (doc) => {
    const status = getPostingStatusMeta(doc.postingStatus);
    return (
      <span className={`status-pill ${status.className}`} title={status.displayLabel}>
        {status.label}
      </span>
    );
  };

  const renderDetailItem = (label, value, isCode = false) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="detail-item" key={label}>
        <span className="detail-label">{getDocFieldLabel(label)}:</span>
        <span className={`detail-value ${isCode ? 'code' : ''}`}>{value.toString()}</span>
      </div>
    );
  };

  const renderDateItem = (label, value) => {
    if (!value) return null;
    return (
      <div className="detail-item" key={label}>
        <span className="detail-label">{getDocFieldLabel(label)}:</span>
        <span className="detail-value">{formatDate(value)}</span>
      </div>
    );
  };

  const renderAmountItem = (label, amount, currency) => {
    if (amount === null || amount === undefined) return null;
    return (
      <div className="detail-item" key={label}>
        <span className="detail-label">{getDocFieldLabel(label)}:</span>
        <span className="detail-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>
          {formatAmount(amount, currency)}
        </span>
      </div>
    );
  };

  const renderCommentItem = (label, value, isError = false) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="detail-item full-width" key={label}>
        <span className="detail-label">{getDocFieldLabel(label)}:</span>
        <span className="detail-value" style={isError ? { color: '#ef4444' } : {}}>{value.toString()}</span>
      </div>
    );
  };

  const docData = docsApi.data?.content || [];
  const totalPages = docsApi.data?.totalPages || 0;
  const totalElements = docsApi.data?.totalElements || 0;

  if (contracts.length === 0) {
    return null;
  }

  return (
    <div id="transaction-history-section" className="form-container card" style={{ padding: '32px', marginTop: '32px' }}>
      <h3 style={{ textAlign: 'left', marginTop: 0, marginBottom: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        Nhật ký giao dịch
      </h3>
      <p className="section-description" style={{ textAlign: 'left', margin: '0 0 24px 0' }}>
        Tra cứu giao dịch, trạng thái xử lý và biến động số dư của tài khoản.
      </p>

      {/* Toolbar Filters */}
      <div className="doc-toolbar">
        <div className="doc-filters">
          <div className="doc-field">
            <label htmlFor="contract-selector">Chọn Hợp đồng/Tài khoản</label>
            <select
              id="contract-selector"
              className="doc-select"
              value={activeContractId}
              onChange={handleContractChange}
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>
                  [{c.productType}] HĐ: {c.contractNumber} - {c.contractName}
                </option>
              ))}
            </select>
          </div>

          <div className="doc-field">
            <label htmlFor="doc-search">Tìm kiếm nhanh</label>
            <div className="doc-search-wrapper">
              <span className="doc-search-icon">🔍</span>
              <input
                id="doc-search"
                type="text"
                className="doc-input"
                placeholder="Tìm mã Auth, số TK nguồn/đích..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>
        </div>
      </div>

      {docsApi.loading && (
        <div className="doc-loading">
          <div className="spinner"></div>
          <span>Đang truy vấn lịch sử giao dịch từ Core...</span>
        </div>
      )}

      {docsApi.error && (
        <div className="error-message">
          Không thể tải lịch sử giao dịch: {docsApi.error}
        </div>
      )}

      {!docsApi.loading && !docsApi.error && docData.length === 0 && (
        <div className="no-data" style={{ padding: '30px', borderStyle: 'dashed' }}>
          Không tìm thấy giao dịch nào được ghi nhận cho hợp đồng này.
        </div>
      )}

      {!docsApi.loading && !docsApi.error && docData.length > 0 && (
        <>
          <div className="table-container" style={{ marginBottom: '16px' }}>
            <table className="client-table doc-table">
              <thead>
                <tr>
                  <th width="40"></th>
                  <th>Mã giao dịch</th>
                  <th>Ngày giao dịch</th>
                  <th>Phân loại nghiệp vụ</th>
                  <th>Nội dung / Chi tiết</th>
                  <th>TK Nguồn (Source)</th>
                  <th>TK Đích (Target)</th>
                  <th style={{ textAlign: 'right' }}>Số tiền</th>
                  <th style={{ textAlign: 'center' }}>Định khoản</th>
                  <th>Mã Auth</th>
                </tr>
              </thead>
              <tbody>
                {docData.map(doc => {
                  const isExpanded = expandedRowId === doc.id;
                  const addInfoPairs = parseAddInfo(doc.addInfo);

                  return (
                    <>
                      <tr 
                        key={doc.id} 
                        className={`doc-row ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => toggleRowExpand(doc.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          {isExpanded ? '▼' : '▶'}
                        </td>
                        <td className="code">{doc.id}</td>
                        <td>{formatDate(doc.transDate)}</td>
                        <td>
                          <div className="doc-type-cell">
                            <strong>{doc.transTypeName || 'Chưa phân loại'}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="doc-details-text" title={doc.transDetails}>{doc.transDetails || 'N/A'}</span>
                        </td>
                        <td className="code">{doc.sourceNumber || 'N/A'}</td>
                        <td className="code">{doc.targetNumber || 'N/A'}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--text-h)' }}>
                          <span className={doc.debitCredit < 0 || doc.transAmount < 0 ? 'amount-debit' : 'amount-credit'}>
                            {formatAmount(doc.transAmount, doc.transCurrName)}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {getStatusBadge(doc)}
                        </td>
                        <td className="code">{doc.authCode || 'N/A'}</td>
                      </tr>

                      {isExpanded && (
                        <tr key={`expanded-${doc.id}`} className="doc-expanded-row">
                          <td colSpan="10">
                            <div className="doc-expanded-content">
                              <h4 className="expanded-title-heading" style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid var(--accent-border)', paddingBottom: '8px', textAlign: 'left' }}>
                                CHI TIẾT GIAO DỊCH #{doc.id}
                              </h4>
                              
                              <div className="expanded-cards-grid">
                                {/* BLOCK 1: General & Audit */}
                                {(() => {
                                  const items = [
                                    renderDetailItem("AMND STATE", doc.amndState),
                                    renderDateItem("AMND DATE", doc.amndDate),
                                    renderDetailItem("AMND OFFICER", doc.amndOfficer),
                                    renderDetailItem("AMND PREV ID", doc.amndPrev),
                                    renderDetailItem("ACTION", doc.action),
                                    renderDetailItem("MSG CATEGORY", doc.messageCategory),
                                    renderDetailItem("IS AUTHORIZATION", doc.isAuthorization),
                                    renderDetailItem("REQUEST CATEGORY", doc.requestCategory),
                                    renderDetailItem("SERVICE CLASS", doc.serviceClass),
                                    renderDetailItem("REQUIREMENT", doc.requirement),
                                    renderDetailItem("PARTITION KEY", doc.partitionKey, true),
                                    renderDetailItem("SYNCH TAG", doc.synchTag),
                                    renderDetailItem("VERSION", doc.changeVersion)
                                  ].filter(Boolean);
                                  if (items.length === 0) return null;
                                  return (
                                    <div className="expanded-card-block">
                                      <h6>📋 Thông Tin Chung & Kiểm Toán</h6>
                                      <div className="detail-list">{items}</div>
                                    </div>
                                  );
                                })()}

                                {/* BLOCK 2: Transaction Details */}
                                {(() => {
                                  const items = [
                                    renderAmountItem("TRANS AMOUNT", doc.transAmount, doc.transCurrName),
                                    renderDateItem("TRANS DATE", doc.transDate),
                                    renderDetailItem("AUTH CODE", doc.authCode, true),
                                    renderDetailItem("TRANS TYPE", doc.transType),
                                    renderDetailItem("TRANS TYPE NAME", doc.transTypeName),
                                    renderDetailItem("TRANS TYPE IDT", doc.transTypeIdt, true),
                                    renderDetailItem("DR / CR", doc.debitCredit),
                                    renderDetailItem("TRANG THAI XU LY", getPostingStatusMeta(doc.postingStatus).displayLabel),
                                    renderDateItem("POSTING DATE", doc.postingDate),
                                    renderDetailItem("OUTWARD STATUS", doc.outwardStatus),
                                    renderDetailItem("RETURN CODE", doc.returnCode, true),
                                    renderDetailItem("REASON CODE", doc.reasonCode, true),
                                    renderCommentItem("COMMENT TEXT", doc.commentText),
                                    renderCommentItem("REASON DETAILS", doc.reasonDetails, true)
                                  ].filter(Boolean);
                                  if (items.length === 0) return null;
                                  return (
                                    <div className="expanded-card-block">
                                      <h6>💰 Chi Tiết Giao Dịch & Định Khoản</h6>
                                      <div className="detail-list">{items}</div>
                                    </div>
                                  );
                                })()}

                                {/* BLOCK 3: Source & Target */}
                                {(() => {
                                  const srcItems = [
                                    renderDetailItem("SOURCE NUMBER", doc.sourceNumber, true),
                                    renderDetailItem("SOURCE REG NUMBER", doc.sourceRegNum, true),
                                    renderDetailItem("SOURCE CODE", doc.sourceCode, true),
                                    renderDetailItem("SOURCE CONTRACT", doc.sourceContract, true),
                                    renderDetailItem("SOURCE SERVICE", doc.sourceService),
                                    renderDetailItem("SOURCE CHANNEL", doc.sourceChannel),
                                    renderDetailItem("SOURCE CAT", doc.sCat),
                                    renderDetailItem("SOURCE ACC TYPE", doc.sourceAccType)
                                  ].filter(Boolean);

                                  const tgtItems = [
                                    renderDetailItem("TARGET NUMBER", doc.targetNumber, true),
                                    renderDetailItem("TARGET CODE", doc.targetCode, true),
                                    renderDetailItem("TARGET CONTRACT", doc.targetContract, true),
                                    renderDetailItem("TARGET SERVICE", doc.targetService),
                                    renderDetailItem("TARGET CHANNEL", doc.targetChannel),
                                    renderDetailItem("TARGET CAT", doc.tCat),
                                    renderDetailItem("TARGET ACC TYPE", doc.targetAccType),
                                    renderDetailItem("TARGET COUNTRY", doc.targetCountry)
                                  ].filter(Boolean);

                                  if (srcItems.length === 0 && tgtItems.length === 0) return null;

                                  return (
                                    <div className="expanded-card-block">
                                      <h6>🔄 Đối Tác Nguồn & Đích</h6>
                                      <div className="detail-list">
                                        {srcItems.length > 0 && (
                                          <>
                                            <div className="detail-item-header">ĐỐI TÁC GỬI</div>
                                            {srcItems}
                                          </>
                                        )}
                                        {tgtItems.length > 0 && (
                                          <>
                                            <div className="detail-item-header" style={{ marginTop: '12px' }}>ĐỐI TÁC NHẬN</div>
                                            {tgtItems}
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* BLOCK 4: Settlement & Fees */}
                                {(() => {
                                  const items = [
                                    renderAmountItem("SETTL AMOUNT", doc.settlAmount, doc.settlCurr),
                                    renderAmountItem("SOURCE FEE AMOUNT", doc.sourceFeeAmount, doc.sourceFeeCurr),
                                    renderDetailItem("SOURCE FEE CODE", doc.sourceFeeCode, true),
                                    renderAmountItem("TARGET FEE AMOUNT", doc.targetFeeAmount, doc.targetFeeCurr),
                                    renderDetailItem("TARGET FEE CODE", doc.targetFeeCode, true),
                                    renderAmountItem("RECONS AMOUNT", doc.reconsAmount, doc.reconsCurr),
                                    renderDateItem("FX SETTL DATE", doc.fxSettlDate),
                                    renderDateItem("REC DATE", doc.recDate)
                                  ].filter(Boolean);
                                  if (items.length === 0) return null;
                                  return (
                                    <div className="expanded-card-block">
                                      <h6>💳 Quyết Toán & Phí Giao Dịch</h6>
                                      <div className="detail-list">{items}</div>
                                    </div>
                                  );
                                })()}

                                {/* BLOCK 5: Card & POS Info */}
                                {(() => {
                                  const locString = [doc.transCity, doc.transState, doc.transCountry].filter(Boolean).join(', ');
                                  const items = [
                                    renderDetailItem("CARD EXPIRE", doc.cardExpire),
                                    renderDetailItem("CARD SEQ NUMBER", doc.cardSeqvNumber),
                                    renderDetailItem("MERCHANT ID", doc.merchantId, true),
                                    renderDetailItem("SIC CODE", doc.sicCode),
                                    renderDetailItem("SENDING BIN", doc.sendingBin, true),
                                    renderDetailItem("TARGET BIN ID", doc.targetBinId),
                                    renderDetailItem("TRANS CONDITION", doc.transCondition),
                                    renderDetailItem("TRANS COND ATTR", doc.transCondAttr),
                                    renderDetailItem("BIN RECORD", doc.binRecord, true),
                                    renderDetailItem("TRANS LOCATION", locString)
                                  ].filter(Boolean);
                                  if (items.length === 0) return null;
                                  return (
                                    <div className="expanded-card-block">
                                      <h6>🏪 Thông Tin Thẻ & Thiết Bị (POS)</h6>
                                      <div className="detail-list">{items}</div>
                                    </div>
                                  );
                                })()}

                                {/* BLOCK 6: Chain & References */}
                                {(() => {
                                  const items = [
                                    renderDetailItem("DOC ORIG ID", doc.docOrigId, true),
                                    renderDetailItem("DOC PREV ID", doc.docPrevId, true),
                                    renderDetailItem("DOC SUMM ID", doc.docSummId, true),
                                    renderDetailItem("DOC CHAIN ID", doc.docChainId, true),
                                    renderDetailItem("NUMBER OF SUB-S", doc.numberOfSubS),
                                    renderDetailItem("NUMBER IN CHAIN", doc.numberInChain),
                                    renderDetailItem("ACQ REF NUMBER", doc.acqRefNumber, true),
                                    renderDetailItem("RET REF NUMBER", doc.retRefNumber, true),
                                    renderDetailItem("ISS REF NUMBER", doc.issRefNumber, true),
                                    renderDetailItem("PS REF NUMBER", doc.psRefNumber, true),
                                    renderDateItem("NW REF DATE", doc.nwRefDate)
                                  ].filter(Boolean);
                                  if (items.length === 0) return null;
                                  return (
                                    <div className="expanded-card-block">
                                      <h6>🔗 Chuỗi Chứng Từ & Tham Chiếu</h6>
                                      <div className="detail-list">{items}</div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* BLOCK 7: Technical Add Info (Raw parameters) */}
                              {addInfoPairs.length > 0 && (
                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                                  <h6 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-h)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    ⚙️ Tham Số Kỹ Thuật Bổ Sung (Add Info)
                                  </h6>
                                  <div className="add-info-tags">
                                    {addInfoPairs.map((pair, idx) => (
                                      <div key={idx} className="add-info-tag">
                                        <span className="tag-key">{pair.key}:</span>
                                        <span className="tag-val">{pair.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <span className="pagination-info">
              Hiển thị {docData.length} trên tổng số <strong>{totalElements}</strong> chứng từ
            </span>
            <div className="pagination-controls">
              <button 
                className="page-button" 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 0}
              >
                Trước
              </button>
              <button className="page-button active">
                {currentPage + 1} / {totalPages || 1}
              </button>
              <button 
                className="page-button" 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage >= totalPages - 1}
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
