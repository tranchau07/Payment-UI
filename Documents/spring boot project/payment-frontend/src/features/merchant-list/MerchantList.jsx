import { useState, useEffect, useCallback } from 'react';
import { merchantService } from '../../services/merchantApi';
import { branchService } from '../../services/branchApi';
import { useApi } from '../../hooks/useApi';
import ApiForm from '../../components/common/ApiForm';
import MerchantTable from './components/MerchantTable';
import Pagination from './components/Pagination';

const INITIAL_SEARCH_VALUES = {
  shortName: '',
  phoneNumber: '',
  clientNumber: '',
  itn: '',
  branchCode: '',
  pcat: '',
  conCat: '',
  ccat: ''
};

export default function MerchantList({ onCreateContract, onViewDetails, onAddMerchant }) {
  const [searchValues, setSearchValues] = useState(INITIAL_SEARCH_VALUES);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  const searchApi = useApi(merchantService.search);
  const branchesApi = useApi(branchService.getAll);

  const fetchMerchants = useCallback(async (page = 0, filters = searchValues) => {
    const params = {
      ...filters,
      page,
      size: pageSize,
      sort: 'id,desc'
    };
    // Remove empty strings, null, or undefined from params
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    try {
      await searchApi.execute(params);
    } catch (err) {
      console.error('Fetch merchants error:', err);
    }
  }, [searchValues, pageSize, searchApi]);

  useEffect(() => {
    branchesApi.execute();
    fetchMerchants(0, INITIAL_SEARCH_VALUES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (values) => {
    setSearchValues(values);
    setCurrentPage(0);
    fetchMerchants(0, values);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchMerchants(newPage, searchValues);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchFields = [
    { name: 'shortName', label: 'Tên Merchant', placeholder: 'Nhập tên Merchant' },
    { name: 'phoneNumber', label: 'Số điện thoại', placeholder: 'Nhập số điện thoại' },
    { name: 'clientNumber', label: 'Mã Merchant', placeholder: 'Nhập mã Merchant' },
    { name: 'itn', label: 'Mã số thuế / TIN', placeholder: 'Nhập mã số thuế' },
    { 
      name: 'branchCode', 
      label: 'Chi nhánh', 
      type: 'select', 
      placeholder: 'Chọn chi nhánh',
      options: branchesApi.data?.map(b => ({ value: b.code, label: b.name })) || []
    }
  ];

  const merchantData = searchApi.data?.retCode === 0 ? (searchApi.data?.data || []) : [];
  const pagination = {
    totalElements: searchApi.data?.totalElements || 0,
    totalPages: searchApi.data?.totalPages || 0,
    currentPage: currentPage,
    hasNext: searchApi.data?.hasNext || false
  };

  const errorMessage = searchApi.error || (searchApi.data?.retCode !== undefined && searchApi.data?.retCode !== 0 ? searchApi.data?.retMsg : '');

  return (
    <section id="api-calls">
      <div className="page-header-container" style={{ marginBottom: '24px' }}>
        <h2>Danh sách Merchant</h2>
        <p className="section-description">
          Tìm kiếm và quản lý thông tin Merchant (Acquiring) trong hệ thống.
        </p>
      </div>

      <div className="search-section search-card">
        <ApiForm
          fields={searchFields}
          values={searchValues}
          onChange={setSearchValues}
          onSubmit={handleSearch}
        >
          <div className="form-navigation">
            <button 
              type="button" 
              className="back-button" 
              onClick={() => {
                setSearchValues(INITIAL_SEARCH_VALUES);
                handleSearch(INITIAL_SEARCH_VALUES);
              }}
              disabled={searchApi.loading}
            >
              Xóa bộ lọc
            </button>
            <button 
              className="submit-button" 
              type="submit"
              disabled={searchApi.loading}
            >
              {searchApi.loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>
        </ApiForm>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>Kết quả tìm kiếm</h3>
        <button className="submit-button small-btn" onClick={onAddMerchant}>Thêm mới</button>
      </div>

      <MerchantTable merchants={merchantData} onCreateContract={onCreateContract} onViewDetails={onViewDetails} />

      {merchantData.length > 0 && (
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
