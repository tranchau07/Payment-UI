import useI18n from '../../hooks/useI18n';
import { presentWarning } from '../../features/transaction-detail/warningPresentation';

export default function WarningBanner({ warnings = [] }) {
  const { language, locale } = useI18n();
  if (!warnings.length) return null;
  return <div className="warning-stack" aria-live="polite">{warnings.map((warning) => {
    const display = presentWarning(warning, language, locale);
    return <div key={`${warning.code}-${warning.evidence}`} className={`warning-banner ${String(warning.severity || 'info').toLowerCase()}`}>
      <div><strong>{display.title}</strong><code>{warning.code}</code></div><span>{display.message}</span>{display.evidence && <small>{display.evidence}</small>}
    </div>;
  })}</div>;
}
