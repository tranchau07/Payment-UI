import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { transactionService } from '../../services/transactionApi';
import { docService } from '../../services/docApi';
import DataState from '../../components/common/DataState';
import MoneyAmount from '../../components/common/MoneyAmount';
import MaskedIdentifier from '../../components/common/MaskedIdentifier';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import useI18n from '../../hooks/useI18n';
import { getPostingStatusMeta, toExclusiveEndDate, toStartDate } from '../transaction-journal/docPresentation';
import './TransactionSearch.css';

const dateTime = (value, locale) => value ? new Intl.DateTimeFormat(locale, {
  dateStyle: 'short', timeStyle: 'medium'
}).format(new Date(value)) : '—';

const readFilters = (params) => ({
  keyword: params.get('keyword') || '', startDate: params.get('startDate') || '', endDate: params.get('endDate') || '',
  postingStatus: params.get('postingStatus') || '', transType: params.get('transType') || '',
  contractId: params.get('contractId') || '', returnCode: params.get('returnCode') || ''
});

export default function TransactionSearch() {
  const { t, locale, language } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => readFilters(searchParams));
  const [page, setPage] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const queryKey = searchParams.toString();

  const apiParams = useMemo(() => {
    const appliedParams = new URLSearchParams(queryKey);
    const current = readFilters(appliedParams);
    const params = { page: Number(appliedParams.get('page') || 0), size: 15, sort: 'transDate,desc' };
    if (current.keyword) params.number = current.keyword;
    if (current.startDate) params.startDate = toStartDate(current.startDate);
    if (current.endDate) params.endDate = toExclusiveEndDate(current.endDate);
    if (current.postingStatus) params.postingStatus = current.postingStatus;
    if (current.transType) params.transType = current.transType;
    if (current.contractId) params.contractId = current.contractId;
    if (current.returnCode !== '') params.returnCode = current.returnCode;
    return params;
  }, [queryKey]);

  const load = () => {
    setLoading(true); setError('');
    transactionService.search(apiParams).then(({ data }) => setPage(data))
      .catch(() => setError(t('transaction.notFound')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    transactionService.search(apiParams).then(({ data }) => { if (active) setPage(data); })
      .catch(() => { if (active) setError(t('transaction.notFound')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [apiParams, t]);
  useEffect(() => { docService.getMetadata().then(({ data }) => setMetadata(data)).catch(() => setMetadata({})); }, []);

  const change = ({ target }) => setFilters((current) => ({ ...current, [target.name]: target.value }));
  const submit = (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value !== '') next.set(key, value); });
    next.set('page', '0'); setLoading(true); setError(''); setSearchParams(next);
  };
  const clear = () => { setFilters(readFilters(new URLSearchParams())); setSearchParams({ page: '0' }); };
  const goPage = (number) => { const next = new URLSearchParams(searchParams); next.set('page', String(number)); setLoading(true); setError(''); setSearchParams(next); };
  const exportResults = async (format = 'XLSX') => {
    setExporting(true); setError('');
    try { await transactionService.exportSearch(apiParams, format); }
    catch { setError(t('export.failed')); }
    finally { setExporting(false); }
  };

  return <section className="transaction-search-page">
    <header className="page-header-container exportable-header"><h2>{t('transaction.searchTitle')}</h2><button type="button" onClick={() => exportResults('XLSX')} disabled={exporting}>{exporting ? t('common.processing') : t('export.xlsx')}</button></header>
    <form className="transaction-filter card" onSubmit={submit}>
      <label>{t('transaction.keyword')}<input name="keyword" value={filters.keyword} onChange={change} placeholder={t('transaction.keywordPlaceholder')} /></label>
      <label>{t('transaction.fromDate')}<input type="date" name="startDate" value={filters.startDate} onChange={change} /></label>
      <label>{t('transaction.toDate')}<input type="date" name="endDate" value={filters.endDate} onChange={change} /></label>
      <label>{t('common.status')}<select name="postingStatus" value={filters.postingStatus} onChange={change}><option value="">{t('common.all')}</option>
        {(metadata.postingStatuses || []).map((code) => <option key={code} value={code}>{getPostingStatusMeta(code, language).optionLabel}</option>)}</select></label>
      <label>{t('transaction.type')}<select name="transType" value={filters.transType} onChange={change}><option value="">{t('common.all')}</option>
        {(metadata.transactionTypes || []).map((type) => <option key={type.id} value={type.id}>{type.name || type.identityCode || type.id}</option>)}</select></label>
      <details className="advanced-filter"><summary>{t('transaction.advanced')}</summary><div>
        <label>{t('transaction.contractId')}<input name="contractId" inputMode="numeric" value={filters.contractId} onChange={change} /></label>
        <label>{t('transaction.returnCode')}<input name="returnCode" inputMode="numeric" value={filters.returnCode} onChange={change} /></label>
      </div></details>
      <div className="filter-actions"><button type="button" onClick={clear}>{t('common.clear')}</button><button type="button" onClick={() => exportResults('CSV')} disabled={exporting}>{t('export.csv')}</button><button type="submit" className="submit-button">{t('common.search')}</button></div>
    </form>

    <DataState loading={loading} error={error} onRetry={load} empty={!page?.content?.length}
      emptyMessage={t('transaction.notFound')}>
      <div className="table-container card"><table className="transaction-summary-table"><thead><tr>
        <th>{t('transaction.time')}</th><th>{t('transaction.type')}</th><th>{t('common.source')}</th><th>{t('common.destination')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th>{t('transaction.result')}</th><th></th>
      </tr></thead><tbody>{(page?.content || []).map((item) => <tr key={item.id}>
        <td>{dateTime(item.transactionDate, locale)}</td><td><strong>{item.transactionTypeName || t('common.unclassified')}</strong><small>{item.transactionTypeCode || item.transactionTypeId || ''}</small></td>
        <td><MaskedIdentifier value={item.maskedSource} /></td><td><MaskedIdentifier value={item.maskedTarget} /></td>
        <td><MoneyAmount value={item.amount} currency={item.currency} /></td><td><StatusBadge code={item.postingStatus} /></td>
        <td className={item.returnCode === 0 ? 'result-ok' : 'result-error'}>{item.returnCode === 0 ? t('common.success') : `${t('transaction.returnCode')} ${item.returnCode ?? '—'}`}</td>
        <td><button type="button" onClick={() => navigate(`/transactions/${item.id}`)}>{t('common.details')}</button></td>
      </tr>)}</tbody></table></div>
      {page && <Pagination currentPage={page.number} totalPages={page.totalPages} totalElements={page.totalElements}
        hasNext={!page.last} onPageChange={goPage} itemLabel={t('transaction.count')} />}
    </DataState>
  </section>;
}
