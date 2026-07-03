import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioApi';
import DataState from '../../components/common/DataState';
import DetailTabs from '../../components/common/DetailTabs';
import MaskedIdentifier from '../../components/common/MaskedIdentifier';
import MoneyAmount from '../../components/common/MoneyAmount';
import TechnicalDetailsPanel from '../../components/common/TechnicalDetailsPanel';
import useAuth from '../../hooks/useAuth';
import useI18n from '../../hooks/useI18n';

const Field = ({ label, children }) => <div className="business-field"><span>{label}</span><strong>{children ?? '—'}</strong></div>;
const dateTime = (value, locale) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '—';

export default function AccountDetail() {
  const { hasRole } = useAuth();
  const { t, locale } = useI18n();
  const location = useLocation(); const accountId = location.pathname.split('/').filter(Boolean).at(-1);
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [tab, setTab] = useState('overview');
  const load = () => { setLoading(true); setError(''); portfolioService.getAccount(accountId).then(({ data: value }) => setData(value)).catch(() => setError(t('account.loadError'))).finally(() => setLoading(false)); };
  useEffect(() => { let active = true; portfolioService.getAccount(accountId).then(({ data: value }) => { if (active) setData(value); }).catch(() => { if (active) setError(t('account.loadError')); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [accountId, t]);
  const tabs = [{ id: 'overview', label: t('common.overview') }, { id: 'balance', label: t('account.balanceLimits') }, { id: 'transactions', label: t('account.transactions') }, { id: 'technical', label: t('common.technical') }]
    .filter((item) => item.id !== 'technical' || hasRole('SUPERVISOR') || hasRole('ADMIN'));
  return <section className="transaction-detail-page"><Link to={data?.contract?.id ? `/contracts/${data.contract.id}` : '/clients'} className="back-link">← {t('account.contract')}</Link>
    <DataState loading={loading} error={error} onRetry={load} empty={!data}>{data && <><header className="transaction-detail-header card"><div><span>{t('account.title')} #{data.id}</span><h2>{data.accountTypeName || data.name || t('account.title')}</h2><MaskedIdentifier value={data.maskedAccountNumber} /></div><div><MoneyAmount value={data.currentBalance} currency={data.currency} /><small>{t('account.observedAt')}: {dateTime(data.balanceObservedAt, locale)}</small></div></header>
      <DetailTabs tabs={tabs} active={tab} onChange={setTab} /><div className="detail-tab-panel card">
        {tab === 'overview' && <div className="business-grid"><Field label={t('account.contract')}>{data.contract ? <Link to={`/contracts/${data.contract.id}`}>{data.contract.name || data.contract.maskedContractNumber}</Link> : null}</Field><Field label={t('account.type')}>{data.accountTypeName || data.accountTypeId}</Field><Field label={t('common.currency')}>{data.currency}</Field><Field label={t('account.categoryCode')}>{data.category}</Field><Field label={t('account.dueTypeCode')}>{data.dueType}</Field></div>}
        {tab === 'balance' && <div className="business-grid"><Field label={t('account.openingBalance')}><MoneyAmount value={data.beginBalance} currency={data.currency} /></Field><Field label={t('account.currentBalance')}><MoneyAmount value={data.currentBalance} currency={data.currency} /></Field><Field label={t('account.totalBlocked')}><MoneyAmount value={data.totalBlocked} currency={data.currency} /></Field><Field label={t('account.ownBlocked')}><MoneyAmount value={data.ownBlocked} currency={data.currency} /></Field><Field label={t('account.lowerLimit')}><MoneyAmount value={data.lowerLimit} currency={data.currency} /></Field><Field label={t('account.upperLimit')}><MoneyAmount value={data.upperLimit} currency={data.currency} /></Field><Field label={t('account.observedAt')}>{dateTime(data.balanceObservedAt, locale)}</Field></div>}
        {tab === 'transactions' && <p><Link to={`/transactions?contractId=${data.contract?.id || ''}`}>{t('account.relatedTransactions')} →</Link></p>}
        {tab === 'technical' && <TechnicalDetailsPanel data={{ accountId: data.id, accountTypeId: data.accountTypeId, category: data.category, dueType: data.dueType, contractId: data.contract?.id }} />}
      </div></>}</DataState></section>;
}
