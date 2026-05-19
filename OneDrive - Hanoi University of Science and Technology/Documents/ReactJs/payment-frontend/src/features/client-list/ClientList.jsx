import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../services/clientApi';
import { branchService } from '../../services/branchApi';
import { useApi } from '../../hooks/useApi';
import ApiForm from '../../components/common/ApiForm';
import ClientTable from './components/ClientTable';
import Pagination from './components/Pagination';

const INITIAL_SEARCH_VALUES = {
  shortName: '',
  phoneNumber: '',
  clientNumber: '',
  itn: '',
  branchCode: ''
};

export default function ClientList({ onCreateContract }) {
  const [searchValues, setSearchValues] = useState(INITIAL_SEARCH_VALUES);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  const searchApi = useApi(clientService.search);
  const branchesApi = useApi(branchService.getAll);

  const fetchClients = useCallback(async (page = 0, filters = searchValues) => {
    const params = {
      ...filters,
      page,
      size: pageSize,
      sort: 'id,desc'
    };
    // Remove empty strings from params
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key];
    });

    try {
      await searchApi.execute(params);
    } catch (err) {
      console.error('Fetch clients error:', err);
    }
  }, [searchValues, pageSize, searchApi]);

  useEffect(() => {
    branchesApi.execute();
    fetchClients(0, INITIAL_SEARCH_VALUES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (values) => {
    setSearchValues(values);
    setCurrentPage(0);
    fetchClients(0, values);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchClients(newPage, searchValues);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchFields = [
    { name: 'shortName', label: 'Tên khách hàng', placeholder: 'Nhập tên khách hàng' },
    { name: 'phoneNumber', label: 'Số điện thoại', placeholder: 'Nhập số điện thoại' },
    { name: 'clientNumber', label: 'Mã khách hàng', placeholder: 'Nhập mã khách hàng' },
    { name: 'itn', label: 'Mã số thuế', placeholder: 'Nhập mã số thuế' },
    { 
      name: 'branchCode', 
      label: 'Chi nhánh', 
      type: 'select', 
      placeholder: 'Chọn chi nhánh',
      options: branchesApi.data?.map(b => ({ value: b.code, label: b.name })) || []
    }
  ];

  const clientData = searchApi.data?.retCode === 0 ? (searchApi.data?.data || []) : [];
  const pagination = {
    totalElements: searchApi.data?.totalElements || 0,
    totalPages: searchApi.data?.totalPages || 0,
    currentPage: currentPage,
    hasNext: searchApi.data?.hasNext || false
  };

  const errorMessage = searchApi.error || (searchApi.data?.retCode !== undefined && searchApi.data?.retCode !== 0 ? searchApi.data?.retMsg : '');

  return (
    <section id="api-calls">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Danh sách khách hàng</h2>
          <p className="section-description">
            Tìm kiếm và quản lý thông tin khách hàng trong hệ thống.
          </p>
        </div>
        <button className="submit-button" onClick={() => window.location.href = '#/client-registration'}>Mở CIF Mới</button>
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

      <ClientTable clients={clientData} onCreateContract={onCreateContract} />

      {clientData.length > 0 && (
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
