import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { portfolioService } from '../../services/portfolioApi';
import { statementService } from '../../services/statementApi';
import DataState from '../../components/common/DataState';
import DetailTabs from '../../components/common/DetailTabs';
import MaskedIdentifier from '../../components/common/MaskedIdentifier';
import MoneyAmount from '../../components/common/MoneyAmount';
import TechnicalDetailsPanel from '../../components/common/TechnicalDetailsPanel';
import useAuth from '../../hooks/useAuth';
import useI18n from '../../hooks/useI18n';

const Field = ({ label, children }) => <div className="business-field"><span>{label}</span><strong>{children ?? '-'}</strong></div>;
const dateTime = (value, locale) => value ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value)) : '-';
const statementRange = () => {
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - 30);
  return { fromDate: fromDate.toISOString(), toDate: toDate.toISOString() };
};

export default function ContractDetail() {
  const { hasRole } = useAuth();
  const { t, locale } = useI18n();
  const tabs = [
    { id: 'overview', label: t('common.overview') },
    { id: 'accounts', label: t('contract.accounts') },
    { id: 'transactions', label: t('contract.transactions') },
    { id: 'technical', label: t('common.technical') },
  ].filter((item) => item.id !== 'technical' || hasRole('SUPERVISOR') || hasRole('ADMIN'));
  const location = useLocation();
  const contractId = location.pathname.split('/').filter(Boolean).at(-1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    portfolioService.getContract(contractId)
      .then(({ data: value }) => setData(value))
      .catch(() => setError(t('contract.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    portfolioService.getContract(contractId)
      .then(({ data: value }) => { if (active) setData(value); })
      .catch(() => { if (active) setError(t('contract.loadError')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [contractId, t]);

  const exportContract = async (kind) => {
    setExporting(true);
    setError('');
    try {
      if (kind === 'statement') {
        await statementService.exportContractStatement(contractId, statementRange(), 'XLSX');
      } else {
        await portfolioService.exportContract(contractId, 'PDF');
      }
    } catch {
      setError(t('export.failed'));
    } finally {
      setExporting(false);
    }
  };

  return <section className="transaction-detail-page"><Link to={data?.client?.id ? `/clients/${data.client.id}` : '/clients'} className="back-link">{t('common.back')} {t('contract.customer')}</Link>
    <DataState loading={loading} error={error} onRetry={load} empty={!data}>{data && <>
      <header className="transaction-detail-header card">
        <div><span>{t('contract.title')} #{data.id}</span><h2>{data.name || t('contract.unnamed')}</h2><MaskedIdentifier value={data.maskedContractNumber} /></div>
        <div><MoneyAmount value={data.amountAvailable} currency={data.currency} /><small>{t('contract.available')}</small>
          <div className="export-actions"><button type="button" onClick={() => exportContract('statement')} disabled={exporting}>{t('export.statement')}</button><button type="button" onClick={() => exportContract('portfolio')} disabled={exporting}>{t('export.pdf')}</button></div>
        </div>
      </header>
      <DetailTabs tabs={tabs} active={tab} onChange={setTab} /><div className="detail-tab-panel card">
        {tab === 'overview' && <div className="business-grid"><Field label={t('contract.customer')}>{data.client ? <Link to={`/clients/${data.client.id}`}>{data.client.name || data.client.maskedClientNumber}</Link> : null}</Field><Field label={t('transaction.product')}>{data.product ? <Link to={`/products/${encodeURIComponent(data.product.code)}`}>{data.product.name || data.product.code}</Link> : null}</Field><Field label={t('common.currency')}>{data.currency}</Field><Field label={t('contract.statusCode')}>{data.statusCode}</Field><Field label={t('contract.productionStatus')}>{data.productionStatus}</Field><Field label={t('contract.readiness')}>{data.readiness}</Field><Field label={t('contract.openDate')}>{dateTime(data.openDate, locale)}</Field><Field label={t('contract.balanceObservedAt')}>{dateTime(data.balanceObservedAt, locale)}</Field><Field label={t('contract.totalBalance')}><MoneyAmount value={data.totalBalance} currency={data.currency} /></Field><Field label={t('contract.blocked')}><MoneyAmount value={data.totalBlocked} currency={data.currency} /></Field></div>}
        {tab === 'accounts' && <div className="posting-legs">{data.accounts?.length ? data.accounts.map((account) => <Link key={account.id} to={`/accounts/${account.id}`} className="posting-leg"><header><strong>{account.accountTypeName || account.accountName || `${t('account.title')} ${account.id}`}</strong></header><div className="business-grid"><Field label={t('account.title')}><MaskedIdentifier value={account.maskedAccountNumber || `ID ${account.id}`} /></Field><Field label={t('common.currency')}>{account.currency}</Field><Field label={t('account.currentBalance')}><MoneyAmount value={account.currentBalance} currency={account.currency} /></Field><Field label={t('contract.blocked')}><MoneyAmount value={account.totalBlocked} currency={account.currency} /></Field></div></Link>) : <p>{t('contract.noAccounts')}</p>}</div>}
        {tab === 'transactions' && <p><Link to={`/transactions?contractId=${data.id}`}>{t('contract.openTransactions')} -&gt;</Link></p>}
        {tab === 'technical' && <TechnicalDetailsPanel data={{ contractId: data.id, level: data.level, statusCode: data.statusCode, productionStatus: data.productionStatus, readiness: data.readiness, productInternalCode: data.product?.internalCode }} />}
      </div></>}</DataState></section>;
}
