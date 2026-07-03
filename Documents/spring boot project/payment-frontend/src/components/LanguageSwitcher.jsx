import useI18n from '../hooks/useI18n';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage, t } = useI18n();
  return <div className={`language-switcher ${compact ? 'compact' : ''}`} role="group" aria-label={t('language.label')}>
    {['vi', 'en'].map((code) => <button key={code} type="button" className={language === code ? 'active' : ''}
      aria-pressed={language === code} onClick={() => setLanguage(code)}>{t(`language.${code}`)}</button>)}
  </div>;
}
