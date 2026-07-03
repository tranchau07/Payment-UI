import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { applProductService } from '../../services/applProductApi';
import DataState from '../../components/common/DataState';
import DetailTabs from '../../components/common/DetailTabs';
import MoneyAmount from '../../components/common/MoneyAmount';
import TechnicalDetailsPanel from '../../components/common/TechnicalDetailsPanel';
import useAuth from '../../hooks/useAuth';
import useI18n from '../../hooks/useI18n';

export default function ProductDetail() {
  const { hasRole } = useAuth();
  const { t } = useI18n();
  const tabs = [{ id: 'overview', label: t('common.overview') }, { id: 'configuration', label: t('product.configuration') }, { id: 'technical', label: t('common.technical') }]
    .filter((item) => item.id !== 'technical' || hasRole('SUPERVISOR') || hasRole('ADMIN'));
  const location = useLocation();
  const code = decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1));
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); const [tab, setTab] = useState('overview');
  const load = () => { setLoading(true); setError(''); applProductService.getConfigurationByCode(code)
    .then(({ data: value }) => setData(value)).catch(() => setError(t('product.loadError'))).finally(() => setLoading(false)); };
  useEffect(() => {
    let active = true;
    applProductService.getConfigurationByCode(code).then(({ data: value }) => { if (active) setData(value); })
      .catch(() => { if (active) setError(t('product.loadError')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [code, t]);
  return <section className="transaction-detail-page"><Link to="/products" className="back-link">← {t('product.back')}</Link>
    <DataState loading={loading} error={error} onRetry={load} empty={!data}>{data && <>
      <header className="transaction-detail-header card"><div><h2>{data.name || data.code}</h2><p>{data.code}</p></div><strong>{data.isReady === 'Y' ? t('product.ready') : t('product.notReady')}</strong></header>
      <DetailTabs tabs={tabs} active={tab} onChange={setTab} /><div className="detail-tab-panel card">
        {tab === 'overview' && <div className="business-grid"><div className="business-field"><span>{t('product.businessType')}</span><strong>{data.businessType || '—'}</strong></div><div className="business-field"><span>{t('product.category')}</span><strong>{data.pcat || '—'} / {data.conCat || '—'}</strong></div><div className="business-field"><span>{t('product.parent')}</span><strong>{data.parentCode || t('product.root')}</strong></div></div>}
        {tab === 'configuration' && <div className="business-grid">{[[t('product.contractType'), data.contractType], [t('product.contractSubtype'), data.contractSubtype], [t('product.accountScheme'), data.accountScheme], [t('product.servicePackage'), data.servicePack]].map(([label, value]) => <div className="business-field" key={label}><span>{label}</span><strong>{value?.displayName || t('product.notConfigured')}</strong></div>)}
          <div className="business-field"><span>{t('product.minCreditLimit')}</span><MoneyAmount value={data.minCreditLimit} /></div><div className="business-field"><span>{t('product.maxCreditLimit')}</span><MoneyAmount value={data.maxCreditLimit} /></div></div>}
        {tab === 'technical' && <TechnicalDetailsPanel data={{ id: data.id, internalCode: data.internalCode, pcat: data.pcat, ccat: data.ccat, conCat: data.conCat, isReady: data.isReady, missingReferences: Array.isArray(data.missingReferences) ? data.missingReferences.join(', ') : data.missingReferences }} />}
      </div></>}</DataState></section>;
}
