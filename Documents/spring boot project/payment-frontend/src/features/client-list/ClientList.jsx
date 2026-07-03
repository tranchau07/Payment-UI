import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../../services/clientApi';
import { branchService } from '../../services/branchApi';
import { useApi } from '../../hooks/useApi';
import ApiForm from '../../components/common/ApiForm';
import ClientTable from './components/ClientTable';
import Pagination from './components/Pagination';
import useI18n from '../../hooks/useI18n';

const INITIAL_SEARCH_VALUES = {
  shortName: '',
  phoneNumber: '',
  clientNumber: '',
  itn: '',
  branchCode: ''
};

export default function ClientList({ onCreateContract, onViewDetails, onAddClient }) {
  const { t } = useI18n();
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
    // Remove empty strings, null, or undefined from params
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
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
    { name: 'shortName', label: t('customer.name'), placeholder: t('customer.namePlaceholder') },
    { name: 'phoneNumber', label: t('customer.phone'), placeholder: t('customer.phonePlaceholder') },
    { name: 'clientNumber', label: t('customer.number'), placeholder: t('customer.numberPlaceholder') },
    { name: 'itn', label: t('customer.taxNumber'), placeholder: t('customer.taxPlaceholder') },
    { 
      name: 'branchCode', 
      label: t('customer.branch'),
      type: 'select', 
      placeholder: t('customer.branchPlaceholder'),
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
      <div className="page-header-container" style={{ marginBottom: '24px' }}>
        <h2>{t('nav.customers')}</h2>
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
              {t('common.clear')}
            </button>
            <button 
              className="submit-button" 
              type="submit"
              disabled={searchApi.loading}
            >
              {searchApi.loading ? t('common.searching') : t('common.search')}
            </button>
          </div>
        </ApiForm>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="table-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', marginTop: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--text-h)' }}>{t('common.searchResults')}</h3>
        <button className="submit-button add-new-button" onClick={onAddClient}>{t('common.addNew')}</button>
      </div>

      <ClientTable clients={clientData} onCreateContract={onCreateContract} onViewDetails={onViewDetails} />

      {clientData.length > 0 && (
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      )}
    </section>
  );
}
