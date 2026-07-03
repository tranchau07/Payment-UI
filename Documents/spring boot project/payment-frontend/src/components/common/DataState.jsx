import useI18n from '../../hooks/useI18n';

export default function DataState({ loading, error, empty, emptyMessage, onRetry, children }) {
  const { t } = useI18n();
  if (loading) return <div className="data-state"><div className="spinner" /> {t('common.loading')}</div>;
  if (error) return <div className="data-state error"><p>{error}</p>{onRetry && <button type="button" onClick={onRetry}>{t('common.retry')}</button>}</div>;
  if (empty) return <div className="data-state empty">{emptyMessage || t('common.noData')}</div>;
  return children;
}
