import useI18n from '../../hooks/useI18n';
import { createPaginationItems } from '../../utils/pagination';

export default function Pagination({ currentPage = 0, totalPages = 0, totalElements = 0, hasNext, onPageChange, itemLabel = '' }) {
  const { t, locale } = useI18n();
  if (totalPages <= 0) return null;
  const canGoNext = hasNext ?? currentPage < totalPages - 1;

  return <nav className="pagination-container" aria-label={t('pagination.label')}>
    <div className="pagination-info">{totalElements.toLocaleString(locale)} {itemLabel}</div>
    <div className="pagination-controls">
      <button type="button" className="page-button page-button-nav" disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)} aria-label={t('common.previous')}>← <span>{t('common.previous')}</span></button>
      {createPaginationItems(currentPage, totalPages).map((page) => typeof page === 'string'
        ? <span className="page-gap" key={page} aria-hidden="true">…</span>
        : <button type="button" key={page} className={`page-button ${currentPage === page ? 'active' : ''}`}
            aria-current={currentPage === page ? 'page' : undefined} onClick={() => onPageChange(page)}>{page + 1}</button>)}
      <button type="button" className="page-button page-button-nav" disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)} aria-label={t('common.next')}><span>{t('common.next')}</span> →</button>
    </div>
  </nav>;
}
