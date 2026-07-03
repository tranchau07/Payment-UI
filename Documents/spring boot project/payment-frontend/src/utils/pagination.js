export const createPaginationItems = (currentPage, totalPages) => {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index);
  const pages = new Set([0, totalPages - 1]);
  for (let page = Math.max(0, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) pages.add(page);
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((page, index) => index > 0 && page - sorted[index - 1] > 1 ? [`gap-${page}`, page] : [page]);
};
