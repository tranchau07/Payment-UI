import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { docService } from '../../services/docApi';
import { getPostingStatusMeta } from '../transaction-journal/docPresentation';
import useI18n from '../../hooks/useI18n';
import './ContractCashFlow.css';

const money = (value, currency, locale) => new Intl.NumberFormat(locale, {
  style: 'currency', currency: currency || 'VND', maximumFractionDigits: 2,
}).format(Number(value || 0));

const dateTime = (value, locale) => value
  ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '-';

const SORTERS = {
  latest: (a, b) => new Date(b.lastTransactionDate || 0) - new Date(a.lastTransactionDate || 0),
  activity: (a, b) => Number(b.transactionCount || 0) - Number(a.transactionCount || 0),
  received: (a, b) => Number(b.totalReceived || 0) - Number(a.totalReceived || 0),
  sent: (a, b) => Number(b.totalSent || 0) - Number(a.totalSent || 0),
  balance: (a, b) => Number(b.amountAvailable || 0) - Number(a.amountAvailable || 0),
};

export default function ContractCashFlow() {
  const { t, locale, language } = useI18n();
  const navigate = useNavigate();
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    docService.getContractCashFlows()
      .then(({ data }) => active && setRows(Array.isArray(data) ? data : []))
      .catch(() => active && setError(t('cashFlow.loadError')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [t]);

  useEffect(() => {
    if (!selectedContract) return undefined;
    let active = true;
    docService.getByContractId(selectedContract.contractId, { page: historyPage, size: 15 })
      .then(({ data }) => active && setHistory(data))
      .catch(() => active && setHistoryError(t('cashFlow.historyError')))
      .finally(() => active && setHistoryLoading(false));
    return () => { active = false; };
  }, [selectedContract, historyPage, t]);

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

  const openTransactionDetail = (docId) => {
    if (!docId) return;
    navigate(`/transactions/${docId}`);
  };

  const exportCashFlow = async () => {
    setExporting(true);
    setError('');
    try { await docService.exportContractCashFlows('XLSX'); }
    catch { setError(t('export.failed')); }
    finally { setExporting(false); }
  };

  const getDirection = (doc) => {
    const contractId = Number(selectedContract?.contractId);
    const isSource = Number(doc.sourceContract) === contractId;
    const isTarget = Number(doc.targetContract) === contractId;
    if (isSource && isTarget) return { label: t('cashFlow.internal'), className: 'internal' };
    const negative = Number(doc.transAmount || 0) < 0;
    const incoming = negative ? isSource : isTarget;
    return incoming
      ? { label: t('cashFlow.received'), className: 'incoming' }
      : { label: t('cashFlow.sent'), className: 'outgoing' };
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

  if (loading) return <div className="cash-flow-state">{t('common.loading')}</div>;
  if (error) return <div className="cash-flow-state error">{error}</div>;

  return (
    <section className="cash-flow-page">
      <header className="cash-flow-heading">
        <div className="cash-flow-heading-row"><h1>{t('cashFlow.title')}</h1><button type="button" onClick={exportCashFlow} disabled={exporting}>{exporting ? t('common.processing') : t('export.xlsx')}</button></div>
      </header>

      <div className="cash-flow-overview">
        <article><span>{t('cashFlow.contracts')}</span><strong>{overview.contracts}</strong></article>
        <article><span>{t('cashFlow.postedTransactions')}</span><strong>{overview.documents.toLocaleString(locale)}</strong></article>
        <article><span>{t('cashFlow.latestActivity')}</span><strong className="overview-date">{dateTime(overview.latest, locale)}</strong></article>
      </div>

      <div className="currency-summary">
        {currencyTotals.map((item) => <article key={item.code}><strong>{item.code}</strong><span className="cash-in">{t('cashFlow.received')} {money(item.received, item.code, locale)}</span><span className="cash-out">{t('cashFlow.sent')} {money(item.sent, item.code, locale)}</span></article>)}
      </div>

      <div className="cash-flow-toolbar">
        <label><span>{t('cashFlow.searchContract')}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('cashFlow.searchPlaceholder')} /></label>
        <label><span>{t('cashFlow.sort')}</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="latest">{t('cashFlow.sortLatest')}</option><option value="activity">{t('cashFlow.sortActivity')}</option><option value="received">{t('cashFlow.sortReceived')}</option><option value="sent">{t('cashFlow.sortSent')}</option><option value="balance">{t('cashFlow.sortBalance')}</option></select></label>
      </div>

      <div className="cash-flow-results">{visibleRows.length} {t('cashFlow.results')}</div>
      <div className="contract-flow-grid">
        {visibleRows.map((row) => {
          const flowCurrency = row.currency || row.balanceCurrency || 'VND';
          const positive = Number(row.netCashFlow || 0) >= 0;
          return <article className="contract-flow-card" key={`${row.contractId}-${flowCurrency}`} role="button" tabIndex="0" onClick={() => openHistory(row)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openHistory(row); }}>
            <header><div><h2>{row.contractName || t('contract.unnamed')}</h2><p>{row.contractNumber || `ID ${row.contractId}`}</p></div><span className="currency-chip">{flowCurrency}</span></header>
            <div className="available-balance"><span>{t('cashFlow.availableBalance')}</span><strong>{money(row.amountAvailable, row.balanceCurrency || flowCurrency, locale)}</strong></div>
            <div className="flow-pair"><div className="received"><span>{t('cashFlow.received')}</span><strong>{money(row.totalReceived, flowCurrency, locale)}</strong></div><div className="sent"><span>{t('cashFlow.sent')}</span><strong>{money(row.totalSent, flowCurrency, locale)}</strong></div></div>
            <div className={`net-flow ${positive ? 'positive' : 'negative'}`}><span>{t('cashFlow.net')}</span><strong>{positive ? '+' : ''}{money(row.netCashFlow, flowCurrency, locale)}</strong></div>
            <footer><span>{Number(row.transactionCount || 0).toLocaleString(locale)} {t('transaction.count')}</span><span>{t('cashFlow.latest')} {dateTime(row.lastTransactionDate, locale)}</span><span className="view-transactions">{t('cashFlow.viewTransactions')}</span>{row.product && <span className="product-label">{row.product}</span>}</footer>
          </article>;
        })}
      </div>
      {!visibleRows.length && <div className="cash-flow-empty">{t('cashFlow.noContracts')}</div>}

      {selectedContract && <div className="transaction-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeHistory(); }}>
        <aside className="transaction-drawer" role="dialog" aria-modal="true" aria-label={t('cashFlow.history')}>
          <header className="drawer-header">
            <div><span>{t('cashFlow.history')}</span><h2>{selectedContract.contractName || t('contract.unnamed')}</h2><p>{selectedContract.contractNumber || `ID ${selectedContract.contractId}`}</p></div>
            <button type="button" onClick={closeHistory} aria-label={t('cashFlow.close')}>x</button>
          </header>

          <div className="drawer-summary"><span>{t('cashFlow.availableBalance')}</span><strong>{money(selectedContract.amountAvailable, selectedContract.balanceCurrency || selectedContract.currency, locale)}</strong></div>

          <div className="transaction-list">
            {historyLoading && <div className="drawer-state">{t('cashFlow.loadingHistory')}</div>}
            {historyError && <div className="drawer-state error">{historyError}</div>}
            {!historyLoading && !historyError && (history?.content || []).map((doc) => {
              const direction = getDirection(doc);
              const status = getPostingStatusMeta(doc.postingStatus, language);
              const currency = doc.transCurrName || doc.transCurr || selectedContract.currency;
              return <article className="transaction-item" key={doc.id} role="button" tabIndex="0" onClick={() => openTransactionDetail(doc.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openTransactionDetail(doc.id); }}>
                <div className={`direction-icon ${direction.className}`}>{direction.className === 'incoming' ? '+' : direction.className === 'outgoing' ? '-' : '='}</div>
                <div className="transaction-main"><strong>{doc.transTypeName || doc.transDetails || t('common.unclassified')}</strong><span>{dateTime(doc.transDate, locale)} - #{doc.id}</span><small>{doc.transDetails || t('cashFlow.noNarrative')}</small></div>
                <div className="transaction-value"><strong className={direction.className}>{money(Math.abs(Number(doc.transAmount || 0)), currency, locale)}</strong><span>{direction.label}</span><small className={`transaction-status ${status.className}`}>{status.label}</small></div>
              </article>;
            })}
            {!historyLoading && !historyError && history && !history.content?.length && <div className="drawer-state">{t('cashFlow.noHistory')}</div>}
          </div>

          {history && history.totalPages > 1 && <footer className="drawer-pagination">
            <button type="button" disabled={historyPage === 0 || historyLoading} onClick={() => changeHistoryPage(historyPage - 1)}>{t('common.previous')}</button>
            <span>{t('cashFlow.page')} {historyPage + 1} / {history.totalPages}</span>
            <button type="button" disabled={historyPage + 1 >= history.totalPages || historyLoading} onClick={() => changeHistoryPage(historyPage + 1)}>{t('common.next')}</button>
          </footer>}
        </aside>
      </div>}
    </section>
  );
}
