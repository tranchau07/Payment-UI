export default function Pagination({ totalPages, currentPage, onPageChange, totalElements, hasNext }) {
  if (totalPages <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Tìm thấy {totalElements} khách hàng
      </div>
      <div className="pagination-controls">
        <button 
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="page-button"
        >
          Trước
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`page-button ${currentPage === page ? 'active' : ''}`}
          >
            {page + 1}
          </button>
        ))}

        <button 
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="page-button"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
