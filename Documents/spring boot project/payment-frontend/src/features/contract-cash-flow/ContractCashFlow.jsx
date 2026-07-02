import { useEffect, useMemo, useState } from 'react';
import { docService } from '../../services/docApi';
import { getPostingStatusMeta } from '../transaction-journal/docPresentation';
import './ContractCashFlow.css';

const money = (value, currency) => new Intl.NumberFormat('vi-VN', {
  style: 'currency', currency: currency || 'VND', maximumFractionDigits: 2,
}).format(Number(value || 0));

const dateTime = (value) => value
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—';

const SORTERS = {
  latest: (a, b) => new Date(b.lastTransactionDate || 0) - new Date(a.lastTransactionDate || 0),
  activity: (a, b) => Number(b.transactionCount || 0) - Number(a.transactionCount || 0),
  received: (a, b) => Number(b.totalReceived || 0) - Number(a.totalReceived || 0),
  sent: (a, b) => Number(b.totalSent || 0) - Number(a.totalSent || 0),
  balance: (a, b) => Number(b.amountAvailable || 0) - Number(a.amountAvailable || 0),
};

export default function ContractCashFlow() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [selectedContract, setSelectedContract] = useState(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  useEffect(() => {
    let active = true;
    docService.getContractCashFlows()
      .then(({ data }) => active && setRows(Array.isArray(data) ? data : []))
      .catch(() => active && setError('Không thể tải dữ liệu dòng tiền hợp đồng.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedContract) return undefined;
    let active = true;
    docService.getByContractId(selectedContract.contractId, { page: historyPage, size: 15 })
      .then(({ data }) => active && setHistory(data))
      .catch(() => active && setHistoryError('Không thể tải lịch sử giao dịch của hợp đồng.'))
      .finally(() => active && setHistoryLoading(false));
    return () => { active = false; };
  }, [selectedContract, historyPage]);

  const openHistory = (row) => {
    setSelectedContract(row);
    setHistoryPage(0);
    setHistory(null);
    setHistoryLoading(true);
    setHistoryError('');
  };

  const closeHistory = () => {
    setSelectedContract(null);
    setHistory(null);
    setHistoryError('');
  };

  const changeHistoryPage = (page) => {
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryPage(page);
  };

  const getDirection = (doc) => {
    const contractId = Number(selectedContract?.contractId);
    const isSource = Number(doc.sourceContract) === contractId;
    const isTarget = Number(doc.targetContract) === contractId;
    if (isSource && isTarget) return { label: 'Nội bộ', className: 'internal' };
    const negative = Number(doc.transAmount || 0) < 0;
    const incoming = negative ? isSource : isTarget;
    return incoming
      ? { label: 'Tiền vào', className: 'incoming' }
      : { label: 'Tiền ra', className: 'outgoing' };
  };

  const visibleRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return rows.filter((row) => !keyword || [row.contractName, row.contractNumber, row.product]
      .some((value) => String(value || '').toLocaleLowerCase('vi').includes(keyword)))
      .sort(SORTERS[sort]);
  }, [rows, search, sort]);

  const overview = useMemo(() => ({
    contracts: new Set(rows.map((row) => row.contractId)).size,
    documents: rows.reduce((sum, row) => sum + Number(row.transactionCount || 0), 0),
    latest: rows.reduce((current, row) => {
      const candidate = new Date(row.lastTransactionDate || 0);
      return candidate > current ? candidate : current;
    }, new Date(0)),
  }), [rows]);

  const currencyTotals = useMemo(() => Object.values(rows.reduce((totals, row) => {
    const code = row.currency || row.balanceCurrency || 'VND';
    totals[code] ||= { code, received: 0, sent: 0 };
    totals[code].received += Number(row.totalReceived || 0);
    totals[code].sent += Number(row.totalSent || 0);
    return totals;
  }, {})), [rows]);

  if (loading) return <div className="cash-flow-state">Đang tổng hợp dòng tiền…</div>;
  if (error) return <div className="cash-flow-state error">{error}</div>;

  return (
    <section className="cash-flow-page">
      <header className="cash-flow-heading">
        <div><p className="cash-flow-eyebrow">TỔNG QUAN TÀI CHÍNH</p><h1>Dòng tiền theo hợp đồng</h1><p>Chỉ gồm giao dịch đã hạch toán và có phát sinh số tiền.</p></div>
      </header>

      <div className="cash-flow-overview">
        <article><span>Hợp đồng có giao dịch</span><strong>{overview.contracts}</strong></article>
        <article><span>Giao dịch đã hạch toán</span><strong>{overview.documents.toLocaleString('vi-VN')}</strong></article>
        <article><span>Hoạt động gần nhất</span><strong className="overview-date">{dateTime(overview.latest)}</strong></article>
      </div>

      <div className="currency-summary">
        {currencyTotals.map((item) => <article key={item.code}><strong>{item.code}</strong><span className="cash-in">↓ Nhận {money(item.received, item.code)}</span><span className="cash-out">↑ Gửi {money(item.sent, item.code)}</span></article>)}
      </div>

      <div className="cash-flow-toolbar">
        <label><span>Tìm hợp đồng</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên, số hợp đồng hoặc sản phẩm" /></label>
        <label><span>Sắp xếp</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">Giao dịch gần nhất</option><option value="activity">Nhiều giao dịch nhất</option><option value="received">Tiền nhận nhiều nhất</option><option value="sent">Tiền gửi nhiều nhất</option><option value="balance">Số dư khả dụng cao nhất</option></select></label>
      </div>

      <div className="cash-flow-results">{visibleRows.length} kết quả</div>
      <div className="contract-flow-grid">
        {visibleRows.map((row) => {
          const flowCurrency = row.currency || row.balanceCurrency || 'VND';
          const positive = Number(row.netCashFlow || 0) >= 0;
          return <article className="contract-flow-card" key={`${row.contractId}-${flowCurrency}`} role="button" tabIndex="0" onClick={() => openHistory(row)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openHistory(row); }}>
            <header><div><h2>{row.contractName || 'Hợp đồng chưa đặt tên'}</h2><p>{row.contractNumber || `ID ${row.contractId}`}</p></div><span className="currency-chip">{flowCurrency}</span></header>
            <div className="available-balance"><span>Số dư khả dụng</span><strong>{money(row.amountAvailable, row.balanceCurrency || flowCurrency)}</strong><small>Số dư hiện tại từ tài khoản hợp đồng</small></div>
            <div className="flow-pair"><div className="received"><span>↓ Tiền nhận</span><strong>{money(row.totalReceived, flowCurrency)}</strong></div><div className="sent"><span>↑ Tiền gửi</span><strong>{money(row.totalSent, flowCurrency)}</strong></div></div>
            <div className={`net-flow ${positive ? 'positive' : 'negative'}`}><span>Dòng tiền thuần</span><strong>{positive ? '+' : ''}{money(row.netCashFlow, flowCurrency)}</strong></div>
            <footer><span>{Number(row.transactionCount || 0).toLocaleString('vi-VN')} giao dịch</span><span>Gần nhất {dateTime(row.lastTransactionDate)}</span><span className="view-transactions">Xem giao dịch →</span>{row.product && <span className="product-label">{row.product}</span>}</footer>
          </article>;
        })}
      </div>
      {!visibleRows.length && <div className="cash-flow-empty">Không tìm thấy hợp đồng phù hợp.</div>}

      {selectedContract && <div className="transaction-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeHistory(); }}>
        <aside className="transaction-drawer" role="dialog" aria-modal="true" aria-label="Lịch sử giao dịch hợp đồng">
          <header className="drawer-header">
            <div><span>Lịch sử giao dịch</span><h2>{selectedContract.contractName || 'Hợp đồng chưa đặt tên'}</h2><p>{selectedContract.contractNumber || `ID ${selectedContract.contractId}`}</p></div>
            <button type="button" onClick={closeHistory} aria-label="Đóng">×</button>
          </header>

          <div className="drawer-summary"><span>Số dư khả dụng</span><strong>{money(selectedContract.amountAvailable, selectedContract.balanceCurrency || selectedContract.currency)}</strong></div>

          <div className="transaction-list">
            {historyLoading && <div className="drawer-state">Đang tải giao dịch…</div>}
            {historyError && <div className="drawer-state error">{historyError}</div>}
            {!historyLoading && !historyError && (history?.content || []).map((doc) => {
              const direction = getDirection(doc);
              const status = getPostingStatusMeta(doc.postingStatus);
              const currency = doc.transCurrName || doc.transCurr || selectedContract.currency;
              return <article className="transaction-item" key={doc.id}>
                <div className={`direction-icon ${direction.className}`}>{direction.className === 'incoming' ? '↓' : direction.className === 'outgoing' ? '↑' : '↔'}</div>
                <div className="transaction-main"><strong>{doc.transTypeName || doc.transDetails || 'Giao dịch chưa phân loại'}</strong><span>{dateTime(doc.transDate)} · Mã #{doc.id}</span><small>{doc.transDetails || 'Không có nội dung'}</small></div>
                <div className="transaction-value"><strong className={direction.className}>{money(Math.abs(Number(doc.transAmount || 0)), currency)}</strong><span>{direction.label}</span><small className={`transaction-status ${status.className}`}>{status.label}</small></div>
              </article>;
            })}
            {!historyLoading && !historyError && history && !history.content?.length && <div className="drawer-state">Hợp đồng chưa có giao dịch.</div>}
          </div>

          {history && history.totalPages > 1 && <footer className="drawer-pagination">
            <button type="button" disabled={historyPage === 0 || historyLoading} onClick={() => changeHistoryPage(historyPage - 1)}>← Trước</button>
            <span>Trang {historyPage + 1} / {history.totalPages}</span>
            <button type="button" disabled={historyPage + 1 >= history.totalPages || historyLoading} onClick={() => changeHistoryPage(historyPage + 1)}>Sau →</button>
          </footer>}
        </aside>
      </div>}
    </section>
  );
}
