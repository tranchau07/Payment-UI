import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { transactionService } from '../../services/transactionApi';
import DataState from '../../components/common/DataState';
import DetailTabs from '../../components/common/DetailTabs';
import MaskedIdentifier from '../../components/common/MaskedIdentifier';
import MoneyAmount from '../../components/common/MoneyAmount';
import StatusBadge from '../../components/common/StatusBadge';
import TechnicalDetailsPanel from '../../components/common/TechnicalDetailsPanel';
import useAuth from '../../hooks/useAuth';
import useI18n from '../../hooks/useI18n';
import './TransactionDetail.css';

const dateTime = (value, locale) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '-';
const Field = ({ label, children }) => <div className="business-field"><span>{label}</span><strong>{children ?? '-'}</strong></div>;

export default function TransactionDetail() {
  const { hasRole } = useAuth();
  const { t, locale } = useI18n();
  const tabs = [
    { id: 'overview', label: t('common.overview') }, { id: 'amounts', label: t('transaction.amounts') },
    { id: 'parties', label: t('transaction.relatedContracts') }, { id: 'legs', label: t('transaction.entries') },
    { id: 'technical', label: t('common.technical') }
  ].filter((item) => item.id !== 'technical' || hasRole('SUPERVISOR') || hasRole('ADMIN'));
  const location = useLocation();
  const docId = location.pathname.split('/').filter(Boolean).at(-1);
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [tab, setTab] = useState('overview');
  const load = () => { setLoading(true); setError(''); transactionService.getById(docId).then(({ data: value }) => setData(value))
    .catch(() => setError(t('transaction.detailLoadError'))).finally(() => setLoading(false)); };
  useEffect(() => {
    let active = true;
    transactionService.getById(docId).then(({ data: value }) => { if (active) setData(value); })
      .catch(() => { if (active) setError(t('transaction.detailLoadError')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [docId, t]);

  return <section className="transaction-detail-page"><Link to="/transactions" className="back-link">{t('transaction.list')}</Link>
    <DataState loading={loading} error={error} onRetry={load} empty={!data}>
      {data && <><header className="transaction-detail-header card"><div><span>{t('transaction.type')} #{data.id}</span><h2>{data.transactionTypeName || t('common.unclassified')}</h2>{data.details && <p>{data.details}</p>}</div>
        <div><MoneyAmount value={data.amount} currency={data.currency} /><StatusBadge code={data.postingStatus} /></div></header>
        <DetailTabs tabs={tabs} active={tab} onChange={setTab} />
        <div className="detail-tab-panel card">
          {tab === 'overview' && <div className="business-grid"><Field label={t('transaction.time')}>{dateTime(data.transactionDate, locale)}</Field><Field label={t('transaction.postingDate')}>{dateTime(data.postingDate, locale)}</Field>
            <Field label={t('transaction.receivedDate')}>{dateTime(data.receivedDate, locale)}</Field><Field label={t('transaction.returnCode')}>{data.returnCode}</Field><Field label={t('transaction.authorization')}><MaskedIdentifier value={data.maskedAuthorizationCode} /></Field><Field label={t('transaction.outwardStatus')}>{data.outwardStatus}</Field></div>}
          {tab === 'amounts' && <div className="business-grid"><Field label={t('transaction.transactionAmount')}><MoneyAmount value={data.amount} currency={data.currency} /></Field>
            <Field label={t('transaction.settlementAmount')}><MoneyAmount value={data.settlementAmount} currency={data.settlementCurrency} /></Field><Field label={t('transaction.reconciliationAmount')}><MoneyAmount value={data.reconciliationAmount} currency={data.reconciliationCurrency} /></Field></div>}
          {tab === 'parties' && <div className="contract-summary-grid">{[[t('common.source'), data.sourceContract], [t('common.destination'), data.targetContract]].map(([label, contract]) => <article key={label} className="business-section"><h3>{label}</h3>{contract ? <>
            <Field label={t('transaction.contract')}><MaskedIdentifier value={contract.maskedContractNumber} /></Field><Field label={t('common.name')}>{contract.name}</Field><Field label={t('transaction.product')}>{contract.productName || contract.productCode}</Field><Field label={t('common.currency')}>{contract.currency}</Field><Field label={t('transaction.statusCode')}>{contract.statusCode}</Field><Field label={t('transaction.available')}><MoneyAmount value={contract.amountAvailable} currency={contract.currency} /></Field></> : <p>{t('transaction.noContract')}</p>}</article>)}</div>}
          {tab === 'legs' && <div className="posting-legs">{!data.postingLegs?.length ? <p>{t('transaction.noEntries')}</p> : data.postingLegs.map((leg) => <article key={leg.id} className="posting-leg"><header><strong>{t('transaction.entry')} #{leg.id}</strong><StatusBadge code={leg.postingStatus} /></header>
            <div className="business-grid"><Field label={t('transaction.code')}>{leg.transactionCode}</Field><Field label={t('common.amount')}><MoneyAmount value={leg.transactionAmount} currency={leg.currency} /></Field><Field label={t('transaction.sourceAccount')}><MaskedIdentifier value={leg.sourceAccount?.maskedAccountNumber || (leg.sourceAccount ? `ID ${leg.sourceAccount.id}` : null)} /></Field><Field label={t('transaction.targetAccount')}><MaskedIdentifier value={leg.targetAccount?.maskedAccountNumber || (leg.targetAccount ? `ID ${leg.targetAccount.id}` : null)} /></Field><Field label={t('transaction.sourceContractId')}>{leg.sourceAccount?.contractId}</Field><Field label={t('transaction.targetContractId')}>{leg.targetAccount?.contractId}</Field></div></article>)}</div>}
          {tab === 'technical' && <TechnicalDetailsPanel data={{ docId: data.id, transactionTypeId: data.transactionTypeId, transactionTypeCode: data.transactionTypeCode, amendmentState: data.amendmentState, postingStatus: data.postingStatus, outwardStatus: data.outwardStatus, returnCode: data.returnCode }} />}
        </div></>}
    </DataState></section>;
}
