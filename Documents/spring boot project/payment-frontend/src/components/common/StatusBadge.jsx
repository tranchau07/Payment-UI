import { getPostingStatusMeta } from '../../features/transaction-journal/docPresentation';
import useI18n from '../../hooks/useI18n';

export default function StatusBadge({ code }) {
  const { language } = useI18n();
  const status = getPostingStatusMeta(code, language);
  return <span className={`status-pill ${status.className}`} title={`${status.displayLabel} (${code || 'null'})`}>{status.label || code || '—'}</span>;
}
