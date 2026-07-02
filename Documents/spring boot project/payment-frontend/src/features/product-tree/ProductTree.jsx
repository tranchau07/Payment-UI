import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { applProductService } from '../../services/applProductApi';
import './ProductTree.css';

// Helper to resolve product category text
const getCategoryText = (conCat, pcat, code) => {
  if (code === 'LIAB_TRAINING01') return 'BẢO LÃNH';
  if (code === 'ISSUING_TRAINING01') return 'PHÁT HÀNH';
  
  if (conCat === 'C') return 'CARD';
  if (conCat === 'A' && pcat === 'C') return 'ISSUING';
  if (conCat === 'M' && pcat === 'M') return 'DEVICE';
  if (conCat === 'A' && pcat === 'M') return 'ACQUIRING';
  if (conCat === 'M') return 'ACQUIRING';
  if (conCat === 'T') return 'DEVICE';
  
  return 'UNKNOWN';
};

// Helper function to recursively filter the tree
function filterTree(nodes, searchTerm, categoryFilter, statusFilter) {
  if (!searchTerm && categoryFilter === 'ALL' && statusFilter === 'ALL') {
    return nodes;
  }
  
  return nodes
    .map(node => {
      // Check search match (case-insensitive) on code or name
      const matchesSearch = !searchTerm || 
        (node.code && node.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
      const category = getCategoryText(node.conCat, node.pcat, node.code);
      const matchesCategory = categoryFilter === 'ALL' || category === categoryFilter;
      
      const isReadyVal = node.isReady === 'Y';
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'READY' && isReadyVal) || 
        (statusFilter === 'NOT_READY' && !isReadyVal);
        
      const isDirectMatch = matchesSearch && matchesCategory && matchesStatus;
      
      let filteredChildren = [];
      if (node.children && node.children.length > 0) {
        filteredChildren = filterTree(node.children, searchTerm, categoryFilter, statusFilter);
      }
      
      const hasMatchingChildren = filteredChildren.length > 0;
      
      if (isDirectMatch || hasMatchingChildren) {
        return {
          ...node,
          children: filteredChildren
        };
      }
      return null;
    })
    .filter(node => node !== null);
}

function TreeNode({ node, level = 0 }) {
  const hasChildren = node.children && node.children.length > 0;
  
  // Categorize product based on conCat/pcat
  const getProductCategoryBadge = (conCat, pcat, code) => {
    if (code === 'LIAB_TRAINING01') return { text: 'BẢO LÃNH', className: 'badge-liab' };
    if (code === 'ISSUING_TRAINING01') return { text: 'PHÁT HÀNH', className: 'badge-issuing' };
    
    if (conCat === 'C') return { text: 'CARD', className: 'badge-card' };
    if (conCat === 'A' && pcat === 'C') return { text: 'ISSUING', className: 'badge-issuing' };
    if (conCat === 'M' && pcat === 'M') return { text: 'DEVICE', className: 'badge-device' };
    if (conCat === 'A' && pcat === 'M') return { text: 'ACQUIRING', className: 'badge-acquiring' };
    if (conCat === 'M') return { text: 'ACQUIRING', className: 'badge-acquiring' };
    if (conCat === 'T') return { text: 'DEVICE', className: 'badge-device' };
    
    return { text: 'UNKNOWN', className: 'badge-unknown' };
  };

  const badge = getProductCategoryBadge(node.conCat, node.pcat, node.code);

  // Return appropriate product icon based on category and hierarchy status
  const getProductIcon = (badgeText, hasChildren) => {
    if (hasChildren) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="node-type-icon folder-icon" title="Nhóm sản phẩm">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      );
    }
    if (badgeText === 'CARD') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="node-type-icon card-icon" title="Sản phẩm Thẻ">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
          <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
      );
    }
    if (badgeText === 'DEVICE') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="node-type-icon device-icon" title="Sản phẩm Thiết bị/POS">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="node-type-icon default-icon" title="Sản phẩm khác">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    );
  };

  return (
    <div className="tree-node-wrapper" style={{ marginLeft: `${level * 16}px` }}>
      <div className="tree-node-row">
        {/* Status Dot */}
        <span 
          className={`status-dot ${node.isReady === 'Y' ? 'ready' : 'not-ready'}`}
          title={node.isReady === 'Y' ? "Sẵn sàng hoạt động" : "Chưa sẵn sàng hoạt động"}
        />

        {/* Product Type Icon */}
        {getProductIcon(badge.text, hasChildren)}

        <div className="tree-node-content">
          <div className="tree-node-main">
            <span className="node-code" title="Mã sản phẩm">{node.code}</span>
            {node.name && <span className="node-name" title="Tên sản phẩm">- {node.name}</span>}
          </div>

          <div className="tree-node-meta">
            {/* Category Role Badge */}
            <span className={`node-badge ${badge.className}`}>{badge.text}</span>

            {/* ncontracts badge */}
            <span className={`node-badge badge-count ${node.ncontracts > 0 ? 'has-contracts' : ''}`}>
              Hợp đồng: {node.ncontracts || 0}
            </span>

            {/* Technical product parameters */}
            {node.contrType !== null && (
              <span className="meta-param" title={`contr_type ID: ${node.contrType}`}>
                contr_type: <span className="param-val">{node.contrTypeDesc || node.contrType}</span>
              </span>
            )}
            {node.contrSubtype !== null && (
              <span className="meta-param" title={`contr_subtype ID: ${node.contrSubtype}`}>
                contr_subtype: <span className="param-val">{node.contrSubtypeDesc || node.contrSubtype}</span>
              </span>
            )}
            {node.accScheme !== null && (
              <span className="meta-param" title={`acc_schema ID: ${node.accScheme}`}>
                acc_schema: <span className="param-val">{node.accSchemeDesc || node.accScheme}</span>
              </span>
            )}
            {node.servicePack !== null && (
              <span className="meta-param" title={`service_pack ID: ${node.servicePack}`}>
                service_pack: <span className="param-val">{node.servicePackDesc || node.servicePack}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {hasChildren && (
        <div className="tree-node-children">
          {node.children.map((child) => (
            <TreeNode key={child.id || child.code} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductTree() {
  const treeApi = useApi(applProductService.getTree);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    treeApi.execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roots = treeApi.data || [];
  const isLoading = treeApi.loading;
  const error = treeApi.error || (treeApi.data?.success === false ? treeApi.data?.retMsg : '');

  // Perform search and filter on the retrieved tree
  const filteredRoots = filterTree(roots, searchTerm, categoryFilter, statusFilter);

  return (
    <section className="product-tree-section">
      <div className="page-header-container" style={{ marginBottom: '24px' }}>
        <h2>Danh Sách Sản Phẩm</h2>
      </div>

      {/* Toolbar containing search bar and dropdown filters */}
      {!isLoading && !error && roots.length > 0 && (
        <div className="tree-toolbar card" style={{ padding: '16px', background: 'var(--block)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '20px' }}>
          <div className="tree-filters">
            {/* Search Input */}
            <div className="search-input-wrapper">
              <span className="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Tìm mã hoặc tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Category */}
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tất cả danh mục</option>
              <option value="ISSUING">Phát hành</option>
              <option value="ACQUIRING">Chấp nhận thanh toán</option>
              <option value="CARD">CARD</option>
              <option value="DEVICE">Thiết bị</option>
              <option value="LIABILITY">Bảo lãnh</option>
            </select>

            {/* Filter by Status */}
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="READY">Sẵn sàng</option>
              <option value="NOT_READY">Chưa sẵn sàng</option>
            </select>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="tree-loading-container">
          <div className="spinner" />
          <span>Đang tải cây sản phẩm...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          Lỗi tải cây sản phẩm: {error}
        </div>
      )}

      {!isLoading && !error && roots.length === 0 && (
        <div className="no-data-card">
          Không tìm thấy sản phẩm đang hoạt động.
        </div>
      )}

      {!isLoading && !error && roots.length > 0 && filteredRoots.length === 0 && (
        <div className="no-data-card">
          Không tìm thấy cấu hình sản phẩm nào khớp với bộ lọc hiện tại.
        </div>
      )}

      {!isLoading && !error && filteredRoots.length > 0 && (
        <div className="tree-container-card">
          {/* Restored Legend at the top of the card container (Responsive via CSS) */}
          <div className="tree-legend">
            <div className="legend-group">
              <span className="legend-item" style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>Trạng thái:</span>
              <span className="legend-sub-item">
                <span className="status-dot ready" />
                Sẵn sàng hoạt động
              </span>
              <span className="legend-sub-item">
                <span className="status-dot not-ready" />
                Chưa cấu hình xong
              </span>
            </div>
            <div className="legend-group">
              <span className="legend-item" style={{ fontWeight: 'bold', color: 'var(--text-h)' }}>Danh mục:</span>
              <span className="node-badge badge-issuing">PHÁT HÀNH</span>
              <span className="node-badge badge-acquiring">CHẤP NHẬN THANH TOÁN</span>
              <span className="node-badge badge-card">CARD</span>
              <span className="node-badge badge-device">THIẾT BỊ</span>
              <span className="node-badge badge-liab">BẢO LÃNH</span>
            </div>
          </div>

          <div className="tree-root-container">
            {filteredRoots.map((root) => (
              <TreeNode key={root.id || root.code} node={root} level={0} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
