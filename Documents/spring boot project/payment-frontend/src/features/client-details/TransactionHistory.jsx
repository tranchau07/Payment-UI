import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../../services/transactionApi';
import DataState from '../../components/common/DataState';
import MoneyAmount from '../../components/common/MoneyAmount';
import MaskedIdentifier from '../../components/common/MaskedIdentifier';
import StatusBadge from '../../components/common/StatusBadge';
import useI18n from '../../hooks/useI18n';
import './TransactionHistory.css';

const dateTime = (value, locale) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';

export default function TransactionHistory({ contracts = [] }) {
  const { t, locale } = useI18n();
  const [contractId, setContractId] = useState(() => String(contracts[0]?.id || ''));
  const [page, setPage] = useState(null); const [loading, setLoading] = useState(Boolean(contractId)); const [error, setError] = useState('');
  const load = () => {
    if (!contractId) return;
    setLoading(true); setError('');
    transactionService.search({ contractId, page: page?.number || 0, size: 10, sort: 'transDate,desc' })
      .then(({ data }) => setPage(data)).catch(() => setError(t('transaction.historyLoadError'))).finally(() => setLoading(false));
  };
  useEffect(() => {
    if (!contractId) return undefined;
    let active = true;
    transactionService.search({ contractId, page: 0, size: 10, sort: 'transDate,desc' })
      .then(({ data }) => { if (active) setPage(data); }).catch(() => { if (active) setError(t('transaction.historyLoadError')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [contractId, t]);

  if (!contracts.length) return <div className="no-data">{t('transaction.noContractHistory')}</div>;
  return <section className="form-container card" style={{ padding: '24px' }}><div className="table-header-row"><h3>{t('transaction.history')}</h3>
    <select value={contractId} onChange={(event) => { setContractId(event.target.value); setLoading(true); setError(''); }}>{contracts.map((contract) => <option key={contract.id} value={contract.id}>{contract.contractNumber || contract.id} — {contract.contractName || contract.productType}</option>)}</select></div>
    <DataState loading={loading} error={error} onRetry={load} empty={!page?.content?.length}><div className="table-container"><table className="client-table"><thead><tr><th>{t('transaction.time')}</th><th>{t('transaction.type')}</th><th>{t('common.source')}</th><th>{t('common.destination')}</th><th>{t('common.amount')}</th><th>{t('common.status')}</th><th></th></tr></thead><tbody>{(page?.content || []).map((item) => <tr key={item.id}><td>{dateTime(item.transactionDate, locale)}</td><td>{item.transactionTypeName || item.transactionTypeCode || t('common.unclassified')}</td><td><MaskedIdentifier value={item.maskedSource} /></td><td><MaskedIdentifier value={item.maskedTarget} /></td><td><MoneyAmount value={item.amount} currency={item.currency} /></td><td><StatusBadge code={item.postingStatus} /></td><td><Link to={`/transactions/${item.id}`}>{t('common.details')}</Link></td></tr>)}</tbody></table></div></DataState>
  </section>;
}
